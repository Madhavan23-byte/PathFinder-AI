"""
PathFinder Backend — Career Discovery Router

Provides career recommendation and selection endpoints powered by the
Career Discovery Engine. All scoring is transparent and explainable.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Dict, Any

from app.database import (
    profiles_collection,
    learner_models_collection,
    users_collection,
)
from app.core.security import get_current_user_id, sanitize_doc
from app.core.career_engine import recommend_careers, get_career_by_id

router = APIRouter(prefix="/api/career", tags=["Career"])


@router.get("/recommend")
def get_career_recommendations(user_id: str = Depends(get_current_user_id)):
    """
    Run the Career Discovery Engine against the user's learner profile.
    Returns ranked career recommendations with match percentages and explanations.
    """
    # Aggregate learner data from multiple collections
    profile = profiles_collection.find_one({"user_id": user_id})
    model = learner_models_collection.find_one({"user_id": user_id})
    user = users_collection.find_one({"id": user_id})

    if not profile:
        raise HTTPException(status_code=404, detail="Learner profile not found. Complete onboarding first.")

    # Build the unified learner profile for the engine
    learner_data = {
        "targetCareer": profile.get("targetCareer", user.get("targetCareer", "") if user else ""),
        "interests": profile.get("interests", profile.get("career_interests", [])),
        "skills": profile.get("skills", []),
        "skill_scores": {},
        "strongSkills": [],
        "weakSkills": [],
    }

    if model:
        learner_data["strongSkills"] = model.get("knowledge", {}).get("strongSkills", [])
        learner_data["weakSkills"] = model.get("knowledge", {}).get("weakSkills", [])

        # Build skill scores from assessment accuracy if available
        assessment_score = model.get("ability", {}).get("assessmentAccuracy", 0)
        if assessment_score > 0:
            # Map overall assessment to skill approximations
            for sk in learner_data["strongSkills"]:
                learner_data["skill_scores"][sk.lower().replace(" ", "_")] = min(assessment_score + 10, 100)
            for sk in learner_data["weakSkills"]:
                learner_data["skill_scores"][sk.lower().replace(" ", "_")] = max(assessment_score - 20, 0)

    # Also incorporate self-declared skills from onboarding
    for skill_entry in learner_data["skills"]:
        skill_name = skill_entry.get("name", "").lower().replace(" ", "_")
        skill_level = skill_entry.get("level", 50)
        if skill_name and skill_name not in learner_data["skill_scores"]:
            learner_data["skill_scores"][skill_name] = skill_level

    recommendations = recommend_careers(learner_data, top_n=6)

    return {
        "recommendations": recommendations,
        "basedOn": {
            "selfDeclaredSkills": len(learner_data["skills"]),
            "assessmentComplete": bool(model and model.get("ability", {}).get("totalAttempts", 0) > 0),
            "targetCareer": learner_data["targetCareer"],
            "totalCareersEvaluated": 9,
        }
    }


@router.post("/select")
def select_career(
    data: Dict[str, Any],
    user_id: str = Depends(get_current_user_id),
):
    """
    User selects a career. Updates their profile and triggers roadmap regeneration.
    """
    career_id = data.get("careerId", "")
    career_title = data.get("careerTitle", "")

    if not career_title and career_id:
        career = get_career_by_id(career_id)
        career_title = career.get("title", "Machine Learning Engineer")

    if not career_title:
        raise HTTPException(status_code=400, detail="careerId or careerTitle is required.")

    # Update user profile
    profiles_collection.update_one(
        {"user_id": user_id},
        {"$set": {"targetCareer": career_title, "career_goal": career_title}},
        upsert=True,
    )
    users_collection.update_one(
        {"id": user_id},
        {"$set": {"targetCareer": career_title}},
    )

    # Trigger roadmap regeneration with the skill graph
    _regenerate_roadmap(user_id, career_title)

    return {
        "success": True,
        "selectedCareer": career_title,
        "message": f"Career goal updated to '{career_title}'. Your personalized roadmap has been regenerated.",
    }


@router.get("/detail/{career_id}")
def get_career_detail(career_id: str, user_id: str = Depends(get_current_user_id)):
    """Get detailed information about a specific career."""
    career = get_career_by_id(career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found.")
    return career


def _regenerate_roadmap(user_id: str, career_title: str):
    """Regenerate the learner's roadmap using the skill graph engine."""
    from app.database import roadmaps_collection, skill_gaps_collection, learner_models_collection
    from app.core.skill_graph import generate_learning_path

    model = learner_models_collection.find_one({"user_id": user_id})
    skill_scores = {}
    if model:
        # Build skill scores from the learner model
        assessment_score = model.get("ability", {}).get("assessmentAccuracy", 50)
        strong_skills = model.get("knowledge", {}).get("strongSkills", [])
        weak_skills = model.get("knowledge", {}).get("weakSkills", [])
        for sk in strong_skills:
            skill_scores[sk.lower().replace(" ", "_")] = min(assessment_score + 10, 100)
        for sk in weak_skills:
            skill_scores[sk.lower().replace(" ", "_")] = max(assessment_score - 25, 10)

    path = generate_learning_path(career_title, skill_scores)

    if path:
        roadmaps_collection.delete_many({"user_id": user_id})
        new_roadmap = []
        for i, item in enumerate(path):
            item["user_id"] = user_id
            item["id"] = f"rd_{i+1:02d}"
            item["order"] = i + 1
            item["resourcesCount"] = max(3, min(8, item.get("estimatedHours", 10) // 3))
            new_roadmap.append(item)
        if new_roadmap:
            roadmaps_collection.insert_many(new_roadmap)
