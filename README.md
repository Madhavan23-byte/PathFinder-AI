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
├── vercel.json                  # Vercel deployment config
├── package.json                 # Frontend npm dependencies
├── vite.config.ts               # Vite build config
├── tailwind.config.js
├── tsconfig.json
│
├── index.html                   # SPA entry point
├── src/                         # React frontend
│   ├── App.tsx                  # Router + context providers
│   ├── main.tsx
│   ├── types/index.ts           # TypeScript interfaces
│   ├── context/                 # Auth + App state
│   ├── services/api.ts          # All backend API calls
│   ├── components/              # Layout + common components
│   └── pages/                   # 22 page components
│
├── backend/                     # FastAPI backend
│   ├── main.py                  # Entry point (re-exports app)
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # FastAPI app factory
│       ├── database.py          # MongoDB connection + collections
│       ├── core/
│       │   ├── config.py        # App configuration + env loading
│       │   └── security.py      # JWT, bcrypt, auth dependency
│       ├── schemas/
│       │   └── models.py        # Pydantic request schemas
│       └── routers/
│           ├── auth.py          # /api/auth/* endpoints
│           ├── profile.py       # /api/profile endpoints
│           ├── dashboard.py     # /api/dashboard endpoint
│           ├── assessment.py    # /api/assessment/* endpoints
│           ├── learning.py      # Roadmap, skill gaps, progress, practice
│           └── misc.py          # Careers, partners, chat, health
│
├── api/                         # Vercel serverless function bridge
│   ├── index.py                 # Imports FastAPI app for Vercel
│   └── requirements.txt
│
└── data/                        # Static data files
    ├── questions_bank.json      # 12 assessment questions
    └── career_paths.json        # Career role definitions
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
uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## ☁️ Vercel Deployment

The project is configured for one-click Vercel deployment.

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Set the following **Environment Variables** in Vercel dashboard:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `DATABASE_NAME` | `pathfinder` |
| `JWT_SECRET` | Your secure secret key |
| `JWT_ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` |
| `VITE_API_BASE_URL` | *(leave empty — uses relative URLs in production)* |

4. Deploy — Vercel auto-detects Vite for the frontend and serves Python via serverless functions.

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
