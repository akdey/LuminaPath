import uuid
import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    
    sessions = relationship("UserSession", back_populates="user")

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    last_activity = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    device_info = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="sessions")
    roadmaps = relationship("Roadmap", back_populates="session")

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("user_sessions.id"), nullable=False)
    topic_name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    steps_count = Column(Integer, default=0)
    metadata_json = Column(Text, nullable=True)

    session = relationship("UserSession", back_populates="roadmaps")
    tasks = relationship("Task", back_populates="roadmap")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    roadmap_id = Column(String, ForeignKey("roadmaps.id"), nullable=False)
    task_order = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

    roadmap = relationship("Roadmap", back_populates="tasks")
    resources = relationship("Resource", back_populates="task")
    assessments = relationship("Assessment", back_populates="task")

class Resource(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True, default=generate_uuid)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=False)
    url = Column(String, nullable=False)
    title = Column(String, nullable=False)
    source = Column(String, nullable=False)
    type = Column(String, nullable=False)
    metadata_json = Column(Text, nullable=True)

    task = relationship("Task", back_populates="resources")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=generate_uuid)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=False)
    taken_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    score = Column(Integer, nullable=True)
    attempts = Column(Integer, default=1)
    submitted_at = Column(DateTime, nullable=True)
    metadata_json = Column(Text, nullable=True)

    task = relationship("Task", back_populates="assessments")
    mcqs = relationship("MCQ", back_populates="assessment")
    gap_analysis = relationship("GapAnalysis", back_populates="assessment", uselist=False)

class MCQ(Base):
    __tablename__ = "mcqs"

    id = Column(String, primary_key=True, default=generate_uuid)
    assessment_id = Column(String, ForeignKey("assessments.id"), nullable=False)
    question = Column(String, nullable=False)
    options_json = Column(Text, nullable=False)
    correct_answer = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=True)

    assessment = relationship("Assessment", back_populates="mcqs")

class GapAnalysis(Base):
    __tablename__ = "gap_analyses"

    id = Column(String, primary_key=True, default=generate_uuid)
    assessment_id = Column(String, ForeignKey("assessments.id"), nullable=False, unique=True)
    weak_concepts_json = Column(Text, nullable=False)
    recommendations_json = Column(Text, nullable=False)
    topic_performance_json = Column(Text, nullable=True)
    detailed_review_json = Column(Text, nullable=True)
    generated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

    assessment = relationship("Assessment", back_populates="gap_analysis")
