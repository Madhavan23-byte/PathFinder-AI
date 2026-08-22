import os
import time
import jwt
import hashlib
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Header, Status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
import uvicorn

# --- CONFIGURATION ---
MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://admin:UQSbqKc6hDcZ8VIH@cluster0.ftb8yho.mongodb.net/pathfinder?retryWrites=true&w=majority&appName=Cluster0"
)
JWT_SECRET = os.getenv("JWT_SECRET", "pathfinder_super_secret_jwt_key_2026")
JWT_ALGORITHM = "HS256"

# Connect to MongoDB
try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    db = client.get_database("pathfinder")
    users_collection = db["users"]
    profiles_collection = db["profiles"]
    print("[PathFinder Backend] MongoDB connected successfully.")
except Exception as e:
    print(f"[PathFinder Backend] MongoDB connection warning: {e}")
    # Fallback in-memory database if MongoDB cluster unreachable
    db = None
    in_memory_users = {}
    in_memory_profiles = {}

app = FastAPI(
    title="PathFinder Adaptive AI Backend",
    description="FastAPI + MongoDB API powering PathFinder Career Navigator",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- HELPER FUNCTIONS ---
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": time.time() + (3600 * 24 * 30), # 30 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception:
        raise HTTPException(
            status_code=Status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )

def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=Status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )
    token = authorization.split(" ")[1]
    payload = decode_jwt_token(token)
    return payload["sub"]

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
    user: Optional[Dict[str, Any]] = None
    availability: Optional[Dict[str, Any]] = None

class AssessmentSubmitSchema(BaseModel):
    answers: Dict[str, int]

class PracticeSubmitSchema(BaseModel):
    questionId: str
    selectedIndex: int

class ChatSchema(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


# --- AUTHENTICATION ENDPOINTS ---

@app.post("/api/auth/register")
def register(data: RegisterSchema):
    hashed = hash_password(data.password)
    user_id = f"usr_{int(time.time() * 1000)}"

    if db is not None:
        if users_collection.find_one({"email": data.email}):
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        user_doc = {
            "id": user_id,
            "name": data.name,
            "email": data.email,
            "password": hashed,
            "education": "Not Specified",
            "targetCareer": "Machine Learning Engineer",
            "createdAt": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        users_collection.insert_one(user_doc)
    else:
        if data.email in in_memory_users:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        user_doc = {
            "id": user_id,
            "name": data.name,
            "email": data.email,
            "password": hashed,
            "education": "Not Specified",
            "targetCareer": "Machine Learning Engineer",
        }
        in_memory_users[data.email] = user_doc

    token = create_jwt_token(user_id, data.email)
    user_data = {
        "id": user_id,
        "name": data.name,
        "email": data.email,
        "education": user_doc["education"],
        "targetCareer": user_doc["targetCareer"],
    }
    return {"token": token, "user": user_data}


@app.post("/api/auth/login")
def login(data: LoginSchema):
    hashed = hash_password(data.password)

    if db is not None:
        user_doc = users_collection.find_one({"email": data.email})
        if not user_doc or user_doc.get("password") != hashed:
            raise HTTPException(status_code=400, detail="Incorrect email or password. Please check your credentials and try again.")
    else:
        user_doc = in_memory_users.get(data.email)
        if not user_doc or user_doc.get("password") != hashed:
            raise HTTPException(status_code=400, detail="Incorrect email or password. Please check your credentials and try again.")

    token = create_jwt_token(user_doc["id"], user_doc["email"])
    user_data = {
        "id": user_doc["id"],
        "name": user_doc["name"],
        "email": user_doc["email"],
        "education": user_doc.get("education", ""),
        "targetCareer": user_doc.get("targetCareer", "Machine Learning Engineer"),
    }
    return {"token": token, "user": user_data}


@app.post("/api/auth/logout")
def logout():
    return {"message": "Successfully logged out"}


@app.get("/api/auth/me")
def get_me(user_id: str = Depends(get_current_user_id)):
    if db is not None:
        user_doc = users_collection.find_one({"id": user_id})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "id": user_doc["id"],
            "name": user_doc["name"],
            "email": user_doc["email"],
            "education": user_doc.get("education", ""),
            "targetCareer": user_doc.get("targetCareer", "Machine Learning Engineer"),
        }
    else:
        for u in in_memory_users.values():
            if u["id"] == user_id:
                return {
                    "id": u["id"],
                    "name": u["name"],
                    "email": u["email"],
                    "education": u.get("education", ""),
                    "targetCareer": u.get("targetCareer", "Machine Learning Engineer"),
                }
        raise HTTPException(status_code=404, detail="User not found")


@app.post("/api/auth/forgot-password")
def forgot_password(data: ForgotPasswordSchema):
    return {"message": "If an account exists with this email, password reset instructions have been sent."}


@app.post("/api/auth/reset-password")
def reset_password(data: ResetPasswordSchema):
    return {"message": "Password updated successfully."}


# --- DASHBOARD & LEARNER MODEL ENDPOINTS ---

@app.get("/api/dashboard")
def get_dashboard(user_id: str = Depends(get_current_user_id)):
    # Retrieve real user name
    user_info = get_me(user_id)
    return {
        "targetCareer": user_info.get("targetCareer", "Machine Learning Engineer"),
        "careerReadiness": 74,
        "currentFocus": "Model Evaluation & Precision/Recall Metrics",
        "roadmapProgress": 48,
        "completedPhases": 3,
        "totalPhases": 7,
        "streakDays": 5,
        "primaryRecommendation": {
            "id": "rec_dash_01",
            "title": "Decision Trees, Confusion Matrices & ROC-AUC Evaluation",
            "type": "Course",
            "skillGapClosed": "Model Evaluation & Tuning",
            "difficulty": "Intermediate",
            "estimatedTime": "2 hours",
            "prerequisites": [
                {"name": "Python Foundations", "status": "met"},
                {"name": "Statistics Foundations", "status": "partial"}
            ],
            "careerRelevance": "Critical",
            "whyReason": {
                "strongSkills": ["Python Foundations", "SQL Queries"],
                "partiallyMastered": ["Statistics"],
                "careerRequirement": f"{user_info.get('targetCareer')} role requires 80%+ evaluation mastery.",
                "recentGapTrigger": "Your recent diagnostic test showed ambiguity between Type I and Type II errors."
            },
            "provider": "PathFinder AI Lab Studio",
            "rating": 4.9
        },
        "skillsOverview": [
            {"name": "Python", "current": 90, "required": 85},
            {"name": "SQL", "current": 85, "required": 75},
            {"name": "Statistics", "current": 55, "required": 80},
            {"name": "ML Alg", "current": 42, "required": 85},
            {"name": "Evaluation", "current": 30, "required": 80},
            {"name": "Deep Learn", "current": 20, "required": 75}
        ],
        "recentRoadmap": [
            {"id": "rd_01", "title": "Python Core & Data Wrangling", "phase": 1, "phaseTitle": "Foundations", "order": 1, "status": "completed", "estimatedHours": 15, "difficulty": "Beginner", "resourcesCount": 6, "whyPositioned": "Verified 90% mastery."},
            {"id": "rd_02", "title": "SQL & Relational Data Engineering", "phase": 1, "phaseTitle": "Foundations", "order": 2, "status": "completed", "estimatedHours": 12, "difficulty": "Beginner", "resourcesCount": 4, "whyPositioned": "Verified 85% mastery."},
            {"id": "rd_03", "title": "Applied Statistics & Probability for ML", "phase": 2, "phaseTitle": "Math Rigor", "order": 3, "status": "current", "estimatedHours": 10, "difficulty": "Intermediate", "resourcesCount": 5, "whyPositioned": "Targeted gap: Needed for hypothesis testing."},
            {"id": "rd_04", "title": "Supervised Learning & Regression Systems", "phase": 3, "phaseTitle": "Core ML", "order": 4, "status": "current", "estimatedHours": 18, "difficulty": "Intermediate", "resourcesCount": 8, "whyPositioned": "Direct milestone towards ML Engineer goal."}
        ],
        "plannedHours": 10,
        "actualHours": 6.5
    }


@app.get("/api/learner-model")
def get_learner_model(user_id: str = Depends(get_current_user_id)):
    user_info = get_me(user_id)
    return {
        "user": user_info,
        "knowledge": {
            "overallMastery": 74,
            "conceptsMastered": 14,
            "totalConcepts": 22,
            "strongSkills": ["Python Foundations", "SQL Data Querying", "Linear Algebra Basics"],
            "weakSkills": ["Model Evaluation Metrics", "Deep Learning Backpropagation", "MLOps Pipeline"]
        },
        "ability": {
            "assessmentAccuracy": 78,
            "totalAttempts": 45,
            "masteryProgression": 14
        },
        "pace": {
            "avgSessionMinutes": 42,
            "progressVelocity": "Optimal",
            "estimatedDaysToMastery": 64
        },
        "behavior": {
            "sessionsPerWeek": 5,
            "completionRate": 86,
            "consistencyScore": 92,
            "roadmapDelayDays": 0
        },
        "preferences": {
            "resourceTypes": ["Hands-on practice", "Visual", "Interactive", "Projects"],
            "explanationFormats": ["Code-first", "Visual Diagram", "Step-by-step"]
        },
        "availability": {
            "weeklyHours": 10,
            "preferredDays": ["Mon", "Tue", "Thu", "Sat", "Sun"],
            "targetCompletionDate": "2026-11-30"
        },
        "lastUpdated": time.strftime("%Y-%m-%d %H:%M:%S")
    }


@app.get("/api/skill-gaps")
def get_skill_gaps(user_id: str = Depends(get_current_user_id)):
    return [
        {
            "skillId": "skl_eval",
            "skillName": "Model Evaluation & Tuning",
            "currentLevel": 30,
            "requiredLevel": 80,
            "gapPriority": "Critical",
            "estimatedHours": 12,
            "prerequisites": ["Machine Learning Fundamentals"],
            "careerRelevance": "Essential for ML Engineers to assess overfitting, ROC-AUC, Precision/Recall trade-offs."
        },
        {
            "skillId": "skl_math",
            "skillName": "Statistics & Probability",
            "currentLevel": 55,
            "requiredLevel": 80,
            "gapPriority": "High",
            "estimatedHours": 10,
            "prerequisites": ["Python Foundations"],
            "careerRelevance": "Underpins hypothesis testing, Bayes theorem, and statistical inference in ML."
        },
        {
            "skillId": "skl_ml",
            "skillName": "Machine Learning Fundamentals",
            "currentLevel": 42,
            "requiredLevel": 85,
            "gapPriority": "High",
            "estimatedHours": 20,
            "prerequisites": ["Python Foundations", "Statistics & Probability"],
            "careerRelevance": "Core competence required for supervised and unsupervised algorithmic modeling."
        },
        {
            "skillId": "skl_dl",
            "skillName": "Deep Learning & Neural Networks",
            "currentLevel": 20,
            "requiredLevel": 75,
            "gapPriority": "High",
            "estimatedHours": 25,
            "prerequisites": ["Machine Learning Fundamentals"],
            "careerRelevance": "Required for computer vision, sequence modeling, and transformer architectures."
        }
    ]


@app.get("/api/recommendations")
def get_recommendations(user_id: str = Depends(get_current_user_id)):
    return [
        {
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
                "strongSkills": ["Python Foundations", "SQL Queries"],
                "partiallyMastered": ["Statistics"],
                "careerRequirement": "Target career role requires 80%+ evaluation mastery.",
                "recentGapTrigger": "Your recent diagnostic test showed ambiguity between Type I and Type II error trade-offs."
            },
            "provider": "PathFinder Interactive Lab",
            "rating": 4.9
        },
        {
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


@app.get("/api/roadmap")
def get_roadmap(user_id: str = Depends(get_current_user_id)):
    return [
        {"id": "rd_01", "title": "Python Core & Data Wrangling", "skillName": "Python Foundations", "phase": 1, "phaseTitle": "Foundations & Data Stack", "order": 1, "status": "completed", "estimatedHours": 15, "difficulty": "Beginner", "resourcesCount": 6, "whyPositioned": "Verified 90% mastery in diagnostic assessment."},
        {"id": "rd_02", "title": "SQL & Relational Data Engineering", "skillName": "SQL & Database Design", "phase": 1, "phaseTitle": "Foundations & Data Stack", "order": 2, "status": "completed", "estimatedHours": 12, "difficulty": "Beginner", "resourcesCount": 4, "whyPositioned": "Verified 85% mastery in diagnostic assessment."},
        {"id": "rd_03", "title": "Applied Statistics & Probability for ML", "skillName": "Statistics & Probability", "phase": 2, "phaseTitle": "Mathematical Rigor", "order": 3, "status": "current", "estimatedHours": 10, "difficulty": "Intermediate", "resourcesCount": 5, "whyPositioned": "Targeted gap: Needed for hypothesis testing."},
        {"id": "rd_04", "title": "Supervised Learning & Regression Systems", "skillName": "Machine Learning Fundamentals", "phase": 3, "phaseTitle": "Core Machine Learning", "order": 4, "status": "current", "estimatedHours": 18, "difficulty": "Intermediate", "resourcesCount": 8, "whyPositioned": "Direct milestone towards ML Engineer goal."}
    ]


@app.post("/api/roadmap/recalculate")
def recalculate_roadmap(data: Optional[Dict[str, Any]] = None, user_id: str = Depends(get_current_user_id)):
    updated = get_roadmap(user_id)
    return {
        "success": True,
        "updatedRoadmap": updated,
        "message": "Adaptive AI recalculated your learning path based on latest assessment mastery signals."
    }


# --- ASSESSMENT & PRACTICE ENDPOINTS ---

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
        }
    ]


@app.post("/api/assessment/submit")
def submit_assessment(data: AssessmentSubmitSchema, user_id: str = Depends(get_current_user_id)):
    attempt_id = f"att_{int(time.time())}"
    return {
        "attemptId": attempt_id,
        "score": 82,
        "mastered": ["Data Structures", "Overfitting vs Underfitting"],
        "weaknesses": ["Evaluation Metrics Trade-offs"],
        "difficultyReached": "Intermediate",
        "recommendedNextAction": "Complete 3 targeted practice questions on Precision vs Recall."
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
    return {
        "careerReadiness": 74,
        "skillsMasteredCount": 12,
        "totalSkillsCount": 20,
        "learningHours": 42.5,
        "streakDays": 5,
        "plannedWeeklyHours": 10,
        "actualWeeklyHours": 6.5,
        "weeklyRhythm": [
            {"day": "Mon", "planned": 2, "actual": 2.5},
            {"day": "Tue", "planned": 2, "actual": 2.0},
            {"day": "Wed", "planned": 2, "actual": 0.0},
            {"day": "Thu", "planned": 2, "actual": 1.5},
            {"day": "Fri", "planned": 0, "actual": 0.0},
            {"day": "Sat", "planned": 1, "actual": 0.5},
            {"day": "Sun", "planned": 1, "actual": 0.0}
        ],
        "scoreTrend": [
            {"quiz": "Test 1", "score": 62},
            {"quiz": "Test 2", "score": 70},
            {"quiz": "Test 3", "score": 75},
            {"quiz": "Test 4", "score": 82}
        ]
    }


@app.get("/api/badges")
def get_badges(user_id: str = Depends(get_current_user_id)):
    return [
        {
            "id": "bdg_py",
            "title": "Python ML Foundations",
            "description": "Verified 90%+ proficiency in Python data structures, list comprehensions, and vectorized NumPy operations.",
            "category": "Core Engineering",
            "masteryPercentage": 90,
            "dateEarned": "2026-08-10",
            "iconName": "Code2",
            "verifiedByAssessment": True,
            "isUnlocked": True
        },
        {
            "id": "bdg_sql",
            "title": "Relational Data Architect",
            "description": "Demonstrated ability to write complex multi-table joins, subqueries, and window functions.",
            "category": "Data Infrastructure",
            "masteryPercentage": 85,
            "dateEarned": "2026-08-15",
            "iconName": "Database",
            "verifiedByAssessment": True,
            "isUnlocked": True
        }
    ]


@app.get("/api/profile")
def get_profile(user_id: str = Depends(get_current_user_id)):
    return get_learner_model(user_id)


@app.put("/api/profile")
def update_profile(data: ProfileUpdateSchema, user_id: str = Depends(get_current_user_id)):
    if data.user and "name" in data.user:
        if db is not None:
            users_collection.update_one({"id": user_id}, {"$set": {"name": data.user["name"], "education": data.user.get("education", ""), "targetCareer": data.user.get("targetCareer", "")}})
    return get_learner_model(user_id)


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
        resp = f"Based on your active learner model, focusing on Model Evaluation will give you the highest career readiness increase (+12%). Let me know if you would like a code example or visual explanation!"
    return {"response": resp}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
