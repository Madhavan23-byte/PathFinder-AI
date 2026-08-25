import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

# Load .env file from backend directory or parent root if available
env_path = Path(__file__).resolve().parent.parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

DEFAULT_MONGODB_URI = "mongodb+srv://hclpathfinderdm_db_user:UQSbqKc6hDcZ8VIH@cluster0.ftb8yho.mongodb.net/?appName=Cluster0"

MONGODB_URI = os.getenv("MONGODB_URI", DEFAULT_MONGODB_URI)
DATABASE_NAME = os.getenv("DATABASE_NAME", "pathfinder")
JWT_SECRET = os.getenv("JWT_SECRET", "pathfinder_super_secure_jwt_secret_key_2026_prod")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

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
