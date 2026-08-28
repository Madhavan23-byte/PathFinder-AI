"""
PathFinder Backend — AI Teaching Router

Implements the AI Teaching Engine API:
  GET  /api/teach/topic/{skill_id}  — Get explanation, example, and question for a skill
  POST /api/teach/evaluate          — Submit student answer and receive structured feedback
  GET  /api/teach/next              — Get the next concept to learn based on progress
  POST /api/teach/session/complete  — Mark a teaching session as complete
"""

import time
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Dict, Any

from app.core.security import get_current_user_id
from app.core.teaching_engine import get_topic_content, evaluate_answer, get_next_concept
from app.database import learner_models_collection, progress_collection, roadmaps_collection

router = APIRouter(prefix="/api/teach", tags=["Teaching"])


@router.get("/topic/{skill_id}")
def get_teaching_session(
    skill_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Get the AI teaching content for a specific skill.
    Adapts the explanation to the learner's current level.
    """
    # Determine learner level from their model
    model = learner_models_collection.find_one({"user_id": user_id})
    mastery = 0
    if model:
        mastery = model.get("knowledge", {}).get("overallMastery", 0)

    if mastery >= 70:
        learner_level = "intermediate"
    elif mastery >= 50:
        learner_level = "beginner"
    else:
        learner_level = "beginner"

    content = get_topic_content(skill_id, learner_level)
    return content


@router.post("/evaluate")
def evaluate_learner_answer(
    data: Dict[str, Any],
    user_id: str = Depends(get_current_user_id),
):
    """
    Evaluate a learner's answer to a teaching exercise.
    Returns structured feedback and recommended next action.
    """
    skill_id = data.get("skillId", "")
    question_id = data.get("questionId", "")
    selected_index = data.get("selectedIndex", -1)
    correct_index = data.get("correctIndex", -1)

    if not skill_id or selected_index < 0:
        raise HTTPException(status_code=400, detail="skillId and selectedIndex are required.")

    result = evaluate_answer(skill_id, question_id, selected_index, correct_index)

    # Update learner model if answer is correct
    if result["isCorrect"]:
        now_str = time.strftime("%Y-%m-%d %H:%M:%S")
        learner_models_collection.update_one(
            {"user_id": user_id},
            {
                "$addToSet": {"knowledge.masteredConcepts": skill_id},
                "$set": {"lastUpdated": now_str},
                "$inc": {"knowledge.conceptsMastered": 1},
            },
            upsert=True,
        )
        progress_collection.update_one(
            {"user_id": user_id},
            {"$inc": {"learningHours": 0.5}},
            upsert=True,
        )

    return result


@router.get("/next")
def get_next_learning_concept(user_id: str = Depends(get_current_user_id)):
    """
    Determines the next concept the learner should study.
    Uses the skill graph to respect prerequisites and the adaptive engine
    to determine if remedial content is needed first.
    """
    from app.database import profiles_collection

    profile = profiles_collection.find_one({"user_id": user_id})
    model = learner_models_collection.find_one({"user_id": user_id})

    target_career = (profile or {}).get("targetCareer", "Machine Learning Engineer")

    mastered = []
    if model:
        mastered = model.get("knowledge", {}).get("masteredConcepts", [])
        # Also treat strong skills as mastered
        strong = model.get("knowledge", {}).get("strongSkills", [])
        mastered += [s.lower().replace(" ", "_") for s in strong]

    # Get career skill requirements
    from app.core.career_engine import get_career_skill_requirements
    from app.core.skill_graph import get_skill_graph

    career_skills = get_career_skill_requirements(target_career)
    target_ids = [
        sk.get("name", "").lower().replace(" ", "_").replace("&", "and").replace("/", "_")
        for sk in career_skills
    ]

    next_skill = get_next_concept(
        current_skill_id="",
        mastered_skills=mastered,
        target_career_skills=target_ids,
    )

    if not next_skill:
        return {
            "skillId": None,
            "message": "You've covered all core topics for your target career! Focus on projects and certifications.",
            "recommendedAction": "build_project",
        }

    graph = get_skill_graph()
    skill_data = graph.get_skill(next_skill)

    return {
        "skillId": next_skill,
        "skillName": skill_data.get("name", next_skill) if skill_data else next_skill,
        "difficulty": skill_data.get("difficulty", "Intermediate") if skill_data else "Intermediate",
        "estimatedMinutes": (skill_data.get("estimatedHours", 10) * 60 // 4) if skill_data else 30,
        "prerequisites": skill_data.get("prerequisites", []) if skill_data else [],
        "teachingRoute": f"/learn?skill={next_skill}",
        "message": f"Based on your progress, the next concept to master is: {skill_data.get('name', next_skill) if skill_data else next_skill}.",
    }


@router.post("/session/complete")
def complete_teaching_session(
    data: Dict[str, Any],
    user_id: str = Depends(get_current_user_id),
):
    """Mark a teaching session as complete and update progress."""
    skill_id = data.get("skillId", "")
    score = data.get("score", 0)
    time_spent_minutes = data.get("timeSpentMinutes", 30)

    now_str = time.strftime("%Y-%m-%d %H:%M:%S")

    if score >= 70:
        # Mark skill as mastered in learner model
        learner_models_collection.update_one(
            {"user_id": user_id},
            {
                "$addToSet": {"knowledge.masteredConcepts": skill_id},
                "$set": {"lastUpdated": now_str},
            },
            upsert=True,
        )
        # Update roadmap status for this skill
        roadmaps_collection.update_one(
            {"user_id": user_id, "id": skill_id},
            {"$set": {"status": "completed"}},
        )

    # Update progress hours
    hours = time_spent_minutes / 60.0
    progress_collection.update_one(
        {"user_id": user_id},
        {
            "$inc": {"learningHours": hours, "streakDays": 1},
            "$set": {"lastActivity": now_str},
        },
        upsert=True,
    )

    return {
        "success": True,
        "skillId": skill_id,
        "mastered": score >= 70,
        "message": (
            f"Great work! '{skill_id.replace('_', ' ').title()}' has been marked as mastered."
            if score >= 70
            else f"Session recorded. Practice more to reach mastery (need ≥70%, you scored {score}%)."
        ),
    }
