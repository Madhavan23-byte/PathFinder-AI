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

    # 4. Populate recommendations
    recommendations_collection.delete_many({"user_id": user_id})
    recommendations_collection.insert_many([
        {
            "user_id": user_id, "id": "rec_01",
            "title": "Precision, Recall & ROC-AUC Deep Dive", "type": "Practice",
            "skillGapClosed": "Model Evaluation & Tuning", "difficulty": "Intermediate",
            "estimatedTime": "45 mins",
            "prerequisites": [
                {"name": "Python Foundations", "status": "met"},
                {"name": "Statistics & Probability", "status": "partial"},
            ],
            "careerRelevance": "Critical",
            "whyReason": {
                "strongSkills": ["Python Foundations"],
                "partiallyMastered": ["Statistics"],
                "careerRequirement": "ML Engineer role requires 80%+ evaluation mastery.",
                "recentGapTrigger": f"Diagnostic score ({score}%) identified precision/recall evaluation trade-offs as high priority.",
            },
            "provider": "PathFinder Interactive Lab", "rating": 4.9,
        },
        {
            "user_id": user_id, "id": "rec_02",
            "title": "Hands-on Customer Churn Classifier Project", "type": "Project",
            "skillGapClosed": "Machine Learning Fundamentals", "difficulty": "Intermediate",
            "estimatedTime": "3.5 hours",
            "prerequisites": [
                {"name": "Python Foundations", "status": "met"},
                {"name": "SQL", "status": "met"},
            ],
            "careerRelevance": "High",
            "whyReason": {
                "strongSkills": ["Python", "SQL"],
                "partiallyMastered": ["Supervised Learning"],
                "careerRequirement": "Builds portfolio evidence for end-to-end classification pipeline.",
                "recentGapTrigger": "Matches your preferred Hands-on Projects learning style.",
            },
            "provider": "PathFinder Capstone Studio", "rating": 4.8,
        },
    ])

    # 5. Populate roadmap
    roadmaps_collection.delete_many({"user_id": user_id})
    roadmaps_collection.insert_many([
        {"user_id": user_id, "id": "rd_01", "title": "Python Core & Data Wrangling",
         "skillName": "Python Foundations", "phase": 1, "phaseTitle": "Foundations & Data Stack",
         "order": 1, "status": "completed", "estimatedHours": 15, "difficulty": "Beginner",
         "resourcesCount": 6, "whyPositioned": "Verified initial proficiency in diagnostic assessment."},
        {"user_id": user_id, "id": "rd_02", "title": "SQL & Relational Data Engineering",
         "skillName": "SQL & Database Design", "phase": 1, "phaseTitle": "Foundations & Data Stack",
         "order": 2, "status": "completed", "estimatedHours": 12, "difficulty": "Beginner",
         "resourcesCount": 4, "whyPositioned": "Verified SQL mastery in diagnostic assessment."},
        {"user_id": user_id, "id": "rd_03", "title": "Applied Statistics & Probability for ML",
         "skillName": "Statistics & Probability", "phase": 2, "phaseTitle": "Mathematical Rigor",
         "order": 3, "status": "current", "estimatedHours": 10, "difficulty": "Intermediate",
         "resourcesCount": 5, "whyPositioned": "Targeted gap: Needed for hypothesis testing."},
        {"user_id": user_id, "id": "rd_04", "title": "Supervised Learning & Regression Systems",
         "skillName": "Machine Learning Fundamentals", "phase": 3, "phaseTitle": "Core Machine Learning",
         "order": 4, "status": "current", "estimatedHours": 18, "difficulty": "Intermediate",
         "resourcesCount": 8, "whyPositioned": "Direct milestone towards ML Engineer goal."},
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
