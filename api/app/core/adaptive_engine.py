"""
PathFinder Backend — Adaptive Learning Engine

Determines what the learner should do next based on their current state.
Implements the core adaptive loop:

    ASSESS → ANALYZE → DECIDE → RECOMMEND NEXT ACTION → UPDATE PATH

This engine is fully LLM-independent. All decisions are rule-based.
"""

from typing import Dict, List, Optional, Tuple


# ─── Next Action Types ────────────────────────────────────────────────────────

ACTION_TYPES = {
    "take_assessment": "Take Diagnostic Assessment",
    "remedial_lesson": "Complete Remedial Lesson",
    "continue_lesson": "Continue Current Lesson",
    "practice": "Practice Exercises",
    "mini_test": "Take Mini Assessment",
    "next_module": "Start Next Module",
    "build_project": "Build a Project",
    "review_skill": "Review Weak Skill",
    "take_certification": "Prepare for Certification",
    "onboarding": "Complete Profile Setup",
}

PRIORITY_ORDER = [
    "onboarding",
    "take_assessment",
    "remedial_lesson",
    "review_skill",
    "practice",
    "mini_test",
    "continue_lesson",
    "next_module",
    "build_project",
    "take_certification",
]


# ─── Adaptive Decision Logic ──────────────────────────────────────────────────

def determine_next_action(
    learner_state: Dict,
) -> Dict:
    """
    Determines the single most important next action for this learner right now.

    Args:
        learner_state: Aggregated state containing:
            - assessment_completed (bool)
            - onboarding_completed (bool)
            - skill_scores ({skill: score})
            - roadmap_current_module (str)
            - practice_due (bool)
            - weak_skills ([str])
            - projects_available ([dict])
            - career_readiness (int)
            - streak_days (int)

    Returns:
        {
          "actionType": str,
          "actionLabel": str,
          "targetRoute": str (frontend route),
          "reason": str,
          "urgency": "critical" | "high" | "medium" | "low",
          "estimatedMinutes": int,
        }
    """

    # Guard: Onboarding not done
    if not learner_state.get("onboarding_completed", False):
        return _action(
            "onboarding",
            "/onboarding",
            "Complete your profile setup so PathFinder can personalise your learning path.",
            "critical",
            10,
        )

    # Guard: No assessment taken yet
    if not learner_state.get("assessment_completed", False):
        return _action(
            "take_assessment",
            "/assessment",
            "Take the diagnostic assessment to calibrate your learner model and generate your personalised roadmap.",
            "critical",
            20,
        )

    skill_scores = learner_state.get("skill_scores", {})
    weak_skills = learner_state.get("weak_skills", [])
    current_module = learner_state.get("roadmap_current_module", "")
    career_readiness = learner_state.get("career_readiness", 0)
    practice_due = learner_state.get("practice_due", False)

    # Critical weakness — remedial path
    critical_weak = [s for s in weak_skills if skill_scores.get(s, 100) < 40]
    if critical_weak:
        skill_name = critical_weak[0]
        return _action(
            "remedial_lesson",
            f"/learn?skill={_slugify(skill_name)}&mode=remedial",
            f"Your score in {skill_name} is critically low. PathFinder has prepared a targeted remedial session to address this gap before you continue.",
            "critical",
            30,
        )

    # Moderate weakness needing review
    moderate_weak = [s for s in weak_skills if 40 <= skill_scores.get(s, 100) < 60]
    if moderate_weak:
        skill_name = moderate_weak[0]
        return _action(
            "review_skill",
            f"/learn?skill={_slugify(skill_name)}&mode=review",
            f"Your {skill_name} score ({skill_scores.get(skill_name, 0):.0f}%) is below the target level. A focused review session will strengthen this before you advance.",
            "high",
            20,
        )

    # Practice due
    if practice_due:
        return _action(
            "practice",
            "/practice",
            "Regular practice reinforces what you've learned. Your adaptive practice queue has questions targeted at your current skill gaps.",
            "high",
            15,
        )

    # Continue current lesson / module
    if current_module:
        return _action(
            "continue_lesson",
            "/learn",
            f"Continue your current lesson: **{current_module}**. Consistent progress is key to reaching your career readiness target.",
            "medium",
            45,
        )

    # Project building when readiness is moderate+
    projects = learner_state.get("projects_available", [])
    if projects and career_readiness >= 40:
        proj = projects[0]
        return _action(
            "build_project",
            "/project-mentor",
            f"You're ready to build: **{proj.get('title', 'your next project')}**. Projects build portfolio evidence and accelerate your career readiness score.",
            "medium",
            120,
        )

    # Start next module
    return _action(
        "next_module",
        "/roadmap",
        "You've completed your current module. Review your roadmap and start the next learning phase to keep your momentum.",
        "low",
        5,
    )


def should_reroute_to_remedial(skill_scores: Dict[str, float], current_skill_id: str) -> Tuple[bool, List[str]]:
    """
    Determines if the learner should be rerouted to remedial content.

    Returns (should_reroute, list_of_weak_prerequisite_skills).
    """
    from app.core.skill_graph import get_skill_graph
    graph = get_skill_graph()
    skill = graph.get_skill(current_skill_id)
    if not skill:
        return False, []

    weak_prereqs = []
    for prereq_id in skill.get("prerequisites", []):
        score = skill_scores.get(prereq_id, 100)
        if score < 55:
            prereq_skill = graph.get_skill(prereq_id)
            if prereq_skill:
                weak_prereqs.append(prereq_skill.get("name", prereq_id))

    return bool(weak_prereqs), weak_prereqs


def compute_adaptive_roadmap_updates(
    roadmap: List[Dict],
    skill_scores: Dict[str, float],
    mastery_threshold: float = 75.0,
) -> List[Dict]:
    """
    Reviews the current roadmap and returns an updated version with:
    - Mastered modules marked 'completed'
    - Weak modules flagged 'remedial'
    - Current module set to the first non-completed, non-locked item
    - Locked modules unlocked if all prerequisites are met
    """
    updated = []
    found_current = False

    for item in roadmap:
        new_item = dict(item)
        skill_id = item.get("id", "")
        score = skill_scores.get(skill_id, -1)

        if score >= mastery_threshold:
            new_item["status"] = "completed"
        elif 0 <= score < 40:
            new_item["status"] = "remedial"
        elif item["status"] == "current":
            found_current = True

        updated.append(new_item)

    # Ensure exactly one 'current'
    if not found_current:
        for item in updated:
            if item["status"] not in ("completed",):
                item["status"] = "current"
                found_current = True
                break

    return updated


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _action(action_type: str, route: str, reason: str, urgency: str, minutes: int) -> Dict:
    return {
        "actionType": action_type,
        "actionLabel": ACTION_TYPES.get(action_type, action_type.replace("_", " ").title()),
        "targetRoute": route,
        "reason": reason,
        "urgency": urgency,
        "estimatedMinutes": minutes,
    }


def _slugify(text: str) -> str:
    return text.lower().replace(" ", "_").replace("&", "and").replace("/", "_")
