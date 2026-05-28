import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import ChatPromptTemplate
from core.logger import get_logger
from core.llm import client

logger = get_logger(__name__)

class TopicPerformance(BaseModel):
    topic: str = Field(description="Name of the sub-topic")
    percentage: int = Field(description="Score percentage for this topic (0-100)")

class ReviewItem(BaseModel):
    question: str = Field(description="The question text")
    user_answer: str = Field(description="What the user answered")
    correct_answer: str = Field(description="The actual correct answer")
    is_correct: bool = Field(description="Whether the user was correct")
    ai_insight: str = Field(description="A brief, personalized explanation acting as a digital tutor explaining the misconception or confirming their understanding.")

class Recommendation(BaseModel):
    title: str = Field(description="Title of the recommendation")
    description: str = Field(description="Description of what to review")
    type: str = Field(description="E.g., RE-WATCH MODULE, NEW RESOURCE, SUPPLEMENTARY READ")
    url: str = Field(description="URL to a relevant resource. Use real youtube links if possible.")

class GapAnalysisOutput(BaseModel):
    score: int = Field(description="Total score out of 10")
    topic_performance: List[TopicPerformance] = Field(description="Performance breakdown by topic")
    detailed_review: List[ReviewItem] = Field(description="Detailed review of every question")
    weak_concepts: List[str] = Field(description="List of identified weak concepts")
    recommendations: List[Recommendation] = Field(description="Actionable recommendations")

async def generate_gap_analysis(assessment_data: dict):
    system_prompt = """You are an expert educational evaluator and digital tutor. You will receive an assessment containing questions, the correct answers, and the user's selected answers.
Perform a comprehensive gap analysis.
1. Calculate their score (total correct / total questions * 10 or similar).
2. Categorize the questions into 3-4 sub-topics and calculate their percentage score for each topic.
3. Provide a detailed review for EACH question. If the user was incorrect, provide a gentle 'ai_insight' explaining their misconception.
4. Identify their weak concepts.
5. Provide actionable recommendations (including youtube links if applicable)."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Assessment Data:\n{assessment_data}")
    ])
    
    structured_llm = client.with_structured_output(GapAnalysisOutput)
    chain = prompt | structured_llm

    logger.info("Generating Rich Gap Analysis...")
    try:
        response = await chain.ainvoke({
            "assessment_data": json.dumps(assessment_data)
        })
        
        logger.info("Successfully generated Rich Gap Analysis.")
        return {
            "score": response.score,
            "topic_performance": [t.model_dump() for t in response.topic_performance],
            "detailed_review": [r.model_dump() for r in response.detailed_review],
            "weak_concepts": response.weak_concepts,
            "recommendations": [r.model_dump() for r in response.recommendations]
        }
    except Exception as e:
        logger.error(f"Langchain Groq Error in Gap Analysis: {e}")
        return {
            "score": 0,
            "topic_performance": [],
            "detailed_review": [],
            "weak_concepts": [],
            "recommendations": []
        }
