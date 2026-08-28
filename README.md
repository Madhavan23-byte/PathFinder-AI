# 🧭 PathFinder — AI-Powered Adaptive Learning Platform

> **PathFinder** is an intelligent career and learning platform that builds a personalized, adaptive roadmap for learners to reach their target career goals.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 Learner Profile Engine | Captures skills, goals, availability, and learning preferences |
| 🧪 Diagnostic Assessment | 12-question adaptive quiz that calibrates your learner model |
| 🧠 6D Learner Model | Tracks Knowledge, Ability, Pace, Behavior, Preferences & Availability |
| 🔍 Skill Gap Analysis | Identifies critical skill gaps against your target career |
| 🗺️ Personalized Roadmap | Ordered learning path with milestones, prerequisites and estimated hours |
| ⭐ AI Recommendations | Explains *why* each course or project was recommended |
| 📊 Progress Dashboard | Real-time metrics, charts, streaks and career readiness score |
| 🏅 Micro-Credentials | Earns badges upon assessment milestones |
| 🤝 Study Partner Matching | Connects with learners with complementary skills |
| 💬 AI Chat Assistant | Answers learning queries in context |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (data visualization)
- Lucide React (icons)
- React Router v6

**Backend**
- FastAPI (Python)
- PyMongo + MongoDB Atlas
- bcrypt (password hashing)
- PyJWT (authentication)
- Pydantic v2 (validation)

**Deployment**
- Vercel (frontend + Python serverless functions)
- MongoDB Atlas (cloud database)

---

## 📁 Project Structure

```
path-finder/
├── .gitignore
├── README.md
│
├── frontend/                # ⚛️  React + TypeScript + Vite frontend
│   ├── index.html           # Vite SPA shell
│   ├── package.json         # npm dependencies
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example         # Frontend env template
│   └── src/
│       ├── App.tsx           # Router + context providers
│       ├── main.tsx          # React mount point
│       ├── index.css         # Global styles
│       ├── types/index.ts    # All TypeScript interfaces
│       ├── context/          # AuthContext + AppContext
│       ├── services/api.ts   # All backend API calls
│       ├── components/       # Layout + common UI components
│       └── pages/            # 22 page components
│
└── backend/                 # 🐍 FastAPI + MongoDB backend
    ├── main.py              # Entry point (re-exports app)
    ├── requirements.txt     # Python dependencies
    ├── .env.example         # Backend env template
    ├── data/                # Static JSON data files
    │   ├── questions_bank.json  # 12 assessment questions
    │   └── career_paths.json    # Career role definitions
    └── app/
        ├── database.py      # MongoDB connection + collections
        ├── main.py          # FastAPI app factory (registers routers)
        ├── core/
        │   ├── config.py    # Settings + env loading
        │   └── security.py  # JWT, bcrypt, auth dependency
        ├── schemas/
        │   └── models.py    # All Pydantic request schemas
        └── routers/
            ├── auth.py          # /api/auth/*
            ├── profile.py       # /api/profile
            ├── dashboard.py     # /api/dashboard
            ├── assessment.py    # /api/assessment/*
            ├── learning.py      # /api/roadmap, skill-gaps, progress, practice
            └── misc.py          # /api/careers, partners, chat, health
```

---

## 🚀 Local Setup

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.10
- A **MongoDB Atlas** account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/2-IDIOTS-DM/path-finder.git
cd path-finder
```

### 2. Frontend setup
```bash
npm install
```

Create `.env` (frontend):
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Backend setup
```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
DATABASE_NAME=pathfinder
JWT_SECRET=your_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 4. Run locally

**Terminal 1 — Backend:**
```bash
uvicorn backend.app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## ☁️ Deployment

This project uses a cleanly separated architecture. You will deploy the **Frontend** and **Backend** as two separate services.

### 1. Deploying the Backend (Render / Railway / Heroku)
1. Push your code to GitHub.
2. Create a new Web Service on your host (e.g., Render).
3. Set the Root Directory to `backend`.
4. Set the Build Command to `pip install -r requirements.txt`.
5. Set the Start Command to `uvicorn app.main:app --host 0.0.0.0 --port 10000`.
6. Add your Environment Variables (MongoDB URI, JWT Secret, etc).

### 2. Deploying the Frontend (Vercel / Netlify)
1. Import your GitHub repository in Vercel.
2. Set the **Root Directory** to `frontend`.
3. Add the `VITE_API_BASE_URL` environment variable, pointing to your deployed Backend URL (e.g., `https://your-backend-app.onrender.com`).
4. Click Deploy. Vercel will automatically detect Vite and build the React app.

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login + get JWT token |
| GET | `/api/auth/me` | ✅ | Get current user info |
| GET | `/api/profile` | ✅ | Get learner profile |
| PUT | `/api/profile` | ✅ | Update profile |
| GET | `/api/dashboard` | ✅ | Get dashboard data |
| GET | `/api/learner-model` | ✅ | Get 6D learner model |
| GET | `/api/assessment/start` | ✅ | Get assessment questions |
| POST | `/api/assessment/submit` | ✅ | Submit answers + get scored |
| GET | `/api/skill-gaps` | ✅ | Get skill gap analysis |
| GET | `/api/recommendations` | ✅ | Get personalized recommendations |
| GET | `/api/roadmap` | ✅ | Get learning roadmap |
| POST | `/api/roadmap/recalculate` | ✅ | Trigger roadmap recalculation |
| GET | `/api/progress` | ✅ | Get progress metrics |
| GET | `/api/badges` | ✅ | Get earned micro-credentials |
| GET | `/api/careers` | ✅ | Get career role options |
| GET | `/api/partners` | ✅ | Get study partner suggestions |
| POST | `/api/chat` | ✅ | AI chat assistant |
| GET | `/api/health` | ❌ | Database health check |

---

## 👥 Team

**2-IDIOTS-DM** — HCL PathFinder Hackathon 2026

---

## 📄 License

This project was built for the HCL PathFinder Hackathon. All rights reserved.
