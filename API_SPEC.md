# PathFinder AI — Complete API Specification

Base URL (local): `http://localhost:8000`
Authentication: `Authorization: Bearer <jwt_token>` (all protected routes)

---

## Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT token |
| POST | `/api/auth/logout` | Protected | Logout |
| GET | `/api/auth/me` | Protected | Get current user |

---

## Learner Data

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Full dashboard data |
| GET | `/api/learner-model` | Learner model (knowledge/ability/pace/behavior) |
| GET | `/api/skill-gaps` | Current skill gaps |
| GET | `/api/recommendations` | Personalised resource recommendations |
| GET | `/api/roadmap` | Learning roadmap |
| POST | `/api/roadmap/recalculate` | Recalculate roadmap |
| GET | `/api/progress` | Progress metrics |
| GET | `/api/badges` | Earned badges |

---

## Assessment & Practice

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/assessment/start` | Start diagnostic assessment |
| POST | `/api/assessment/submit` | Submit all answers |
| GET | `/api/assessment/result/{id}` | Get result by attempt ID |
| GET | `/api/practice/next` | Get next adaptive practice question |
| POST | `/api/practice/submit` | Submit practice answer |

---

## Career Discovery Engine 🆕

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/career/recommend` | AI career recommendations with match scores |
| POST | `/api/career/select` | Select a career goal (regenerates roadmap) |
| GET | `/api/career/detail/{id}` | Get career details |

### `GET /api/career/recommend` Response
```json
{
  "recommendations": [
    {
      "id": "car_ai_engineer",
      "title": "AI Engineer",
      "matchScore": 84,
      "explanation": "Your Python foundation...",
      "skillStatuses": [
        { "name": "Python Foundations", "learnerLevel": 75, "requiredLevel": 95, "status": "partial" }
      ],
      "gapCount": 2,
      "strongCount": 3
    }
  ],
  "basedOn": {
    "selfDeclaredSkills": 5,
    "assessmentComplete": true,
    "targetCareer": "Machine Learning Engineer",
    "totalCareersEvaluated": 9
  }
}
```

---

## Adaptive Engine 🆕

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/next-action` | Single most important next action |
| GET | `/api/skill-graph` | Full skill prerequisite graph |

### `GET /api/next-action` Response
```json
{
  "actionType": "remedial_lesson",
  "actionLabel": "Complete Remedial Lesson",
  "targetRoute": "/learn?skill=statistics_probability&mode=remedial",
  "reason": "Your score in Statistics is critically low...",
  "urgency": "critical",
  "estimatedMinutes": 30
}
```

---

## AI Teaching Engine 🆕

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/teach/topic/{skill_id}` | Get teaching session for skill |
| POST | `/api/teach/evaluate` | Submit answer, receive feedback |
| GET | `/api/teach/next` | Next concept to study |
| POST | `/api/teach/session/complete` | Mark session complete |

### `GET /api/teach/topic/{skill_id}` Response
```json
{
  "skillId": "python_foundations",
  "skillName": "Python Foundations",
  "phase": "explain",
  "explanation": "Python is the most popular language...",
  "example": "```python\nx = 10\n```",
  "question": {
    "id": "q_py_001",
    "text": "What will this print?",
    "options": ["25", "15", "20", "Error"],
    "correctIndex": 1,
    "conceptTag": "Variable Assignment",
    "correctExplanation": "Python evaluates x+5 at assignment time..."
  },
  "difficulty": "Beginner",
  "estimatedMinutes": 30,
  "learningObjectives": ["Write Python variables"],
  "keyPoints": ["Variables are dynamic"]
}
```

---

## Projects Engine 🆕

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | Recommended projects for user |
| GET | `/api/projects/{id}` | Project detail with milestone status |
| POST | `/api/projects/{id}/milestone` | Mark milestone complete |
| POST | `/api/projects/mentor/chat` | AI mentor chat message |

---

## Misc

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | AI chat assistant (LLM-backed) |
| GET | `/api/careers` | Static career list |
| GET | `/api/partners` | Study partner matches |
| GET | `/api/health` | Health check |
