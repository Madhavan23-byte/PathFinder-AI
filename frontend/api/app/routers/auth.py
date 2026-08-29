"""
PathFinder Backend — Authentication Router
Handles user registration, login, logout, and password reset.
"""
import time
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header

from app.database import (
    users_collection,
    profiles_collection,
    learner_models_collection,
    progress_collection,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_jwt_token,
    get_current_user_id,
)
from app.schemas.models import (
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
def logout(authorization: str = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        from app.database import db
        token_blocklist_collection = db["token_blocklist"]
        if not token_blocklist_collection.find_one({"token": token}):
            token_blocklist_collection.insert_one({
                "token": token,
                "revokedAt": time.strftime("%Y-%m-%d %H:%M:%S")
            })
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
    clean_email = data.email.strip().lower()
    user_doc = users_collection.find_one({"email": clean_email})
    if user_doc:
        import secrets
        reset_token = secrets.token_urlsafe(32)
        from app.database import db
        password_resets_collection = db["password_resets"]
        password_resets_collection.update_one(
            {"email": clean_email},
            {"$set": {
                "token": reset_token,
                "expiresAt": int(time.time()) + 3600
            }},
            upsert=True
        )
        print(f"[RESET TOKEN FOR {clean_email}]: {reset_token}")
        
    return {"message": "If an account exists with this email, password reset instructions have been sent."}


@router.post("/reset-password")
def reset_password(data: ResetPasswordSchema):
    from app.database import db
    password_resets_collection = db["password_resets"]
    
    reset_doc = password_resets_collection.find_one({"token": data.token})
    if not reset_doc or reset_doc.get("expiresAt", 0) < int(time.time()):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
        
    hashed = hash_password(data.password)
    users_collection.update_one(
        {"email": reset_doc["email"]},
        {"$set": {"password": hashed}}
    )
    password_resets_collection.delete_one({"token": data.token})
    
    return {"message": "Password updated successfully."}
