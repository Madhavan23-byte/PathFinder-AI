"""
PathFinder Backend — Projects Router

Manages project-based learning: recommendations, milestones, and AI mentoring.

Routes:
  GET  /api/projects              — Get recommended projects for user
  GET  /api/projects/{id}         — Get project details with milestones
  POST /api/projects/{id}/milestone — Mark a milestone complete
  POST /api/projects/mentor/chat  — AI project mentor chat
"""

import json
import time
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List

from backend.app.core.security import get_current_user_id
from backend.app.database import (
    profiles_collection,
    progress_collection,
    learner_models_collection,
)

router = APIRouter(prefix="/api/projects", tags=["Projects"])

_PROJECTS_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "projects_catalog.json"

# In-memory store for project progress (replace with MongoDB collection in production)
_USER_PROJECT_PROGRESS: Dict[str, Dict] = {}


def _load_projects() -> List[Dict]:
    if _PROJECTS_PATH.exists():
        with open(_PROJECTS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def _get_user_project_progress(user_id: str, project_id: str) -> Dict:
    key = f"{user_id}:{project_id}"
    return _USER_PROJECT_PROGRESS.get(key, {"completedMilestones": [], "startedAt": None})


def _save_user_project_progress(user_id: str, project_id: str, progress: Dict):
    key = f"{user_id}:{project_id}"
    _USER_PROJECT_PROGRESS[key] = progress


@router.get("")
def get_recommended_projects(user_id: str = Depends(get_current_user_id)):
    """
    Returns recommended projects for the user based on their current career goal
    and learning stage. Annotates each project with the user's completion status.
    """
    profile = profiles_collection.find_one({"user_id": user_id}) or {}
    model = learner_models_collection.find_one({"user_id": user_id}) or {}

    target_career = profile.get("targetCareer", "Machine Learning Engineer")
    mastery = model.get("knowledge", {}).get("overallMastery", 0)

    projects = _load_projects()

    # Filter and rank projects by career relevance and difficulty
    scored = []
    for proj in projects:
        # Check career relevance
        career_match = any(
            target_career.lower() in c.lower() or c.lower() in target_career.lower()
            for c in proj.get("targetCareers", [])
        )

        # Check difficulty appropriateness
        difficulty = proj.get("difficulty", "Intermediate")
        if mastery < 40 and difficulty == "Advanced":
            continue  # Skip advanced projects for beginners

        user_progress = _get_user_project_progress(user_id, proj["id"])
        completed_milestones = user_progress.get("completedMilestones", [])
        total_milestones = len(proj.get("milestones", []))

        proj_annotated = {
            **proj,
            "careerMatch": career_match,
            "completedMilestones": len(completed_milestones),
            "totalMilestones": total_milestones,
            "completionPercentage": round(len(completed_milestones) / total_milestones * 100) if total_milestones else 0,
            "status": "completed" if len(completed_milestones) == total_milestones and total_milestones > 0
                     else "in_progress" if completed_milestones
                     else "available",
            "isStarted": bool(user_progress.get("startedAt")),
        }
        scored.append((1 if career_match else 0, proj_annotated))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [p for _, p in scored[:6]]


@router.get("/{project_id}")
def get_project_detail(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Get full project details including milestone completion status."""
    projects = _load_projects()
    project = next((p for p in projects if p["id"] == project_id), None)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    user_progress = _get_user_project_progress(user_id, project_id)
    completed_milestones = user_progress.get("completedMilestones", [])

    milestones_with_status = []
    for m in project.get("milestones", []):
        milestones_with_status.append({
            **m,
            "completed": m["id"] in completed_milestones,
        })

    return {
        **project,
        "milestones": milestones_with_status,
        "completedMilestoneIds": completed_milestones,
        "completionPercentage": round(len(completed_milestones) / len(project["milestones"]) * 100)
            if project.get("milestones") else 0,
        "startedAt": user_progress.get("startedAt"),
        "status": "completed" if len(completed_milestones) == len(project.get("milestones", [1]))
                 else "in_progress" if completed_milestones
                 else "available",
    }


@router.post("/{project_id}/milestone")
def complete_milestone(
    project_id: str,
    data: Dict[str, Any],
    user_id: str = Depends(get_current_user_id),
):
    """Mark a project milestone as complete and update progress."""
    milestone_id = data.get("milestoneId", "")
    if not milestone_id:
        raise HTTPException(status_code=400, detail="milestoneId is required.")

    projects = _load_projects()
    project = next((p for p in projects if p["id"] == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    now_str = time.strftime("%Y-%m-%d %H:%M:%S")
    user_progress = _get_user_project_progress(user_id, project_id)
    completed = user_progress.get("completedMilestones", [])

    if milestone_id not in completed:
        completed.append(milestone_id)

    if not user_progress.get("startedAt"):
        user_progress["startedAt"] = now_str

    user_progress["completedMilestones"] = completed
    user_progress["lastUpdated"] = now_str
    _save_user_project_progress(user_id, project_id, user_progress)

    # Update career readiness score
    total = len(project.get("milestones", [1]))
    completion_pct = len(completed) / total * 100

    progress_collection.update_one(
        {"user_id": user_id},
        {
            "$set": {"lastActivity": now_str},
            "$inc": {"learningHours": 0.5},
        },
        upsert=True,
    )

    all_done = len(completed) == total
    return {
        "success": True,
        "milestoneId": milestone_id,
        "completedCount": len(completed),
        "totalMilestones": total,
        "completionPercentage": round(completion_pct),
        "projectComplete": all_done,
        "message": (
            f"🎉 Project complete! Excellent work — this demonstrates real portfolio-worthy skills."
            if all_done
            else f"Milestone completed! {len(completed)}/{total} milestones done. Keep going!"
        ),
        "aiMentorTip": _get_milestone_tip(project, milestone_id, len(completed), total),
    }


@router.post("/mentor/chat")
def project_mentor_chat(
    data: Dict[str, Any],
    user_id: str = Depends(get_current_user_id),
):
    """AI Project Mentor responds to student questions about their project."""
    from backend.app.core.llm import get_llm_provider

    message = data.get("message", "")
    project_id = data.get("projectId", "")
    milestone_id = data.get("milestoneId", "")

    if not message:
        raise HTTPException(status_code=400, detail="message is required.")

    # Build context
    context = {"role": "AI Project Mentor", "projectId": project_id, "currentMilestone": milestone_id}

    # Use LLM for project mentoring (with helpful guidance, not just answers)
    mentor_prompt = (
        f"You are a project mentor. A student is working on project '{project_id}', "
        f"milestone '{milestone_id}'. They ask: '{message}'. "
        f"Give a helpful hint that guides them toward the solution without giving the complete answer. "
        f"Encourage problem-solving and critical thinking."
    )

    response = get_llm_provider().generate(mentor_prompt, context)
    return {"response": response, "projectId": project_id}


def _get_milestone_tip(project: Dict, milestone_id: str, completed: int, total: int) -> str:
    """Generate a context-aware mentor tip after completing a milestone."""
    project_title = project.get("title", "this project")
    milestones = project.get("milestones", [])
    next_milestone = next((m for m in milestones if m["id"] != milestone_id and
                           milestones.index(m) == completed), None)

    if not next_milestone:
        return f"You've completed all milestones for {project_title}! Document your work and add it to your portfolio."

    return (
        f"Good progress! Next up: **{next_milestone['title']}**. "
        f"Estimated time: {next_milestone.get('estimatedHours', 2)} hours. "
        f"If you get stuck, ask the AI Mentor for hints — "
        f"but try to work through it yourself first for deeper learning."
    )
