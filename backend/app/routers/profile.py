"""
PathFinder Backend — Profile Router
Handles learner profile retrieval and updates.
"""
from fastapi import APIRouter, Depends

from backend.app.database import users_collection, profiles_collection
from backend.app.core.security import get_current_user_id, sanitize_doc
from backend.app.schemas.models import ProfileUpdateSchema
from backend.app.routers.auth import get_me

router = APIRouter(prefix="/api", tags=["Profile"])


@router.get("/profile")
def get_profile(user_id: str = Depends(get_current_user_id)):
    user_info = get_me(user_id)
    prof = profiles_collection.find_one({"user_id": user_id})
    if not prof:
        return {
            "user": user_info,
            "education": "Not Specified",
            "targetCareer": "Machine Learning Engineer",
            "career_goal": "Machine Learning Engineer",
            "skills": [],
            "learning_preferences": ["Hands-on practice", "Visual"],
            "weekly_availability": {"weeklyHours": 10, "preferredDays": ["Mon", "Wed", "Fri"]},
            "target_completion_date": "2026-12-31",
        }
    sanitized = sanitize_doc(prof)
    sanitized["user"] = user_info
    return sanitized


@router.put("/profile")
def update_profile(data: ProfileUpdateSchema, user_id: str = Depends(get_current_user_id)):
    updates = {}
    if data.name:
        users_collection.update_one({"id": user_id}, {"$set": {"name": data.name}})
        updates["name"] = data.name
    if data.education:
        users_collection.update_one({"id": user_id}, {"$set": {"education": data.education}})
        updates["education"] = data.education
    if data.targetCareer:
        users_collection.update_one({"id": user_id}, {"$set": {"targetCareer": data.targetCareer}})
        updates["targetCareer"] = data.targetCareer
        updates["career_goal"] = data.targetCareer
    if data.learning_preferences is not None:
        updates["learning_preferences"] = data.learning_preferences
    if data.weekly_availability is not None:
        updates["weekly_availability"] = data.weekly_availability
    if data.target_completion_date is not None:
        updates["target_completion_date"] = data.target_completion_date

    if updates:
        profiles_collection.update_one({"user_id": user_id}, {"$set": updates}, upsert=True)

    return get_profile(user_id)
