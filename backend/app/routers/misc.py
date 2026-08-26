"""
PathFinder Backend — Misc Router
Handles careers, study partners, AI chat, health check, and learning sessions.
"""
import json
from pathlib import Path
from fastapi import APIRouter, Depends

from backend.app.database import client
from backend.app.core.security import get_current_user_id
from backend.app.schemas.models import ChatSchema

router = APIRouter(prefix="/api", tags=["Misc"])

# Load careers from data/ if available
_CAREERS_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "career_paths.json"


def _load_careers():
    if _CAREERS_PATH.exists():
        with open(_CAREERS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return [
        {
            "id": "car_mle", "title": "Machine Learning Engineer",
            "description": "Designs, builds, and deploys production machine learning pipelines and deep learning systems.",
            "matchScore": 84, "readinessScore": 74, "estimatedMonths": 3,
            "salaryRange": "$120,000 - $175,000", "demandGrowth": "+34% YoY",
            "keySkills": [
                {"name": "Python Foundations", "required": 85, "userProficiency": 90},
                {"name": "SQL & Database Design", "required": 75, "userProficiency": 85},
                {"name": "Statistics & Probability", "required": 80, "userProficiency": 55},
                {"name": "Model Evaluation & Tuning", "required": 80, "userProficiency": 30},
            ],
        },
        {
            "id": "car_ds", "title": "Data Scientist",
            "description": "Extracts strategic business insights using statistical analysis, predictive modeling, and data story-telling.",
            "matchScore": 88, "readinessScore": 76, "estimatedMonths": 2.5,
            "salaryRange": "$110,000 - $160,000", "demandGrowth": "+28% YoY",
            "keySkills": [
                {"name": "Python Foundations", "required": 90, "userProficiency": 90},
                {"name": "SQL & Database Design", "required": 85, "userProficiency": 85},
                {"name": "Statistics & Probability", "required": 90, "userProficiency": 55},
            ],
        },
    ]


@router.get("/health")
def health_check():
    try:
        client.admin.command("ping")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "detail": str(e)}


@router.get("/careers")
def get_careers():
    return _load_careers()


@router.get("/partners")
def get_partners():
    return [
        {
            "id": "prt_01", "name": "Aravind Swamy", "role": "Aspiring AI Researcher",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            "matchPercentage": 94, "targetCareer": "Machine Learning Engineer",
            "currentFocus": "Deep Learning & Neural Networks",
            "complementarySkills": ["Deep Learning", "PyTorch", "Mathematics"],
        },
        {
            "id": "prt_02", "name": "Sophia Chen", "role": "Data Science Graduate",
            "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            "matchPercentage": 89, "targetCareer": "Data Scientist",
            "currentFocus": "Model Evaluation & Statistics",
            "complementarySkills": ["Statistics & P-Values", "Data Storytelling", "Python"],
        },
    ]


@router.get("/learning-sessions")
def get_learning_sessions(user_id: str = Depends(get_current_user_id)):
    from backend.app.database import learning_sessions_collection
    from backend.app.core.security import sanitize_doc
    items = list(learning_sessions_collection.find({"user_id": user_id}))
    return [sanitize_doc(item) for item in items]


@router.post("/chat")
def ai_chat(data: ChatSchema, user_id: str = Depends(get_current_user_id)):
    """
    Rule-based AI chat assistant.
    TODO: Replace with LLM integration (e.g., Gemini API or OpenAI).
    """
    msg = data.message.lower()
    if "why" in msg or "statistics" in msg:
        resp = (
            "Statistics forms the foundation for machine learning algorithms. "
            "Concepts like probability distributions and hypothesis testing directly "
            "determine how model parameters are estimated."
        )
    elif "code" in msg or "example" in msg:
        resp = (
            "Here is a Python snippet for computing Precision and Recall:\n\n"
            "```python\nfrom sklearn.metrics import precision_score, recall_score\n"
            "y_true = [0, 1, 1, 0, 1]\ny_pred = [0, 1, 0, 0, 1]\n"
            "print(precision_score(y_true, y_pred))\n```"
        )
    else:
        resp = (
            "Based on your active learner model, focusing on Model Evaluation will give you "
            "the highest career readiness increase. Let me know if you would like a code example "
            "or visual explanation!"
        )
    return {"response": resp}
