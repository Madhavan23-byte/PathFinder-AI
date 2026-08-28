# PathFinder AI — AI Architecture Document

## Philosophy: Intelligence Belongs to the System

PathFinder's AI architecture is model-independent. We do NOT hand control to an LLM
and ask it to be the teacher, career counselor, or advisor. Instead:

- The **structure** of every decision is deterministic code
- The LLM provides **natural language generation only**
- Every recommendation is **explainable** — users can always see *why*

This means the system works even without an LLM API key (MockProvider handles it).

---

## Core AI Engines

### 1. LLM Provider Layer (`backend/app/core/llm.py`)

```
LLMProvider (abstract)
├── MockProvider    — scripted, always available, demo-quality responses
└── GeminiProvider  — Google Gemini 1.5 Flash (optional)
```

**Control flow:** `LLM_PROVIDER` env var selects provider at startup.
Application code calls `get_llm_provider().generate(prompt, context)`.

### 2. Career Discovery Engine (`backend/app/core/career_engine.py`)

**Algorithm:** Weighted scoring against the career knowledge base.

```
Score = Skill Coverage (60%) + Interest Alignment (20%) + Goal Alignment (20%)
```

**Skill Coverage** computation:
- For each required skill in the career definition
- Find learner's proficiency in that skill (from assessment + self-declaration)
- Weight by importance (critical skills count more)
- Proficiency ratio = min(learner_score / required_score, 1.0)

**Output per career:**
- `matchScore`: 0–98% (clamped to realistic range)
- `explanation`: natural language reason (LLM-generated or deterministic)
- `skillStatuses`: per-skill breakdown (strong/partial/gap)

### 3. Skill Prerequisite Graph (`backend/app/core/skill_graph.py`)

A Directed Acyclic Graph (DAG) of 24 skills with prerequisite edges.

**Key algorithm:** Kahn's topological sort ensures correct learning order:

```
Python Foundations → Statistics → Linear Algebra → Machine Learning → Deep Learning → NLP
                                                                              ↑
                                                     Calculus & Optimization ──┘
```

A learner who wants NLP but only knows Python will be sequenced through all
prerequisites automatically — no hardcoded rules needed.

### 4. Adaptive Learning Engine (`backend/app/core/adaptive_engine.py`)

**Decision tree** for "What should I do next?":

```
onboarding_complete? → No → Onboarding action
assessment_done?     → No → Take Assessment
critical_weak (< 40%)? → Yes → Remedial Lesson
moderate_weak (< 60%)? → Yes → Review Skill
practice_due?          → Yes → Practice
current_module?        → Yes → Continue Lesson
projects_available?    → Yes → Build Project
else                   → Review Roadmap
```

All decisions are deterministic. No LLM involved.

### 5. Teaching Engine (`backend/app/core/teaching_engine.py`)

**Teaching Loop:** Explain → Example → Question → Evaluate → Feedback

- **Content selection:** Deterministic (based on skill_id + learner level)
- **When to advance:** Deterministic (correct answer → continue; wrong → remedial)
- **Next concept:** Skill graph topological sort
- **Language generation:** LLM generates explanation variations and feedback text

### 6. Career Readiness Engine (`backend/app/core/readiness_engine.py`)

```
Career Readiness = Skill Mastery (40%) + Assessment Performance (30%)
                 + Project Completion (20%) + Learning Consistency (10%)
```

Every factor is shown to the user with an insight. Nothing is a black box.

---

## Data Flow

```
User Action → API Router → Business Logic Engine → MongoDB Update
                                   ↓
                          LLM Provider (language only)
                                   ↓
                             JSON Response → Frontend
```

---

## LLM Usage Policy

| Feature | LLM Usage | Can Run Without LLM? |
|---|---|---|
| Career Discovery | ❌ None | ✅ Always |
| Skill Graph Path | ❌ None | ✅ Always |
| Adaptive Next Action | ❌ None | ✅ Always |
| Career Readiness Score | ❌ None | ✅ Always |
| Teaching Explanation | ✅ Language generation | ✅ MockProvider |
| Teaching Feedback | ✅ Language generation | ✅ MockProvider |
| AI Chat | ✅ Conversational | ✅ MockProvider |
| Project Mentor Chat | ✅ Hints/guidance | ✅ MockProvider |
