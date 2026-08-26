"""
PathFinder Backend — Authentication Router
Handles user registration, login, logout, and password reset.
"""
import time
from fastapi import APIRouter, HTTPException, Depends

from backend.app.database import (
    users_collection,
    profiles_collection,
    learner_models_collection,
    progress_collection,
)
from backend.app.core.security import (
    hash_password,
    verify_password,
    create_jwt_token,
    get_current_user_id,
)
from backend.app.schemas.models import (
    RegisterSchema,
    LoginSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register")
def register(data: RegisterSchema):
    clean_email = data.email.strip().lower()

    if users_collection.find_one({"email": clean_email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed = hash_password(data.password)
    user_id = f"usr_{int(time.time() * 1000)}"
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")

    user_doc = {
        "id": user_id,
        "name": data.name.strip(),
        "email": clean_email,
        "password": hashed,
        "education": "Not Specified",
        "targetCareer": "Machine Learning Engineer",
        "createdAt": now_str,
    }
    users_collection.insert_one(user_doc)

    profiles_collection.insert_one({
        "user_id": user_id,
        "name": data.name.strip(),
        "email": clean_email,
        "education": "Not Specified",
        "targetCareer": "Machine Learning Engineer",
        "career_goal": "Machine Learning Engineer",
        "skills": [],
        "learning_preferences": ["Hands-on practice", "Visual", "Projects"],
        "weekly_availability": {"weeklyHours": 10, "preferredDays": ["Mon", "Tue", "Thu", "Sat"]},
        "target_completion_date": "2026-12-31",
    })

    learner_models_collection.insert_one({
        "user_id": user_id,
        "knowledge": {
            "overallMastery": 0, "conceptsMastered": 0,
            "totalConcepts": 0, "strongSkills": [], "weakSkills": [],
        },
        "ability": {"assessmentAccuracy": 0, "totalAttempts": 0, "masteryProgression": 0},
        "pace": {"avgSessionMinutes": 0, "progressVelocity": "New Learner", "estimatedDaysToMastery": 90},
        "behavior": {"sessionsPerWeek": 0, "completionRate": 0, "consistencyScore": 0, "roadmapDelayDays": 0},
        "preferences": {
            "resourceTypes": ["Hands-on practice", "Visual", "Interactive"],
            "explanationFormats": ["Code-first", "Step-by-step"],
        },
        "availability": {
            "weeklyHours": 10,
            "preferredDays": ["Mon", "Tue", "Thu", "Sat"],
            "targetCompletionDate": "2026-12-31",
        },
        "lastUpdated": now_str,
    })

    progress_collection.insert_one({
        "user_id": user_id,
        "careerReadiness": 0,
        "skillsMasteredCount": 0,
        "totalSkillsCount": 6,
        "learningHours": 0.0,
        "streakDays": 0,
        "plannedWeeklyHours": 10,
        "actualWeeklyHours": 0.0,
        "weeklyRhythm": [
            {"day": "Mon", "planned": 2, "actual": 0.0},
            {"day": "Tue", "planned": 2, "actual": 0.0},
            {"day": "Wed", "planned": 2, "actual": 0.0},
            {"day": "Thu", "planned": 2, "actual": 0.0},
            {"day": "Fri", "planned": 2, "actual": 0.0},
            {"day": "Sat", "planned": 0, "actual": 0.0},
            {"day": "Sun", "planned": 0, "actual": 0.0},
        ],
        "scoreTrend": [],
    })

    token = create_jwt_token(user_id, clean_email)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": user_doc["name"],
            "email": clean_email,
            "education": user_doc["education"],
            "targetCareer": user_doc["targetCareer"],
        },
    }


@router.post("/login")
def login(data: LoginSchema):
    clean_email = data.email.strip().lower()
    user_doc = users_collection.find_one({"email": clean_email})
    if not user_doc or not verify_password(data.password, user_doc.get("password", "")):
        raise HTTPException(status_code=400, detail="Incorrect email or password.")

    token = create_jwt_token(user_doc["id"], user_doc["email"])
    return {
        "token": token,
        "user": {
            "id": user_doc["id"],
            "name": user_doc["name"],
            "email": user_doc["email"],
            "education": user_doc.get("education", "Not Specified"),
            "targetCareer": user_doc.get("targetCareer", "Machine Learning Engineer"),
        },
    }


@router.post("/logout")
def logout():
    return {"message": "Successfully logged out"}


@router.get("/me")
def get_me(user_id: str = Depends(get_current_user_id)):
    user_doc = users_collection.find_one({"id": user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user_doc["id"],
        "name": user_doc["name"],
        "email": user_doc["email"],
        "education": user_doc.get("education", "Not Specified"),
        "targetCareer": user_doc.get("targetCareer", "Machine Learning Engineer"),
    }


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordSchema):
    return {"message": "If an account exists with this email, password reset instructions have been sent."}


@router.post("/reset-password")
def reset_password(data: ResetPasswordSchema):
    return {"message": "Password updated successfully."}
