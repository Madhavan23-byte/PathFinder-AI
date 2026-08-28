"""
PathFinder Backend — Career Readiness Engine

Computes a composite Career Readiness Score (0-100) from four factors:
    1. Skill Mastery        (40%) — Weighted average of skill assessment scores
    2. Assessment Performance (30%) — Diagnostic and practice test accuracy
    3. Project Completion    (20%) — Completed project milestones
    4. Learning Consistency  (10%) — Streak days and session regularity

The score is transparent: every factor is explained to the learner.
"""

from typing import Dict, List, Optional


def compute_career_readiness(
    skill_scores: Dict[str, float],
    career_skill_requirements: List[Dict],
    assessment_accuracy: float,
    project_milestones_completed: int,
    project_milestones_total: int,
    streak_days: int,
    sessions_per_week: float,
) -> Dict:
    """
    Compute the composite Career Readiness Score.

    Args:
        skill_scores: {skill_id: score_0_to_100}
        career_skill_requirements: List of {name, required (importance weight), ...}
        assessment_accuracy: Overall assessment accuracy (0-100)
        project_milestones_completed: Number of project milestones completed
        project_milestones_total: Total project milestones in the plan
        streak_days: Consecutive study days
        sessions_per_week: Average sessions per week

    Returns:
        {
          "overallScore": int,
          "skillMastery": {"score": int, "weight": 0.40, "details": [...], "insight": str},
          "assessmentPerformance": {"score": int, "weight": 0.30, "insight": str},
          "projectCompletion": {"score": int, "weight": 0.20, "insight": str},
          "learningConsistency": {"score": int, "weight": 0.10, "insight": str},
          "topImprovement": str,
          "readinessLabel": str,
        }
    """

    # ── Factor 1: Skill Mastery (40%) ─────────────────────────────────────────
    skill_score, skill_details = _compute_skill_mastery(skill_scores, career_skill_requirements)

    # ── Factor 2: Assessment Performance (30%) ────────────────────────────────
    assessment_score = min(100, max(0, assessment_accuracy))
    if assessment_accuracy <= 0:
        assessment_insight = "Take the diagnostic assessment to establish your baseline score."
    elif assessment_accuracy >= 80:
        assessment_insight = "Excellent assessment performance! You're demonstrating strong conceptual understanding."
    elif assessment_accuracy >= 60:
        assessment_insight = f"Good foundation at {assessment_accuracy:.0f}%. Targeted practice in weak areas will push this higher."
    else:
        assessment_insight = f"Assessment score of {assessment_accuracy:.0f}% indicates key concept gaps. Focus on remedial learning for your weak skills."

    # ── Factor 3: Project Completion (20%) ────────────────────────────────────
    if project_milestones_total > 0:
        project_score = round((project_milestones_completed / project_milestones_total) * 100)
    else:
        project_score = 0

    if project_score == 0:
        project_insight = "Start your first project to build practical portfolio evidence."
    elif project_score >= 75:
        project_insight = f"Strong project portfolio at {project_score}% completion — employers value demonstrated work."
    else:
        project_insight = f"Project completion at {project_score}%. Completing more milestones significantly boosts readiness."

    # ── Factor 4: Learning Consistency (10%) ──────────────────────────────────
    consistency_raw = min(100, (streak_days * 5) + (sessions_per_week * 10))
    consistency_score = round(consistency_raw)

    if streak_days >= 7:
        consistency_insight = f"Impressive {streak_days}-day streak! Consistent daily learning is the most effective strategy."
    elif streak_days >= 3:
        consistency_insight = f"Building momentum with a {streak_days}-day streak. Aim for daily sessions to accelerate progress."
    else:
        consistency_insight = "Establishing a daily learning habit will dramatically accelerate your career readiness."

    # ── Composite Score ────────────────────────────────────────────────────────
    overall = round(
        skill_score * 0.40 +
        assessment_score * 0.30 +
        project_score * 0.20 +
        consistency_score * 0.10
    )
    overall = max(0, min(overall, 100))

    # ── Readiness Label ────────────────────────────────────────────────────────
    readiness_label = _readiness_label(overall)

    # ── Top Improvement Recommendation ────────────────────────────────────────
    factors = [
        ("Skill Mastery", skill_score, 0.40),
        ("Assessment Performance", assessment_score, 0.30),
        ("Project Completion", project_score, 0.20),
        ("Learning Consistency", consistency_score, 0.10),
    ]
    # Find the factor with the most potential impact improvement
    improvement_factor = min(factors, key=lambda f: f[1] * f[2])
    top_improvement = _improvement_tip(improvement_factor[0], improvement_factor[1])

    return {
        "overallScore": overall,
        "readinessLabel": readiness_label,
        "topImprovement": top_improvement,
        "skillMastery": {
            "score": skill_score,
            "weight": 0.40,
            "details": skill_details,
            "insight": _skill_mastery_insight(skill_score, skill_details),
        },
        "assessmentPerformance": {
            "score": round(assessment_score),
            "weight": 0.30,
            "insight": assessment_insight,
        },
        "projectCompletion": {
            "score": project_score,
            "weight": 0.20,
            "completedMilestones": project_milestones_completed,
            "totalMilestones": project_milestones_total,
            "insight": project_insight,
        },
        "learningConsistency": {
            "score": consistency_score,
            "weight": 0.10,
            "streakDays": streak_days,
            "sessionsPerWeek": round(sessions_per_week, 1),
            "insight": consistency_insight,
        },
    }


def _compute_skill_mastery(
    skill_scores: Dict[str, float],
    career_requirements: List[Dict],
) -> tuple:
    """
    Compute weighted skill mastery score and per-skill detail.
    """
    if not career_requirements:
        avg = sum(skill_scores.values()) / len(skill_scores) if skill_scores else 0
        return round(avg), []

    total_weight = 0.0
    weighted_sum = 0.0
    details = []

    for req in career_requirements:
        name = req.get("name", "")
        name_key = name.lower()
        importance = float(req.get("importance", req.get("required", 80))) / 100.0
        total_weight += importance

        # Find best matching skill score
        learner_score = 0.0
        for k, v in skill_scores.items():
            if any(part in name_key for part in k.lower().split() if len(part) > 3) or \
               any(part in k.lower() for part in name_key.split() if len(part) > 3):
                learner_score = max(learner_score, v)

        weighted_sum += importance * learner_score

        status = "mastered" if learner_score >= 80 else "partial" if learner_score >= 50 else "gap"
        details.append({
            "skill": name,
            "score": round(learner_score),
            "weight": round(importance * 100),
            "status": status,
        })

    score = round((weighted_sum / total_weight)) if total_weight > 0 else 0
    return score, details


def _skill_mastery_insight(score: int, details: List[Dict]) -> str:
    gaps = [d["skill"] for d in details if d["status"] == "gap"]
    mastered = [d["skill"] for d in details if d["status"] == "mastered"]

    if score >= 80:
        return f"Excellent skill mastery! {len(mastered)} skills at professional level."
    if gaps:
        return f"Focus on bridging {len(gaps)} skill gap(s): {', '.join(gaps[:2])}{'...' if len(gaps) > 2 else ''}."
    return f"Skill mastery at {score}%. Continue your current learning plan."


def _readiness_label(score: int) -> str:
    if score >= 85:
        return "Career Ready"
    if score >= 70:
        return "Almost Ready"
    if score >= 50:
        return "Developing"
    if score >= 30:
        return "Early Stage"
    return "Just Started"


def _improvement_tip(factor_name: str, score: int) -> str:
    tips = {
        "Skill Mastery": f"Complete your pending skill modules to raise your mastery score above {min(score + 15, 100)}%.",
        "Assessment Performance": "Take practice assessments regularly — each attempt improves your score and identifies weak concepts.",
        "Project Completion": "Start or continue a project milestone. Practical work is the fastest way to build career readiness.",
        "Learning Consistency": "Study every day, even for 20 minutes. Streak consistency has a compounding effect on learning speed.",
    }
    return tips.get(factor_name, "Keep learning consistently to improve your overall career readiness.")
