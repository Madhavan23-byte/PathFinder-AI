"""
PathFinder Backend — Assessment Router
Handles diagnostic assessment delivery and submission with scoring logic.
"""
import time
import json
from pathlib import Path
from fastapi import APIRouter, Depends

from backend.app.database import (
    learner_models_collection,
    assessments_collection,
    assessment_attempts_collection,
    skill_gaps_collection,
    recommendations_collection,
    roadmaps_collection,
    progress_collection,
    badges_collection,
)
from backend.app.core.security import get_current_user_id
from backend.app.schemas.models import AssessmentSubmitSchema

router = APIRouter(prefix="/api/assessment", tags=["Assessment"])

# --- Load question bank from data/ (falls back to inline if file missing) ---
_DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "questions_bank.json"


def _load_questions():
    if _DATA_PATH.exists():
        with open(_DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    # Inline fallback
    return [
        {"id": "q1", "skill": "Python Foundations", "difficulty": "Easy",
         "question": "Which Python data structure maintains insertion order and guarantees unique keys?",
         "options": ["List", "Dictionary (Python 3.7+)", "Set", "Tuple"],
         "correctIndex": 1, "conceptTag": "Data Structures"},
        {"id": "q2", "skill": "Statistics & Probability", "difficulty": "Intermediate",
         "question": "When evaluating a binary classifier with high class imbalance, which metric is LEAST informative?",
         "options": ["ROC-AUC", "Precision-Recall AUC", "Standard Classification Accuracy", "F1-Score"],
         "correctIndex": 2, "conceptTag": "Evaluation Metrics"},
        {"id": "q3", "skill": "Model Evaluation & Tuning", "difficulty": "Intermediate",
         "question": "A Decision Tree model displays 99% training accuracy but 62% validation accuracy. What phenomenon is occurring?",
         "options": ["Underfitting", "Overfitting (High Variance)", "Optimal Convergence", "Data Leakage"],
         "correctIndex": 1, "conceptTag": "Overfitting vs Underfitting"},
        {"id": "q4", "skill": "SQL & Relational Databases", "difficulty": "Easy",
         "question": "Which SQL clause is used to filter records resulting from an aggregate function (e.g., GROUP BY)?",
         "options": ["WHERE", "HAVING", "ORDER BY", "FILTER"],
         "correctIndex": 1, "conceptTag": "SQL Aggregations"},
    ]


@router.get("/start")
def start_assessment(user_id: str = Depends(get_current_user_id)):
    """Return assessment questions (strips correctIndex before sending to client)."""
    questions = _load_questions()
    return [
        {k: v for k, v in q.items() if k != "correctIndex"}
        for q in questions
    ]


@router.post("/submit")
def submit_assessment(data: AssessmentSubmitSchema, user_id: str = Depends(get_current_user_id)):
    """Score submitted answers, update learner model, skill gaps, recommendations, roadmap, and badges."""
    questions = _load_questions()
    correct_mapping = {q["id"]: q["correctIndex"] for q in questions}
    total_q = len(correct_mapping)
    num_correct = sum(
        1 for qid, ans_idx in data.answers.items()
        if qid in correct_mapping and correct_mapping[qid] == ans_idx
    )
    score = int((num_correct / total_q) * 100) if total_q > 0 else 50
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")

    # 1. Save attempt
    assessment_attempts_collection.insert_one({
        "user_id": user_id, "score": score,
        "answers": data.answers, "timestamp": now_str,
    })

    # 2. Update learner model
    learner_models_collection.update_one(
        {"user_id": user_id},
        {"$set": {
            "knowledge.overallMastery": score,
            "knowledge.conceptsMastered": num_correct,
            "knowledge.totalConcepts": total_q,
            "knowledge.strongSkills": ["Python Foundations", "SQL Aggregations"] if score >= 50 else ["Python Basics"],
            "knowledge.weakSkills": ["Model Evaluation Metrics", "Imbalanced Classification"] if score < 75 else ["Advanced MLOps"],
            "ability.assessmentAccuracy": score,
            "ability.totalAttempts": 1,
            "ability.masteryProgression": score,
            "lastUpdated": now_str,
        }},
        upsert=True,
    )

    # 3. Populate skill gaps
    skill_gaps_collection.delete_many({"user_id": user_id})
    skill_gaps_collection.insert_many([
        {
            "user_id": user_id, "skillId": "skl_eval",
            "skillName": "Model Evaluation & Tuning",
            "currentLevel": max(30, score - 20), "requiredLevel": 80,
            "gapPriority": "Critical" if score < 70 else "Medium",
            "estimatedHours": 12,
            "prerequisites": ["Machine Learning Fundamentals"],
            "careerRelevance": "Essential for ML Engineers to assess overfitting, ROC-AUC, Precision/Recall trade-offs.",
        },
        {
            "user_id": user_id, "skillId": "skl_math",
            "skillName": "Statistics & Probability",
            "currentLevel": max(40, score - 15), "requiredLevel": 80,
            "gapPriority": "High", "estimatedHours": 10,
            "prerequisites": ["Python Foundations"],
            "careerRelevance": "Underpins hypothesis testing, Bayes theorem, and statistical inference in ML.",
        },
        {
            "user_id": user_id, "skillId": "skl_ml",
            "skillName": "Machine Learning Fundamentals",
            "currentLevel": max(35, score - 10), "requiredLevel": 85,
            "gapPriority": "High", "estimatedHours": 20,
            "prerequisites": ["Python Foundations", "Statistics & Probability"],
            "careerRelevance": "Core competence required for supervised and unsupervised algorithmic modeling.",
        },
    ])
    # 4. Populate recommendations dynamically
    from backend.app.core.recommendation import recommend_resources
    from backend.app.core.llm import generate_why_reason, generate_roadmap
    
    recommendations_collection.delete_many({"user_id": user_id})
    target_gaps = ["Model Evaluation & Tuning", "Machine Learning Fundamentals"] if score < 75 else ["Advanced MLOps", "Deep Learning"]
    
    new_recs = []
    for idx, gap in enumerate(target_gaps):
        matched_courses = recommend_resources(gap, top_n=1)
        if matched_courses:
            course = matched_courses[0]
            why_json = generate_why_reason(gap, "Machine Learning Engineer", {"Python": 90, "SQL": 85})
            new_recs.append({
                "user_id": user_id, "id": f"rec_{idx+1:02d}",
                "title": course.get("title", gap + " Course"),
                "type": course.get("type", "Course"),
                "skillGapClosed": gap,
                "difficulty": course.get("difficulty", "Intermediate"),
                "estimatedTime": course.get("estimatedTime", "5 hours"),
                "prerequisites": [{"name": "Python Foundations", "status": "met"}],
                "careerRelevance": "High",
                "whyReason": why_json,
                "provider": course.get("provider", "PathFinder Lab"),
                "rating": course.get("rating", 4.8),
            })
    if new_recs:
        recommendations_collection.insert_many(new_recs)

    # 5. Populate roadmap dynamically
    roadmaps_collection.delete_many({"user_id": user_id})
    llm_roadmap = generate_roadmap("Machine Learning Engineer", target_gaps)
    
    if llm_roadmap and isinstance(llm_roadmap, list):
        final_roadmap = []
        for i, rm in enumerate(llm_roadmap):
            rm["user_id"] = user_id
            rm["id"] = f"rd_{i+1:02d}"
            rm["order"] = i + 1
            rm["status"] = "completed" if i == 0 else "current" if i == 1 else "locked"
            final_roadmap.append(rm)
        roadmaps_collection.insert_many(final_roadmap)
    else:
        # Fallback if LLM fails (API key missing or bad JSON)
        roadmaps_collection.insert_many([
            {"user_id": user_id, "id": "rd_01", "title": "Python Core", "skillName": "Python Foundations", "phase": 1, "phaseTitle": "Foundations", "order": 1, "status": "completed", "estimatedHours": 10, "difficulty": "Beginner", "resourcesCount": 3, "whyPositioned": "Verified initial proficiency in diagnostic assessment."},
            {"user_id": user_id, "id": "rd_02", "title": target_gaps[0], "skillName": target_gaps[0], "phase": 2, "phaseTitle": "Core Skills", "order": 2, "status": "current", "estimatedHours": 15, "difficulty": "Intermediate", "resourcesCount": 5, "whyPositioned": "Primary skill gap detected."}
        ])

    # 6. Update progress
    progress_collection.update_one(
        {"user_id": user_id},
        {"$set": {"careerReadiness": max(50, score), "skillsMasteredCount": num_correct, "streakDays": 1, "learningHours": 1.5}},
        upsert=True,
    )

    # 7. Award badge if score >= 75
    if score >= 75:
        badges_collection.update_one(
            {"user_id": user_id, "id": "bdg_diag"},
            {"$set": {
                "user_id": user_id, "id": "bdg_diag",
                "title": "Diagnostic Achiever",
                "description": f"Scored {score}% on initial diagnostic assessment.",
                "category": "Core Engineering", "masteryPercentage": score,
                "dateEarned": now_str[:10], "iconName": "Award",
                "verifiedByAssessment": True, "isUnlocked": True,
            }},
            upsert=True,
        )

    return {
        "attemptId": f"att_{int(time.time())}",
        "score": score,
        "mastered": ["Data Structures", "SQL Aggregations"] if score >= 50 else ["Basic Python"],
        "weaknesses": ["Evaluation Metrics Trade-offs"],
        "difficultyReached": "Intermediate",
        "recommendedNextAction": "Complete target practice modules to level up skill gaps.",
    }
