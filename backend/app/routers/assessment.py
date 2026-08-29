"""
PathFinder Backend — Assessment Router
Handles diagnostic assessment delivery and submission with scoring logic.
"""
import time
import json
from pathlib import Path
from fastapi import APIRouter, Depends

from app.database import (
    learner_models_collection,
    assessments_collection,
    assessment_attempts_collection,
    skill_gaps_collection,
    recommendations_collection,
    roadmaps_collection,
    progress_collection,
    badges_collection,
)
from app.core.security import get_current_user_id
from app.schemas.models import AssessmentSubmitSchema

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
    """Score submitted answers, update learner model, skill gaps, recommendations, roadmap, and badges dynamically."""
    questions = _load_questions()
    questions_map = {q["id"]: q for q in questions}
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

    # 2. Evaluate answers dynamically by skill ID
    skill_correct_counts = {}
    skill_total_counts = {}
    
    for qid, ans_idx in data.answers.items():
        if qid in questions_map:
            q = questions_map[qid]
            sid = q["skillId"]
            is_correct = (q["correctIndex"] == ans_idx)
            
            skill_total_counts[sid] = skill_total_counts.get(sid, 0) + 1
            if is_correct:
                skill_correct_counts[sid] = skill_correct_counts.get(sid, 0) + 1

    all_skills = [
        "python_foundations", "statistics_probability", "machine_learning",
        "model_evaluation", "sql_databases", "deep_learning",
        "linear_algebra", "data_structures"
    ]
    
    skill_scores = {}
    for sid in all_skills:
        if sid in skill_total_counts:
            correct = skill_correct_counts.get(sid, 0)
            total = skill_total_counts[sid]
            skill_scores[sid] = int((correct / total) * 100)
        else:
            # Default for unassessed skills
            skill_scores[sid] = 30

    # Classify strengths and weaknesses
    skill_names = {
        "python_foundations": "Python Foundations",
        "statistics_probability": "Statistics & Probability",
        "machine_learning": "Machine Learning Fundamentals",
        "model_evaluation": "Model Evaluation & Tuning",
        "sql_databases": "SQL & Databases",
        "deep_learning": "Deep Learning",
        "linear_algebra": "Linear Algebra",
        "data_structures": "Data Structures & Algorithms"
    }
    
    strong_skills = []
    weak_skills = []
    for sid, score_val in skill_scores.items():
        name = skill_names.get(sid, sid.replace("_", " ").title())
        if score_val >= 75:
            strong_skills.append(name)
        else:
            weak_skills.append(name)

    # 3. Update learner model with detailed skill scores
    learner_models_collection.update_one(
        {"user_id": user_id},
        {"$set": {
            "knowledge.overallMastery": score,
            "knowledge.conceptsMastered": num_correct,
            "knowledge.totalConcepts": total_q,
            "knowledge.strongSkills": strong_skills,
            "knowledge.weakSkills": weak_skills,
            "knowledge.skill_scores": skill_scores,
            "ability.assessmentAccuracy": score,
            "ability.totalAttempts": 1,
            "ability.masteryProgression": score,
            "lastUpdated": now_str,
        }},
        upsert=True,
    )

    # 4. Populate skill gaps dynamically based on target career
    from app.database import profiles_collection
    from app.core.career_engine import get_career_skill_requirements
    
    profile = profiles_collection.find_one({"user_id": user_id}) or {}
    target_career = profile.get("targetCareer", "Machine Learning Engineer")
    
    career_skills = get_career_skill_requirements(target_career)
    
    skill_gaps_collection.delete_many({"user_id": user_id})
    new_gaps = []
    
    for req in career_skills:
        name = req.get("name", "")
        sid = name.lower().replace(" ", "_").replace("&", "and").replace("/", "_")
        
        learner_level = skill_scores.get(sid, 30)
        required_level = req.get("required", 80)
        
        if learner_level < required_level:
            gap = required_level - learner_level
            priority = "Critical" if gap > 40 else "High" if gap > 20 else "Medium"
            estimated_hours = req.get("estimatedHours", 15)
            
            from app.core.skill_graph import get_skill_graph
            graph = get_skill_graph()
            graph_skill = graph.get_skill(sid)
            
            prereqs = graph_skill.get("prerequisites", []) if graph_skill else []
            desc = graph_skill.get("description", "Essential for target career.") if graph_skill else ""
            
            prereq_names = [skill_names.get(p, p.replace("_", " ").title()) for p in prereqs]
            
            new_gaps.append({
                "user_id": user_id,
                "skillId": sid,
                "skillName": name,
                "currentLevel": int(learner_level),
                "requiredLevel": int(required_level),
                "gapPriority": priority,
                "estimatedHours": estimated_hours,
                "prerequisites": prereq_names,
                "careerRelevance": desc,
            })
            
    if new_gaps:
        skill_gaps_collection.insert_many(new_gaps)

    # 5. Populate recommendations dynamically using pure Python ML recommendation engine
    from app.core.recommendation import recommend_resources
    from app.core.llm import generate_why_reason
    
    recommendations_collection.delete_many({"user_id": user_id})
    new_recs = []
    
    for idx, gap in enumerate(new_gaps[:3]):
        gap_name = gap["skillName"]
        matched_courses = recommend_resources(gap_name, top_n=1)
        if matched_courses:
            course = matched_courses[0]
            prior_knowledge = {skill_names.get(k, k): v for k, v in skill_scores.items()}
            why_json = generate_why_reason(gap_name, target_career, prior_knowledge)
            
            prereq_list = [{"name": p, "status": "met" if skill_scores.get(p.lower().replace(" ", "_"), 0) >= 75 else "unmet"} 
                           for p in gap["prerequisites"]]
            
            new_recs.append({
                "user_id": user_id,
                "id": f"rec_{idx+1:02d}",
                "title": course.get("title", gap_name + " Course"),
                "type": course.get("type", "Course"),
                "skillGapClosed": gap_name,
                "difficulty": course.get("difficulty", "Intermediate"),
                "estimatedTime": course.get("estimatedTime", "5 hours"),
                "prerequisites": prereq_list,
                "careerRelevance": "High",
                "whyReason": why_json,
                "provider": course.get("provider", "PathFinder Lab"),
                "rating": course.get("rating", 4.8),
            })
            
    if new_recs:
        recommendations_collection.insert_many(new_recs)

    # 6. Populate roadmap dynamically by calling skill graph engine
    from app.routers.career import _regenerate_roadmap
    _regenerate_roadmap(user_id, target_career)

    # 7. Update progress
    progress_collection.update_one(
        {"user_id": user_id},
        {"$set": {
            "careerReadiness": max(15, min(95, int(score * 0.7 + 10))),
            "skillsMasteredCount": len(strong_skills),
            "totalSkillsCount": len(career_skills) if career_skills else 6,
            "streakDays": 1,
            "learningHours": 1.5
        }},
        upsert=True,
    )

    # 8. Award badge if score >= 75
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
        "mastered": strong_skills,
        "weaknesses": weak_skills,
        "difficultyReached": "Intermediate" if score >= 50 else "Beginner",
        "recommendedNextAction": "Complete target practice modules to level up skill gaps.",
    }
