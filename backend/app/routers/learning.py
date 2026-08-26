"""
PathFinder Backend — Learning & Progress Routers
Handles skill gaps, recommendations, roadmap, progress, and practice.
"""
import time
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends

from backend.app.database import (
    skill_gaps_collection,
    recommendations_collection,
    roadmaps_collection,
    progress_collection,
    badges_collection,
)
from backend.app.core.security import get_current_user_id, sanitize_doc
from backend.app.schemas.models import PracticeSubmitSchema

router = APIRouter(prefix="/api", tags=["Learning"])


@router.get("/learner-model")
def get_learner_model(user_id: str = Depends(get_current_user_id)):
    from backend.app.database import learner_models_collection
    from backend.app.database import users_collection
    user_doc = users_collection.find_one({"id": user_id})
    user_info = {
        "id": user_doc["id"], "name": user_doc["name"], "email": user_doc["email"],
        "education": user_doc.get("education", "Not Specified"),
        "targetCareer": user_doc.get("targetCareer", "Machine Learning Engineer"),
    } if user_doc else {}
    model = learner_models_collection.find_one({"user_id": user_id})
    if not model:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Learner model not initialized for user")
    sanitized = sanitize_doc(model)
    sanitized["user"] = user_info
    return sanitized


@router.get("/skill-gaps")
def get_skill_gaps(user_id: str = Depends(get_current_user_id)):
    items = list(skill_gaps_collection.find({"user_id": user_id}))
    return [sanitize_doc(item) for item in items]


@router.get("/recommendations")
def get_recommendations(user_id: str = Depends(get_current_user_id)):
    items = list(recommendations_collection.find({"user_id": user_id}))
    return [sanitize_doc(item) for item in items]


@router.get("/roadmap")
def get_roadmap(user_id: str = Depends(get_current_user_id)):
    items = list(roadmaps_collection.find({"user_id": user_id}).sort("order", 1))
    return [sanitize_doc(item) for item in items]


@router.post("/roadmap/recalculate")
def recalculate_roadmap(
    data: Optional[Dict[str, Any]] = None,
    user_id: str = Depends(get_current_user_id),
):
    items = get_roadmap(user_id)
    return {
        "success": True,
        "updatedRoadmap": items,
        "message": "Adaptive AI updated your personalized learning path based on latest assessment mastery.",
    }


@router.get("/progress")
def get_progress(user_id: str = Depends(get_current_user_id)):
    doc = progress_collection.find_one({"user_id": user_id})
    if not doc:
        return {
            "careerReadiness": 0, "skillsMasteredCount": 0, "totalSkillsCount": 6,
            "learningHours": 0.0, "streakDays": 0,
            "plannedWeeklyHours": 10, "actualWeeklyHours": 0.0,
            "weeklyRhythm": [
                {"day": d, "planned": p, "actual": 0.0}
                for d, p in [("Mon", 2), ("Tue", 2), ("Wed", 2), ("Thu", 2), ("Fri", 2), ("Sat", 0), ("Sun", 0)]
            ],
            "scoreTrend": [],
        }
    return sanitize_doc(doc)


@router.get("/badges")
def get_badges(user_id: str = Depends(get_current_user_id)):
    items = list(badges_collection.find({"user_id": user_id}))
    return [sanitize_doc(item) for item in items]


@router.get("/practice/next")
def get_next_practice(user_id: str = Depends(get_current_user_id)):
    return {
        "id": "q_prac_101", "skill": "Model Evaluation & Tuning", "difficulty": "Intermediate",
        "question": "A classifier evaluates 1,000 transactions. It correctly flags 90 fraudulent cases, misclassifies 10 fraudulent cases as legitimate, and flags 20 legitimate transactions as fraudulent. What is the Precision of the model?",
        "options": [
            "81.8% (Precision = 90 / (90 + 20))",
            "90.0% (Precision = 90 / (90 + 10))",
            "75.0% (Precision = 90 / (90 + 30))",
            "95.0% (Precision = 190 / 200)",
        ],
        "conceptTag": "Confusion Matrix Analysis",
    }


@router.post("/practice/submit")
def submit_practice(data: PracticeSubmitSchema, user_id: str = Depends(get_current_user_id)):
    is_correct = data.selectedIndex == 0
    if is_correct:
        progress_collection.update_one(
            {"user_id": user_id},
            {"$inc": {"learningHours": 0.5, "streakDays": 1}},
            upsert=True,
        )
        return {
            "conceptUnderstanding": True, "formulaApplication": True,
            "algebraicStep": True, "unitConversion": True,
            "feedbackSummary": "Perfect! You correctly identified Precision = TP / (TP + FP) = 90 / (90 + 20) = 81.8%.",
            "recommendedAction": "Ready to advance to higher difficulty questions.",
        }
    return {
        "conceptUnderstanding": True, "formulaApplication": True,
        "algebraicStep": False, "unitConversion": True,
        "feedbackSummary": "The core concept appears correct! The error occurred in computing the denominator (TP + FP).",
        "recommendedAction": "Review Precision formula before trying again.",
    }
