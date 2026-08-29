"""
PathFinder Backend — Pydantic Request/Response Schemas
All data models used for validating API request bodies.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr


class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordSchema(BaseModel):
    email: EmailStr


class ResetPasswordSchema(BaseModel):
    token: str
    password: str


class ProfileUpdateSchema(BaseModel):
    name: Optional[str] = None
    education: Optional[str] = None
    targetCareer: Optional[str] = None
    career_goal: Optional[str] = None
    learning_preferences: Optional[List[str]] = None
    weekly_availability: Optional[Dict[str, Any]] = None
    target_completion_date: Optional[str] = None


class AssessmentSubmitSchema(BaseModel):
    answers: Dict[str, int]


class PracticeSubmitSchema(BaseModel):
    questionId: str
    selectedIndex: int


class ChatSchema(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
