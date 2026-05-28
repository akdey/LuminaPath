import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from models import UserSession, Roadmap, Task, Resource, Assessment, MCQ, GapAnalysis
import json

def create_roadmap(db: Session, session_id: str, topic_name: str, tasks_data: list):
    user_session = db.query(UserSession).filter(UserSession.id == session_id).first()
    if not user_session:
        user_session = UserSession(id=session_id)
        db.add(user_session)
        db.commit()
        db.refresh(user_session)

    roadmap = Roadmap(session_id=user_session.id, topic_name=topic_name, steps_count=len(tasks_data))
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    for idx, t_data in enumerate(tasks_data):
        task = Task(roadmap_id=roadmap.id, task_order=idx+1, title=t_data['title'], description=t_data['description'])
        db.add(task)
        db.commit()
        db.refresh(task)
        for r_data in t_data.get('resources', []):
            resource = Resource(task_id=task.id, url=r_data.get('url', ''), title=r_data.get('title', ''), source=r_data.get('source', 'Unknown'), type=r_data.get('type', 'link'))
            db.add(resource)
    db.commit()
    return roadmap

def get_task(db: Session, task_id: str):
    return db.query(Task).filter(Task.id == task_id).first()

import datetime

def complete_task(db: Session, task_id: str):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        task.completed_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(task)
    return task

def get_assessment(db: Session, assessment_id: str):
    return db.query(Assessment).filter(Assessment.id == assessment_id).first()

def create_assessment(db: Session, task_id: str, mcqs_data: list):
    assessment = Assessment(task_id=task_id)
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    for m_data in mcqs_data:
        mcq = MCQ(assessment_id=assessment.id, question=m_data['question'], options_json=json.dumps(m_data['options']), correct_answer=m_data['correct_answer'], explanation=m_data.get('explanation', ''))
        db.add(mcq)
    db.commit()
    return assessment

def create_gap_analysis(db: Session, assessment_id: str, gap_data: dict):
    from sqlalchemy.exc import IntegrityError
    try:
        gap = GapAnalysis(
            assessment_id=assessment_id, 
            weak_concepts_json=json.dumps(gap_data.get('weak_concepts', [])), 
            recommendations_json=json.dumps(gap_data.get('recommendations', [])),
            topic_performance_json=json.dumps(gap_data.get('topic_performance', [])),
            detailed_review_json=json.dumps(gap_data.get('detailed_review', []))
        )
        db.add(gap)
        db.commit()
        db.refresh(gap)
        return gap
    except IntegrityError:
        db.rollback()
        return db.query(GapAnalysis).filter(GapAnalysis.assessment_id == assessment_id).first()
