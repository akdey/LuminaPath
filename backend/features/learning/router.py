from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any

from core.database import get_db
from db import crud
from models import Roadmap, Assessment, GapAnalysis, UserSession, Task
from sqlalchemy import desc
from features.learning.agent import generate_learning_path

from core.security import get_current_user

router = APIRouter()

class TopicRequest(BaseModel):
    topic: str

class PathResponse(BaseModel):
    roadmap_id: str
    topic_name: str
    tasks: List[Dict[str, Any]]

@router.post("/generate-path", response_model=PathResponse)
async def generate_path(request: TopicRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    tasks_data = await generate_learning_path(request.topic)
    if not tasks_data:
        raise HTTPException(status_code=500, detail="Failed to generate learning path")
    
    roadmap = crud.create_roadmap(db, current_user["session_id"], request.topic, tasks_data)
    
    tasks = []
    for t in roadmap.tasks:
        tasks.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None,
            "resources": [{"title": r.title, "url": r.url, "source": r.source, "type": r.type} for r in t.resources]
        })
    return {"roadmap_id": roadmap.id, "topic_name": roadmap.topic_name, "tasks": tasks}

@router.put("/task/{task_id}/complete")
def complete_task(task_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    task = crud.complete_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"status": "success", "completed_at": task.completed_at.isoformat()}

@router.get("/path/{roadmap_id}", response_model=PathResponse)
def get_path(roadmap_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    tasks = []
    for t in roadmap.tasks:
        tasks.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None,
            "resources": [{"title": r.title, "url": r.url, "source": r.source, "type": r.type} for r in t.resources]
        })
    return {"roadmap_id": roadmap.id, "topic_name": roadmap.topic_name, "tasks": tasks}

class DashboardResponse(BaseModel):
    active_roadmaps: List[Dict[str, Any]]
    weak_concepts: List[str]

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    session_id = current_user["session_id"]
    
    # Get all roadmaps for the user's session, ordered by most recently created
    roadmaps = db.query(Roadmap).filter(Roadmap.session_id == session_id).order_by(desc(Roadmap.created_at)).all()
    
    active_roadmaps = []
    for r in roadmaps:
        completed_tasks = sum(1 for t in r.tasks if t.completed_at)
        total_tasks = r.steps_count or len(r.tasks)
        progress = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0
        
        # Check if the last task has a submitted assessment
        has_completed_assessment = False
        last_task_id = None
        if r.tasks:
            sorted_tasks = sorted(r.tasks, key=lambda t: t.task_order)
            last_task = sorted_tasks[-1]
            last_task_id = last_task.id
            for assessment in last_task.assessments:
                if assessment.submitted_at:
                    has_completed_assessment = True
                    break
        
        active_roadmaps.append({
            "id": r.id,
            "topic_name": r.topic_name,
            "progress_percentage": progress,
            "completed_tasks": completed_tasks,
            "total_tasks": total_tasks,
            "created_at": r.created_at.isoformat(),
            "has_completed_assessment": has_completed_assessment,
            "last_task_id": last_task_id
        })
        
    # Aggregate weak concepts from the user's past gap analyses
    weak_concepts = set()
    
    # We can join GapAnalysis -> Assessment -> Task -> Roadmap -> UserSession
    # But since assessments are tied to tasks, let's just query gap analyses where the assessment's task's roadmap's session matches
    gap_analyses = db.query(GapAnalysis).join(Assessment).join(Assessment.task).join(Task.roadmap).filter(Roadmap.session_id == session_id).all()
    
    import json
    for gap in gap_analyses:
        if gap.weak_concepts_json:
            try:
                concepts = json.loads(gap.weak_concepts_json)
                for c in concepts:
                    weak_concepts.add(c)
            except:
                pass
                
    return {
        "active_roadmaps": active_roadmaps,
        "weak_concepts": list(weak_concepts)[:10]  # Limit to top 10 unique weak concepts
    }
