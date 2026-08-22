import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

# Load .env file from backend directory or parent root
env_path = Path(__file__).resolve().parent.parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "pathfinder")
JWT_SECRET = os.getenv("JWT_SECRET", "pathfinder_default_jwt_secret_2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI environment variable is missing in backend/.env!")

# Connect PyMongo Client
client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)

# Select pathfinder database
db = client[DATABASE_NAME]

# MongoDB Collections
users_collection = db["users"]
profiles_collection = db["profiles"]
learner_models_collection = db["learner_models"]
assessments_collection = db["assessments"]
assessment_attempts_collection = db["assessment_attempts"]
skill_gaps_collection = db["skill_gaps"]
recommendations_collection = db["recommendations"]
roadmaps_collection = db["roadmaps"]
progress_collection = db["progress"]
badges_collection = db["badges"]
learning_sessions_collection = db["learning_sessions"]
