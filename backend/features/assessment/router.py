import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any

from core.database import get_db
from db import crud
from features.assessment.examiner import generate_mcqs
from features.assessment.evaluator import generate_gap_analysis
from core.security import get_current_user

router = APIRouter()

class QuizRequest(BaseModel):
    task_id: str

class QuizResponse(BaseModel):
    assessment_id: str
    mcqs: List[Dict[str, Any]]

class GapAnalysisRequest(BaseModel):
    assessment_id: str
    answers: Dict[str, int] = {}

class GapAnalysisResponse(BaseModel):
    gap_analysis_id: str
    score: int
    weak_concepts: List[str]
    recommendations: List[Dict[str, Any]]
    topic_performance: List[Dict[str, Any]]
    detailed_review: List[Dict[str, Any]]

@router.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    task = crud.get_task(db, request.task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # Check if assessment already exists for this task
    from models import Assessment
    existing_assessment = db.query(Assessment).filter(Assessment.task_id == task.id).first()
    
    # If the assessment exists and it DOES NOT have a gap analysis yet, let the user resume it
    if existing_assessment and not existing_assessment.gap_analysis:
        return get_quiz(existing_assessment.id, db, current_user)
        
    # If it exists and HAS a gap analysis, we just return it anyway because we don't have "retake" logic fully defined. 
    # The frontend will hit this endpoint, see it exists, load it, and since it's already complete, they will likely just go to the Gap Analysis view.
    if existing_assessment and existing_assessment.gap_analysis:
         # Actually, we shouldn't return it as a "new quiz". But wait, the frontend currently expects a quiz ID.
         # KnowledgeValidation.jsx will fetch it, but it doesn't check if it's already done until submitting.
         return get_quiz(existing_assessment.id, db, current_user)
    
    mcqs_data = await generate_mcqs(task.title, task.description)
    if not mcqs_data:
        raise HTTPException(status_code=500, detail="Failed to generate MCQs")
        
    assessment = crud.create_assessment(db, task.id, mcqs_data)
    
    mcqs = []
    for m in assessment.mcqs:
        mcqs.append({
            "id": m.id,
            "question": m.question,
            "options": json.loads(m.options_json),
            "correct_answer": m.correct_answer,
            "explanation": m.explanation
        })
    return {"assessment_id": assessment.id, "mcqs": mcqs}

@router.get("/quiz/{assessment_id}", response_model=QuizResponse)
def get_quiz(assessment_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    assessment = crud.get_assessment(db, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    mcqs = []
    for m in assessment.mcqs:
        mcqs.append({
            "id": m.id,
            "question": m.question,
            "options": json.loads(m.options_json),
            "correct_answer": m.correct_answer,
            "explanation": m.explanation
        })
    return {"assessment_id": assessment.id, "mcqs": mcqs}


@router.post("/analyze-gaps", response_model=GapAnalysisResponse)
async def analyze_gaps(request: GapAnalysisRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    assessment = crud.get_assessment(db, request.assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    if assessment.gap_analysis:
        return {
            "gap_analysis_id": assessment.gap_analysis.id,
            "score": assessment.score or 0,
            "weak_concepts": json.loads(assessment.gap_analysis.weak_concepts_json) if assessment.gap_analysis.weak_concepts_json else [],
            "recommendations": json.loads(assessment.gap_analysis.recommendations_json) if assessment.gap_analysis.recommendations_json else [],
            "topic_performance": json.loads(assessment.gap_analysis.topic_performance_json) if assessment.gap_analysis.topic_performance_json else [],
            "detailed_review": json.loads(assessment.gap_analysis.detailed_review_json) if assessment.gap_analysis.detailed_review_json else []
        }
        
    assessment_data = {
        "score": assessment.score,
        "mcqs": [],
        "user_answers": request.answers
    }
    
    # Calculate score based on answers if score is not set
    calculated_score = 0
    
    for i, m in enumerate(assessment.mcqs):
        is_correct = False
        user_answer = request.answers.get(str(i))
        if user_answer is not None and user_answer == m.correct_answer:
            calculated_score += 1
            is_correct = True
            
        assessment_data["mcqs"].append({
            "question": m.question,
            "options": json.loads(m.options_json),
            "correct_answer_index": m.correct_answer,
            "user_answer_index": user_answer,
            "is_correct": is_correct,
            "explanation": m.explanation
        })
    
    if assessment.score is None:
        assessment.score = int((calculated_score / len(assessment.mcqs)) * 10) if assessment.mcqs else 0
        db.commit()
        assessment_data["score"] = assessment.score
        
    gap_data = await generate_gap_analysis(assessment_data)
    # Ensure score from AI matches or uses our calculated score
    gap_data["score"] = assessment.score
    
    gap = crud.create_gap_analysis(db, assessment.id, gap_data)
    
    return {
        "gap_analysis_id": gap.id,
        "score": assessment.score or 0,
        "weak_concepts": json.loads(gap.weak_concepts_json) if gap.weak_concepts_json else [],
        "recommendations": json.loads(gap.recommendations_json) if gap.recommendations_json else [],
        "topic_performance": json.loads(gap.topic_performance_json) if gap.topic_performance_json else [],
        "detailed_review": json.loads(gap.detailed_review_json) if gap.detailed_review_json else []
    }

@router.get("/gaps/{assessment_id}", response_model=GapAnalysisResponse)
def get_gaps(assessment_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    assessment = crud.get_assessment(db, assessment_id)
    if not assessment or not assessment.gap_analysis:
        raise HTTPException(status_code=404, detail="Gap analysis not found")
        
    return {
        "gap_analysis_id": assessment.gap_analysis.id,
        "score": assessment.score or 0,
        "weak_concepts": json.loads(assessment.gap_analysis.weak_concepts_json) if assessment.gap_analysis.weak_concepts_json else [],
        "recommendations": json.loads(assessment.gap_analysis.recommendations_json) if assessment.gap_analysis.recommendations_json else [],
        "topic_performance": json.loads(assessment.gap_analysis.topic_performance_json) if assessment.gap_analysis.topic_performance_json else [],
        "detailed_review": json.loads(assessment.gap_analysis.detailed_review_json) if assessment.gap_analysis.detailed_review_json else []
    }
