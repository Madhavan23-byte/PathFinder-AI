"""
PathFinder Backend — Career Discovery Engine

Scores learner profiles against career knowledge base to produce
ranked career recommendations with match percentages and explainability.

This engine is fully LLM-independent. All scoring is deterministic.
The LLM is used only for generating the natural language explanation.
"""

import json
from pathlib import Path
from typing import Dict, List, Any

_CAREER_DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "career_paths.json"


def _load_careers() -> List[Dict]:
    if _CAREER_DATA_PATH.exists():
        with open(_CAREER_DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def _get_learner_skill_map(learner_profile: Dict) -> Dict[str, float]:
    """
    Normalise learner skills from assessment scores and self-declaration
    into a unified {skill_name_lower: score_0_to_100} map.
    """
    skill_map: Dict[str, float] = {}

    # From self-declared skills on onboarding
    for sk in learner_profile.get("skills", []):
        name = sk.get("name", "").lower()
        level = float(sk.get("level", 0))
        if name:
            skill_map[name] = level

    # From assessment scores (skill_scores dict)
    for skill, score in learner_profile.get("skill_scores", {}).items():
        skill_map[skill.lower()] = float(score)

    # From learner model strong/weak signals
    for sk in learner_profile.get("strongSkills", []):
        key = sk.lower()
        if key not in skill_map:
            skill_map[key] = 80.0

    for sk in learner_profile.get("weakSkills", []):
        key = sk.lower()
        if key not in skill_map:
            skill_map[key] = 30.0

    return skill_map


def _score_career(career: Dict, skill_map: Dict[str, float], learner_profile: Dict) -> Dict:
    """
    Score a career against a learner profile.

    Scoring factors:
      1. Skill coverage (60%) — how many required skills the learner has at ≥50%
      2. Interest alignment (20%) — keyword match between career and stated interests
      3. Goal alignment (20%) — does the learner explicitly mention this career?

    Returns enriched career dict with matchScore, explanation, and gap summary.
    """
    required_skills = career.get("requiredSkills", career.get("keySkills", []))

    # ── Factor 1: Skill Coverage ──────────────────────────────────────────────
    total_weight = 0.0
    covered_weight = 0.0
    skill_statuses = []

    for skill_def in required_skills:
        skill_name = skill_def.get("name", "")
        skill_key = skill_name.lower()
        importance = float(skill_def.get("importance", skill_def.get("required", 80))) / 100.0
        total_weight += importance

        learner_level = 0.0
        for lk, lv in skill_map.items():
            if any(kw in skill_key for kw in lk.split()) or any(kw in lk for kw in skill_key.split()):
                learner_level = max(learner_level, lv)

        required_level = float(skill_def.get("required", 80))
        proficiency_ratio = min(learner_level / required_level, 1.0) if required_level > 0 else 0.0
        covered_weight += importance * proficiency_ratio

        status = "strong" if proficiency_ratio >= 0.8 else "partial" if proficiency_ratio >= 0.4 else "gap"
        skill_statuses.append({
            "name": skill_name,
            "learnerLevel": round(learner_level),
            "requiredLevel": round(required_level),
            "status": status,
        })

    coverage_score = (covered_weight / total_weight * 100) if total_weight > 0 else 50.0

    # ── Factor 2: Interest Alignment ─────────────────────────────────────────
    interests = " ".join(learner_profile.get("interests", [])).lower()
    career_keywords = (career.get("title", "") + " " + career.get("description", "")).lower()
    interest_words = [w for w in interests.split() if len(w) > 3]
    interest_hits = sum(1 for w in interest_words if w in career_keywords)
    interest_score = min(interest_hits / max(len(interest_words), 1) * 100, 100) if interest_words else 50.0

    # ── Factor 3: Goal Alignment ──────────────────────────────────────────────
    target_career = learner_profile.get("targetCareer", "").lower()
    career_title = career.get("title", "").lower()
    goal_score = 100.0 if (target_career and (target_career in career_title or career_title in target_career)) else 40.0

    # ── Weighted Final Score ──────────────────────────────────────────────────
    match_score = round(
        coverage_score * 0.60 +
        interest_score * 0.20 +
        goal_score * 0.20
    )
    match_score = max(10, min(match_score, 98))  # Clamp to realistic range

    # ── Build Explanation ─────────────────────────────────────────────────────
    strong_skills = [s["name"] for s in skill_statuses if s["status"] == "strong"]
    gap_skills = [s["name"] for s in skill_statuses if s["status"] == "gap"]

    explanation_parts = []
    if strong_skills:
        explanation_parts.append(f"Your {', '.join(strong_skills[:2])} foundation is a strong match for this role.")
    if gap_skills:
        explanation_parts.append(f"Key gaps to address: {', '.join(gap_skills[:3])}.")
    if goal_score >= 80:
        explanation_parts.append("This directly aligns with your stated career goal.")
    if interest_score >= 60:
        explanation_parts.append("Your interests closely match the work done in this role.")

    explanation = " ".join(explanation_parts) or "This career aligns with your current profile."

    enriched = {**career}
    enriched["matchScore"] = match_score
    enriched["skillStatuses"] = skill_statuses
    enriched["explanation"] = explanation
    enriched["gapCount"] = len(gap_skills)
    enriched["strongCount"] = len(strong_skills)

    return enriched


def recommend_careers(learner_profile: Dict, top_n: int = 5) -> List[Dict]:
    """
    Main entry point. Takes a learner profile and returns ranked career recommendations.

    Args:
        learner_profile: Dict with keys: skills, interests, targetCareer, skill_scores, etc.
        top_n: Number of careers to return.

    Returns:
        List of career dicts sorted by matchScore descending, with explanation and skill statuses.
    """
    careers = _load_careers()
    if not careers:
        return []

    skill_map = _get_learner_skill_map(learner_profile)
    scored = [_score_career(c, skill_map, learner_profile) for c in careers]
    scored.sort(key=lambda x: x["matchScore"], reverse=True)
    return scored[:top_n]


def get_career_by_id(career_id: str) -> Dict:
    """Fetch a single career definition by its ID."""
    careers = _load_careers()
    for c in careers:
        if c.get("id") == career_id:
            return c
    return {}


def get_career_skill_requirements(career_title: str) -> List[Dict]:
    """Return the ordered skill requirements for a given career title."""
    careers = _load_careers()
    for c in careers:
        if c.get("title", "").lower() == career_title.lower():
            return c.get("requiredSkills", c.get("keySkills", []))
    return []
