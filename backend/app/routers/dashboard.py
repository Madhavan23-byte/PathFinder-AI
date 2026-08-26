"""
PathFinder Backend — Dashboard Router
Aggregates data from multiple collections to power the main dashboard.
"""
from fastapi import APIRouter, Depends

from backend.app.database import (
    profiles_collection,
    learner_models_collection,
    progress_collection,
    recommendations_collection,
    roadmaps_collection,
    skill_gaps_collection,
)
from backend.app.core.security import get_current_user_id, sanitize_doc

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/dashboard")
def get_dashboard(user_id: str = Depends(get_current_user_id)):
    profile = profiles_collection.find_one({"user_id": user_id})
    progress = progress_collection.find_one({"user_id": user_id})
    recs = list(recommendations_collection.find({"user_id": user_id}))
    roadmaps = list(roadmaps_collection.find({"user_id": user_id}))
    skill_gaps = list(skill_gaps_collection.find({"user_id": user_id}))

    target_career = profile.get("targetCareer", "Machine Learning Engineer") if profile else "Machine Learning Engineer"
    career_readiness = progress.get("careerReadiness", 0) if progress else 0

    primary_rec = sanitize_doc(recs[0]) if recs else None
    sanitized_roadmaps = [sanitize_doc(r) for r in roadmaps[:4]]

    skills_overview = (
        [{"name": sg.get("skillName", "Skill"), "current": sg.get("currentLevel", 0), "required": sg.get("requiredLevel", 80)} for sg in skill_gaps]
        if skill_gaps
        else [
            {"name": "Python", "current": 0, "required": 85},
            {"name": "SQL", "current": 0, "required": 75},
            {"name": "Statistics", "current": 0, "required": 80},
            {"name": "ML Alg", "current": 0, "required": 85},
            {"name": "Evaluation", "current": 0, "required": 80},
        ]
    )

    return {
        "targetCareer": target_career,
        "careerReadiness": career_readiness,
        "currentFocus": primary_rec.get("skillGapClosed", "Diagnostic Assessment") if primary_rec else "Take initial diagnostic assessment",
        "roadmapProgress": 0 if not roadmaps else int(len([r for r in roadmaps if r.get("status") == "completed"]) / max(len(roadmaps), 1) * 100),
        "completedPhases": len([r for r in roadmaps if r.get("status") == "completed"]),
        "totalPhases": len(roadmaps) if roadmaps else 4,
        "streakDays": progress.get("streakDays", 0) if progress else 0,
        "primaryRecommendation": primary_rec,
        "skillsOverview": skills_overview,
        "recentRoadmap": sanitized_roadmaps,
        "plannedHours": progress.get("plannedWeeklyHours", 10) if progress else 10,
        "actualHours": progress.get("actualWeeklyHours", 0.0) if progress else 0.0,
    }
