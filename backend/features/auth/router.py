from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Dict, Any

from core.database import get_db
from models import User, UserSession
from core.security import get_password_hash, verify_password, create_access_token
import uuid

router = APIRouter()

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    session_id: str

@router.post("/register", response_model=TokenResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    session_id = str(uuid.uuid4())
    user_session = UserSession(id=session_id, user_id=new_user.id)
    db.add(user_session)
    db.commit()
    
    access_token = create_access_token(data={"sub": new_user.email, "session_id": session_id})
    return {"access_token": access_token, "token_type": "bearer", "session_id": session_id}

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    session_id = str(uuid.uuid4())
    user_session = UserSession(id=session_id, user_id=user.id)
    db.add(user_session)
    db.commit()
    
    access_token = create_access_token(data={"sub": user.email, "session_id": session_id})
    return {"access_token": access_token, "token_type": "bearer", "session_id": session_id}
