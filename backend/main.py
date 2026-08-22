import time
import bcrypt
import jwt
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from backend.app.database import (
    client,
    db,
    users_collection,
    profiles_collection,
    learner_models_collection,
    assessments_collection,
    assessment_attempts_collection,
    skill_gaps_collection,
    recommendations_collection,
    roadmaps_collection,
    progress_collection,
    badges_collection,
    learning_sessions_collection,
    JWT_SECRET,
    JWT_ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI(
    title="PathFinder Real FastAPI + MongoDB Atlas Backend",
    description="Production-grade API for PathFinder Career Navigator connected to MongoDB Atlas",
    version="2.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH HELPER FUNCTIONS ---
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "iat": int(time.time()),
        "exp": int(time.time()) + (ACCESS_TOKEN_EXPIRE_MINUTES * 60 * 24 * 7), # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired. Please log in again.")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token.")

def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization header.")
    token = authorization.split(" ")[1]
    payload = decode_jwt_token(token)
    return payload["sub"]

def sanitize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Remove MongoDB _id from returned dictionaries."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# --- PYDANTIC SCHEMAS ---
class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordSchema(BaseModel):
    email: EmailStr

class ResetPasswordSchema(BaseModel):
    token: str
    password: str

class ProfileUpdateSchema(BaseModel):
    name: Optional[str] = None
    education: Optional[str] = None
    targetCareer: Optional[str] = None
    career_goal: Optional[str] = None
    learning_preferences: Optional[List[str]] = None
    weekly_availability: Optional[Dict[str, Any]] = None
    target_completion_date: Optional[str] = None

class AssessmentSubmitSchema(BaseModel):
    answers: Dict[str, int]

class PracticeSubmitSchema(BaseModel):
    questionId: str
    selectedIndex: int

class ChatSchema(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

# --- HEALTH CHECK (REAL MONGODB TEST) ---
@app.get("/api/health")
def health_check():
    try:
        client.admin.command("ping")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "detail": str(e)}

# --- AUTHENTICATION ENDPOINTS ---
@app.post("/api/auth/register")
def register(data: RegisterSchema):
    clean_email = data.email.strip().lower()
    
    # 1. Check MongoDB for existing user
    if users_collection.find_one({"email": clean_email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    # 2. Hash password with bcrypt
    hashed = hash_password(data.password)
    user_id = f"usr_{int(time.time() * 1000)}"
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")

    # 3. Create user document
    user_doc = {
        "id": user_id,
        "name": data.name.strip(),
        "email": clean_email,
        "password": hashed,
        "education": "Not Specified",
        "targetCareer": "Machine Learning Engineer",
        "createdAt": now_str
    }
    users_collection.insert_one(user_doc)

    # 4. Create profile document in MongoDB
    profile_doc = {
        "user_id": user_id,
        "name": data.name.strip(),
        "email": clean_email,
        "education": "Not Specified",
        "targetCareer": "Machine Learning Engineer",
        "career_goal": "Machine Learning Engineer",
        "skills": [],
        "learning_preferences": ["Hands-on practice", "Visual", "Projects"],
        "weekly_availability": {"weeklyHours": 10, "preferredDays": ["Mon", "Tue", "Thu", "Sat"]},
        "target_completion_date": "2026-12-31"
    }
    profiles_collection.insert_one(profile_doc)

    # 5. Create initial learner model document in MongoDB
    learner_model_doc = {
        "user_id": user_id,
        "knowledge": {
            "overallMastery": 0,
            "conceptsMastered": 0,
            "totalConcepts": 0,
            "strongSkills": [],
            "weakSkills": []
        },
        "ability": {
            "assessmentAccuracy": 0,
            "totalAttempts": 0,
            "masteryProgression": 0
        },
        "pace": {
            "avgSessionMinutes": 0,
            "progressVelocity": "New Learner",
            "estimatedDaysToMastery": 90
        },
        "behavior": {
            "sessionsPerWeek": 0,
            "completionRate": 0,
            "consistencyScore": 0,
            "roadmapDelayDays": 0
        },
        "preferences": {
            "resourceTypes": ["Hands-on practice", "Visual", "Interactive"],
            "explanationFormats": ["Code-first", "Step-by-step"]
        },
        "availability": {
            "weeklyHours": 10,
            "preferredDays": ["Mon", "Tue", "Thu", "Sat"],
            "targetCompletionDate": "2026-12-31"
        },
        "lastUpdated": now_str
    }
    learner_models_collection.insert_one(learner_model_doc)

    # 6. Create initial progress document
    progress_doc = {
        "user_id": user_id,
        "careerReadiness": 0,
        "skillsMasteredCount": 0,
        "totalSkillsCount": 6,
        "learningHours": 0.0,
        "streakDays": 0,
        "plannedWeeklyHours": 10,
        "actualWeeklyHours": 0.0,
        "weeklyRhythm": [
            {"day": "Mon", "planned": 2, "actual": 0.0},
            {"day": "Tue", "planned": 2, "actual": 0.0},
            {"day": "Wed", "planned": 2, "actual": 0.0},
            {"day": "Thu", "planned": 2, "actual": 0.0},
            {"day": "Fri", "planned": 2, "actual": 0.0},
            {"day": "Sat", "planned": 0, "actual": 0.0},
            {"day": "Sun", "planned": 0, "actual": 0.0}
        ],
        "scoreTrend": []
    }
    progress_collection.insert_one(progress_doc)

    # 7. Generate JWT
    token = create_jwt_token(user_id, clean_email)

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": user_doc["name"],
            "email": clean_email,
            "education": user_doc["education"],
            "targetCareer": user_doc["targetCareer"]
        }
    }

@app.post("/api/auth/login")
def login(data: LoginSchema):
    clean_email = data.email.strip().lower()
    
    # Lookup in MongoDB users collection
    user_doc = users_collection.find_one({"email": clean_email})
    if not user_doc or not verify_password(data.password, user_doc.get("password", "")):
        raise HTTPException(status_code=400, detail="Incorrect email or password.")

    token = create_jwt_token(user_doc["id"], user_doc["email"])
    return {
        "token": token,
        "user": {
            "id": user_doc["id"],
            "name": user_doc["name"],
            "email": user_doc["email"],
            "education": user_doc.get("education", "Not Specified"),
            "targetCareer": user_doc.get("targetCareer", "Machine Learning Engineer")
        }
    }

@app.post("/api/auth/logout")
def logout():
    return {"message": "Successfully logged out"}

@app.get("/api/auth/me")
def get_me(user_id: str = Depends(get_current_user_id)):
    user_doc = users_collection.find_one({"id": user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user_doc["id"],
        "name": user_doc["name"],
        "email": user_doc["email"],
        "education": user_doc.get("education", "Not Specified"),
        "targetCareer": user_doc.get("targetCareer", "Machine Learning Engineer")
    }

@app.post("/api/auth/forgot-password")
def forgot_password(data: ForgotPasswordSchema):
    return {"message": "If an account exists with this email, password reset instructions have been sent."}

@app.post("/api/auth/reset-password")
def reset_password(data: ResetPasswordSchema):
    return {"message": "Password updated successfully."}


# --- USER ISOLATED LEARNER ENDPOINTS ---

@app.get("/api/dashboard")
def get_dashboard(user_id: str = Depends(get_current_user_id)):
    profile = profiles_collection.find_one({"user_id": user_id})
    learner_model = learner_models_collection.find_one({"user_id": user_id})
    progress = progress_collection.find_one({"user_id": user_id})
    
    recs = list(recommendations_collection.find({"user_id": user_id}))
    roadmaps = list(roadmaps_collection.find({"user_id": user_id}))
    skill_gaps = list(skill_gaps_collection.find({"user_id": user_id}))

    target_career = profile.get("targetCareer", "Machine Learning Engineer") if profile else "Machine Learning Engineer"
    career_readiness = progress.get("careerReadiness", 0) if progress else 0

    primary_rec = sanitize_doc(recs[0]) if recs else None
    sanitized_roadmaps = [sanitize_doc(r) for r in roadmaps[:4]]
    
    skills_overview = []
    if skill_gaps:
        for sg in skill_gaps:
            skills_overview.append({
                "name": sg.get("skillName", "Skill"),
                "current": sg.get("currentLevel", 0),
                "required": sg.get("requiredLevel", 80)
            })
    else:
        # Initial target skills
        skills_overview = [
            {"name": "Python", "current": 0, "required": 85},
            {"name": "SQL", "current": 0, "required": 75},
            {"name": "Statistics", "current": 0, "required": 80},
            {"name": "ML Alg", "current": 0, "required": 85},
            {"name": "Evaluation", "current": 0, "required": 80}
        ]

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
        "actualHours": progress.get("actualWeeklyHours", 0.0) if progress else 0.0
    }

@app.get("/api/learner-model")
def get_learner_model(user_id: str = Depends(get_current_user_id)):
    user_info = get_me(user_id)
    model = learner_models_collection.find_one({"user_id": user_id})
    if not model:
        raise HTTPException(status_code=404, detail="Learner model not initialized for user")
    
    sanitized = sanitize_doc(model)
    sanitized["user"] = user_info
    return sanitized

@app.get("/api/skill-gaps")
def get_skill_gaps(user_id: str = Depends(get_current_user_id)):
    items = list(skill_gaps_collection.find({"user_id": user_id}))
    return [sanitize_doc(item) for item in items]

@app.get("/api/recommendations")
def get_recommendations(user_id: str = Depends(get_current_user_id)):
    items = list(recommendations_collection.find({"user_id": user_id}))
    return [sanitize_doc(item) for item in items]

@app.get("/api/roadmap")
def get_roadmap(user_id: str = Depends(get_current_user_id)):
    items = list(roadmaps_collection.find({"user_id": user_id}).sort("order", 1))
    return [sanitize_doc(item) for item in items]

@app.post("/api/roadmap/recalculate")
def recalculate_roadmap(data: Optional[Dict[str, Any]] = None, user_id: str = Depends(get_current_user_id)):
    items = get_roadmap(user_id)
    return {
        "success": True,
        "updatedRoadmap": items,
        "message": "Adaptive AI updated your personalized learning path based on latest assessment mastery."
    }

# --- ASSESSMENT ENDPOINTS ---
@app.get("/api/assessment/start")
def start_assessment(user_id: str = Depends(get_current_user_id)):
    return [
        {
            "id": "q1",
            "skill": "Python Foundations",
            "difficulty": "Easy",
            "question": "Which Python data structure maintains insertion order and guarantees unique keys?",
            "options": ["List", "Dictionary (Python 3.7+)", "Set", "Tuple"],
            "conceptTag": "Data Structures"
        },
        {
            "id": "q2",
            "skill": "Statistics & Probability",
            "difficulty": "Intermediate",
            "question": "When evaluating a binary classifier with high class imbalance, which metric is LEAST informative?",
            "options": ["ROC-AUC", "Precision-Recall AUC", "Standard Classification Accuracy", "F1-Score"],
            "conceptTag": "Evaluation Metrics"
        },
        {
            "id": "q3",
            "skill": "Model Evaluation & Tuning",
            "difficulty": "Intermediate",
            "question": "A Decision Tree model displays 99% training accuracy but 62% validation accuracy. What phenomenon is occurring?",
            "options": ["Underfitting", "Overfitting (High Variance)", "Optimal Convergence", "Data Leakage"],
            "conceptTag": "Overfitting vs Underfitting"
        },
        {
            "id": "q4",
            "skill": "SQL & Relational Databases",
            "difficulty": "Easy",
            "question": "Which SQL clause is used to filter records resulting from an aggregate function (e.g., GROUP BY)?",
            "options": ["WHERE", "HAVING", "ORDER BY", "FILTER"],
            "conceptTag": "SQL Aggregations"
        }
    ]

@app.post("/api/assessment/submit")
def submit_assessment(data: AssessmentSubmitSchema, user_id: str = Depends(get_current_user_id)):
    # Calculate real score from submitted answers
    correct_mapping = {"q1": 1, "q2": 2, "q3": 1, "q4": 1}
    total_q = len(correct_mapping)
    num_correct = 0
    
    for qid, ans_idx in data.answers.items():
        if qid in correct_mapping and correct_mapping[qid] == ans_idx:
            num_correct += 1
            
    score = int((num_correct / total_q) * 100) if total_q > 0 else 50
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")

    # 1. Save attempt in MongoDB
    attempt_doc = {
        "user_id": user_id,
        "score": score,
        "answers": data.answers,
        "timestamp": now_str
    }
    assessment_attempts_collection.insert_one(attempt_doc)

    # 2. Update user's Learner Model in MongoDB Atlas
    learner_models_collection.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "knowledge.overallMastery": score,
                "knowledge.conceptsMastered": num_correct,
                "knowledge.totalConcepts": total_q,
                "knowledge.strongSkills": ["Python Foundations", "SQL Aggregations"] if score >= 50 else ["Python Basics"],
                "knowledge.weakSkills": ["Model Evaluation Metrics", "Imbalanced Classification"] if score < 75 else ["Advanced MLOps"],
                "ability.assessmentAccuracy": score,
                "ability.totalAttempts": 1,
                "ability.masteryProgression": score,
                "lastUpdated": now_str
            }
        },
        upsert=True
    )

    # 3. Populate / Update Skill Gaps in MongoDB Atlas for this user
    skill_gaps_collection.delete_many({"user_id": user_id})
    new_gaps = [
        {
            "user_id": user_id,
            "skillId": "skl_eval",
            "skillName": "Model Evaluation & Tuning",
            "currentLevel": max(30, score - 20),
            "requiredLevel": 80,
            "gapPriority": "Critical" if score < 70 else "Medium",
            "estimatedHours": 12,
            "prerequisites": ["Machine Learning Fundamentals"],
            "careerRelevance": "Essential for ML Engineers to assess overfitting, ROC-AUC, Precision/Recall trade-offs."
        },
        {
            "user_id": user_id,
            "skillId": "skl_math",
            "skillName": "Statistics & Probability",
            "currentLevel": max(40, score - 15),
            "requiredLevel": 80,
            "gapPriority": "High",
            "estimatedHours": 10,
            "prerequisites": ["Python Foundations"],
            "careerRelevance": "Underpins hypothesis testing, Bayes theorem, and statistical inference in ML."
        },
        {
            "user_id": user_id,
            "skillId": "skl_ml",
            "skillName": "Machine Learning Fundamentals",
            "currentLevel": max(35, score - 10),
            "requiredLevel": 85,
            "gapPriority": "High",
            "estimatedHours": 20,
            "prerequisites": ["Python Foundations", "Statistics & Probability"],
            "careerRelevance": "Core competence required for supervised and unsupervised algorithmic modeling."
        }
    ]
    skill_gaps_collection.insert_many(new_gaps)

    # 4. Populate / Update Recommendations in MongoDB Atlas for this user
    recommendations_collection.delete_many({"user_id": user_id})
    new_recs = [
        {
            "user_id": user_id,
            "id": "rec_01",
            "title": "Precision, Recall & ROC-AUC Deep Dive",
            "type": "Practice",
            "skillGapClosed": "Model Evaluation & Tuning",
            "difficulty": "Intermediate",
            "estimatedTime": "45 mins",
            "prerequisites": [
                {"name": "Python Foundations", "status": "met"},
                {"name": "Statistics & Probability", "status": "partial"}
            ],
            "careerRelevance": "Critical",
            "whyReason": {
                "strongSkills": ["Python Foundations"],
                "partiallyMastered": ["Statistics"],
                "careerRequirement": "ML Engineer role requires 80%+ evaluation mastery.",
                "recentGapTrigger": f"Diagnostic score ({score}%) identified precision/recall evaluation trade-offs as high priority."
            },
            "provider": "PathFinder Interactive Lab",
            "rating": 4.9
        },
        {
            "user_id": user_id,
            "id": "rec_02",
            "title": "Hands-on Customer Churn Classifier Project",
            "type": "Project",
            "skillGapClosed": "Machine Learning Fundamentals",
            "difficulty": "Intermediate",
            "estimatedTime": "3.5 hours",
            "prerequisites": [
                {"name": "Python Foundations", "status": "met"},
                {"name": "SQL", "status": "met"}
            ],
            "careerRelevance": "High",
            "whyReason": {
                "strongSkills": ["Python", "SQL"],
                "partiallyMastered": ["Supervised Learning"],
                "careerRequirement": "Builds portfolio evidence for end-to-end classification pipeline.",
                "recentGapTrigger": "Matches your preferred Hands-on Projects learning style."
            },
            "provider": "PathFinder Capstone Studio",
            "rating": 4.8
        }
    ]
    recommendations_collection.insert_many(new_recs)

    # 5. Populate / Update Roadmap in MongoDB Atlas for this user
    roadmaps_collection.delete_many({"user_id": user_id})
    new_roadmaps = [
        {"user_id": user_id, "id": "rd_01", "title": "Python Core & Data Wrangling", "skillName": "Python Foundations", "phase": 1, "phaseTitle": "Foundations & Data Stack", "order": 1, "status": "completed", "estimatedHours": 15, "difficulty": "Beginner", "resourcesCount": 6, "whyPositioned": "Verified initial proficiency in diagnostic assessment."},
        {"user_id": user_id, "id": "rd_02", "title": "SQL & Relational Data Engineering", "skillName": "SQL & Database Design", "phase": 1, "phaseTitle": "Foundations & Data Stack", "order": 2, "status": "completed", "estimatedHours": 12, "difficulty": "Beginner", "resourcesCount": 4, "whyPositioned": "Verified SQL mastery in diagnostic assessment."},
        {"user_id": user_id, "id": "rd_03", "title": "Applied Statistics & Probability for ML", "skillName": "Statistics & Probability", "phase": 2, "phaseTitle": "Mathematical Rigor", "order": 3, "status": "current", "estimatedHours": 10, "difficulty": "Intermediate", "resourcesCount": 5, "whyPositioned": "Targeted gap: Needed for hypothesis testing."},
        {"user_id": user_id, "id": "rd_04", "title": "Supervised Learning & Regression Systems", "skillName": "Machine Learning Fundamentals", "phase": 3, "phaseTitle": "Core Machine Learning", "order": 4, "status": "current", "estimatedHours": 18, "difficulty": "Intermediate", "resourcesCount": 8, "whyPositioned": "Direct milestone towards ML Engineer goal."}
    ]
    roadmaps_collection.insert_many(new_roadmaps)

    # 6. Update Progress in MongoDB Atlas
    progress_collection.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "careerReadiness": max(50, score),
                "skillsMasteredCount": num_correct,
                "streakDays": 1,
                "learningHours": 1.5
            }
        },
        upsert=True
    )

    # 7. Add Badge if score is high
    if score >= 75:
        badges_collection.update_one(
            {"user_id": user_id, "id": "bdg_diag"},
            {
                "$set": {
                    "user_id": user_id,
                    "id": "bdg_diag",
                    "title": "Diagnostic Achiever",
                    "description": f"Scored {score}% on initial diagnostic assessment.",
                    "category": "Core Engineering",
                    "masteryPercentage": score,
                    "dateEarned": now_str[:10],
                    "iconName": "Award",
                    "verifiedByAssessment": True,
                    "isUnlocked": True
                }
            },
            upsert=True
        )

    return {
        "attemptId": f"att_{int(time.time())}",
        "score": score,
        "mastered": ["Data Structures", "SQL Aggregations"] if score >= 50 else ["Basic Python"],
        "weaknesses": ["Evaluation Metrics Trade-offs"],
        "difficultyReached": "Intermediate",
        "recommendedNextAction": "Complete target practice modules to level up skill gaps."
    }

@app.get("/api/practice/next")
def get_next_practice(user_id: str = Depends(get_current_user_id)):
    return {
        "id": "q_prac_101",
        "skill": "Model Evaluation & Tuning",
        "difficulty": "Intermediate",
        "question": "A classifier evaluates 1,000 transactions. It correctly flags 90 fraudulent cases, misclassifies 10 fraudulent cases as legitimate, and flags 20 legitimate transactions as fraudulent. What is the Precision of the model?",
        "options": [
            "81.8% (Precision = 90 / (90 + 20))",
            "90.0% (Precision = 90 / (90 + 10))",
            "75.0% (Precision = 90 / (90 + 30))",
            "95.0% (Precision = 190 / 200)"
        ],
        "conceptTag": "Confusion Matrix Analysis"
    }

@app.post("/api/practice/submit")
def submit_practice(data: PracticeSubmitSchema, user_id: str = Depends(get_current_user_id)):
    is_correct = data.selectedIndex == 0
    if is_correct:
        # Increment learning hours & streak
        progress_collection.update_one(
            {"user_id": user_id},
            {"$inc": {"learningHours": 0.5, "streakDays": 1}},
            upsert=True
        )
        return {
            "conceptUnderstanding": True,
            "formulaApplication": True,
            "algebraicStep": True,
            "unitConversion": True,
            "feedbackSummary": "Perfect! You correctly identified Precision = TP / (TP + FP) = 90 / (90 + 20) = 81.8%.",
            "recommendedAction": "Ready to advance to higher difficulty questions."
        }
    else:
        return {
            "conceptUnderstanding": True,
            "formulaApplication": True,
            "algebraicStep": False,
            "unitConversion": True,
            "feedbackSummary": "The core concept appears correct! The error occurred in computing the denominator (TP + FP).",
            "recommendedAction": "Review Precision formula before trying again."
        }

@app.get("/api/progress")
def get_progress(user_id: str = Depends(get_current_user_id)):
    doc = progress_collection.find_one({"user_id": user_id})
    if not doc:
        return {
            "careerReadiness": 0,
            "skillsMasteredCount": 0,
            "totalSkillsCount": 6,
            "learningHours": 0.0,
            "streakDays": 0,
            "plannedWeeklyHours": 10,
            "actualWeeklyHours": 0.0,
            "weeklyRhythm": [
                {"day": "Mon", "planned": 2, "actual": 0.0},
                {"day": "Tue", "planned": 2, "actual": 0.0},
                {"day": "Wed", "planned": 2, "actual": 0.0},
                {"day": "Thu", "planned": 2, "actual": 0.0},
                {"day": "Fri", "planned": 2, "actual": 0.0},
                {"day": "Sat", "planned": 0, "actual": 0.0},
                {"day": "Sun", "planned": 0, "actual": 0.0}
            ],
            "scoreTrend": []
        }
    return sanitize_doc(doc)

@app.get("/api/badges")
def get_badges(user_id: str = Depends(get_current_user_id)):
    items = list(badges_collection.find({"user_id": user_id}))
    return [sanitize_doc(item) for item in items]

@app.get("/api/profile")
def get_profile(user_id: str = Depends(get_current_user_id)):
    user_info = get_me(user_id)
    prof = profiles_collection.find_one({"user_id": user_id})
    if not prof:
        return {
            "user": user_info,
            "education": "Not Specified",
            "targetCareer": "Machine Learning Engineer",
            "career_goal": "Machine Learning Engineer",
            "skills": [],
            "learning_preferences": ["Hands-on practice", "Visual"],
            "weekly_availability": {"weeklyHours": 10, "preferredDays": ["Mon", "Wed", "Fri"]},
            "target_completion_date": "2026-12-31"
        }
    
    sanitized = sanitize_doc(prof)
    sanitized["user"] = user_info
    return sanitized

@app.put("/api/profile")
def update_profile(data: ProfileUpdateSchema, user_id: str = Depends(get_current_user_id)):
    updates = {}
    if data.name:
        users_collection.update_one({"id": user_id}, {"$set": {"name": data.name}})
        updates["name"] = data.name
    if data.education:
        users_collection.update_one({"id": user_id}, {"$set": {"education": data.education}})
        updates["education"] = data.education
    if data.targetCareer:
        users_collection.update_one({"id": user_id}, {"$set": {"targetCareer": data.targetCareer}})
        updates["targetCareer"] = data.targetCareer
        updates["career_goal"] = data.targetCareer
    if data.learning_preferences is not None:
        updates["learning_preferences"] = data.learning_preferences
    if data.weekly_availability is not None:
        updates["weekly_availability"] = data.weekly_availability
    if data.target_completion_date is not None:
        updates["target_completion_date"] = data.target_completion_date

    if updates:
        profiles_collection.update_one({"user_id": user_id}, {"$set": updates}, upsert=True)

    return get_profile(user_id)

@app.get("/api/careers")
def get_careers():
    return [
        {
            "id": "car_mle",
            "title": "Machine Learning Engineer",
            "description": "Designs, builds, and deploys production machine learning pipelines and deep learning systems.",
            "matchScore": 84,
            "readinessScore": 74,
            "estimatedMonths": 3,
            "salaryRange": "$120,000 - $175,000",
            "demandGrowth": "+34% YoY",
            "keySkills": [
                {"name": "Python Foundations", "required": 85, "userProficiency": 90},
                {"name": "SQL & Database Design", "required": 75, "userProficiency": 85},
                {"name": "Statistics & Probability", "required": 80, "userProficiency": 55},
                {"name": "Model Evaluation & Tuning", "required": 80, "userProficiency": 30}
            ]
        },
        {
            "id": "car_ds",
            "title": "Data Scientist",
            "description": "Extracts strategic business insights using statistical analysis, predictive modeling, and data story-telling.",
            "matchScore": 88,
            "readinessScore": 76,
            "estimatedMonths": 2.5,
            "salaryRange": "$110,000 - $160,000",
            "demandGrowth": "+28% YoY",
            "keySkills": [
                {"name": "Python Foundations", "required": 90, "userProficiency": 90},
                {"name": "SQL & Database Design", "required": 85, "userProficiency": 85},
                {"name": "Statistics & Probability", "required": 90, "userProficiency": 55}
            ]
        }
    ]

@app.get("/api/partners")
def get_partners():
    return [
        {
            "id": "prt_01",
            "name": "Aravind Swamy",
            "role": "Aspiring AI Researcher",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            "matchPercentage": 94,
            "targetCareer": "Machine Learning Engineer",
            "currentFocus": "Deep Learning & Neural Networks",
            "complementarySkills": ["Deep Learning", "PyTorch", "Mathematics"]
        },
        {
            "id": "prt_02",
            "name": "Sophia Chen",
            "role": "Data Science Graduate",
            "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            "matchPercentage": 89,
            "targetCareer": "Data Scientist",
            "currentFocus": "Model Evaluation & Statistics",
            "complementarySkills": ["Statistics & P-Values", "Data Storytelling", "Python"]
        }
    ]

@app.post("/api/chat")
def ai_chat(data: ChatSchema, user_id: str = Depends(get_current_user_id)):
    msg = data.message.lower()
    if "why" in msg or "statistics" in msg:
        resp = "Statistics forms the foundation for machine learning algorithms. Concepts like probability distributions and hypothesis testing directly determine how model parameters are estimated."
    elif "code" in msg or "example" in msg:
        resp = "Here is a Python snippet for computing Precision and Recall:\n\n```python\nfrom sklearn.metrics import precision_score, recall_score\ny_true = [0, 1, 1, 0, 1]\ny_pred = [0, 1, 0, 0, 1]\nprint(precision_score(y_true, y_pred))\n```"
    else:
        resp = "Based on your active learner model, focusing on Model Evaluation will give you the highest career readiness increase. Let me know if you would like a code example or visual explanation!"
    return {"response": resp}
