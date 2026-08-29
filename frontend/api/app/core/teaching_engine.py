"""
PathFinder Backend — AI Teaching Engine

Orchestrates the structured teaching loop:
    EXPLAIN → EXAMPLE → QUESTION → EVALUATE → FEEDBACK → (REMEDIAL?) → NEXT

The *structure* of when to advance, when to remediate, and what to teach is
deterministic logic. The LLM is used only for generating the natural language content.

This is the core "AI Teacher" feature of PathFinder.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple

_TEACHING_CONTENT_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "teaching_content.json"


# ─── Teaching Session State ───────────────────────────────────────────────────

TEACHING_PHASES = ["explain", "example", "question", "evaluate", "feedback", "complete"]


def get_topic_content(skill_id: str, learner_level: str = "beginner") -> Dict:
    """
    Returns a complete teaching session structure for a given skill.

    Structure:
        {
          "skillId": str,
          "skillName": str,
          "phase": "explain",
          "explanation": str,
          "example": str,
          "question": {text, options, correctIndex, conceptTag},
          "difficulty": str,
          "estimatedMinutes": int,
          "learningObjectives": [str],
        }
    """
    content_db = _load_teaching_content()
    topic = content_db.get(skill_id, _get_fallback_content(skill_id, learner_level))

    # Adapt explanation to learner level
    if learner_level == "beginner":
        explanation = topic.get("explanation_beginner", topic.get("explanation", ""))
    elif learner_level == "intermediate":
        explanation = topic.get("explanation_intermediate", topic.get("explanation", ""))
    else:
        explanation = topic.get("explanation_advanced", topic.get("explanation", ""))

    # If no level-specific explanation, use LLM to generate one
    if not explanation:
        from app.core.llm import get_llm_provider
        prompt = f"Explain {topic.get('name', skill_id)} for a {learner_level} learner in 3 short paragraphs with a practical example."
        explanation = get_llm_provider().generate(prompt)

    return {
        "skillId": skill_id,
        "skillName": topic.get("name", skill_id.replace("_", " ").title()),
        "phase": "explain",
        "explanation": explanation,
        "example": topic.get("example", ""),
        "question": topic.get("question", _default_question(skill_id)),
        "difficulty": topic.get("difficulty", _map_level(learner_level)),
        "estimatedMinutes": topic.get("estimatedMinutes", 30),
        "learningObjectives": topic.get("learningObjectives", [f"Understand {skill_id.replace('_', ' ')}"]),
        "keyPoints": topic.get("keyPoints", []),
    }


def evaluate_answer(
    skill_id: str,
    question_id: str,
    selected_index: int,
    correct_index: int,
    learner_explanation: Optional[str] = None,
) -> Dict:
    """
    Evaluates a learner's answer and returns structured feedback.

    Returns:
        {
          "isCorrect": bool,
          "score": int (0-100),
          "feedbackTitle": str,
          "feedbackBody": str,
          "conceptUnderstanding": bool,
          "recommendedAction": str,  # "continue" | "remedial" | "practice_more"
          "explanation": str,        # Why the correct answer is correct
        }
    """
    is_correct = selected_index == correct_index
    content_db = _load_teaching_content()
    topic = content_db.get(skill_id, {})
    question = topic.get("question", {})
    correct_explanation = question.get("correctExplanation", "")

    skill_name = skill_id.replace("_", " ").title()
    if is_correct:
        feedback_body = (
            f"Excellent work! You correctly answered the question about {skill_name}.\n\n"
            f"Your understanding of '{question.get('conceptTag', skill_name)}' is solid. You're ready to proceed to the next concept!"
        )
        recommended_action = "continue"
    else:
        feedback_body = (
            f"Not quite right. Let's review the concept of {skill_name}.\n\n"
            f"Hint: {correct_explanation or 'Review the explanation and example code above before trying again.'}\n\n"
            f"Keep practicing! Repetition and working through mistakes is how learning happens."
        )
        recommended_action = "practice_more"

    return {
        "isCorrect": is_correct,
        "score": 100 if is_correct else 0,
        "feedbackTitle": "Correct! Well done! ✅" if is_correct else "Not quite — let's clarify this. 💡",
        "feedbackBody": feedback_body,
        "conceptUnderstanding": is_correct,
        "correctIndex": correct_index,
        "correctExplanation": correct_explanation or (
            f"The correct answer demonstrates a key principle of {skill_id.replace('_', ' ')}. "
            "Understanding this concept is essential for your target career."
        ),
        "recommendedAction": recommended_action,
        "nextPhase": "complete" if is_correct else "remedial",
    }


def get_next_concept(
    current_skill_id: str,
    mastered_skills: List[str],
    target_career_skills: List[str],
) -> Optional[str]:
    """
    Returns the ID of the next concept to teach after the current one is mastered.
    Uses the skill graph to respect prerequisites.
    """
    from app.core.skill_graph import get_skill_graph
    graph = get_skill_graph()

    ordered = graph.topological_sort(target_career_skills)
    mastered_set = set(mastered_skills + [current_skill_id])

    for skill_id in ordered:
        if skill_id not in mastered_set:
            # Check all prerequisites are mastered
            prereqs = graph.get_prerequisites(skill_id)
            if all(p in mastered_set for p in prereqs):
                return skill_id

    return None


# ─── Content Loaders ──────────────────────────────────────────────────────────

def _load_teaching_content() -> Dict:
    if _TEACHING_CONTENT_PATH.exists():
        with open(_TEACHING_CONTENT_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {item["id"]: item for item in data}
    return _get_inline_content()


def _get_fallback_content(skill_id: str, level: str) -> Dict:
    inline = _get_inline_content()
    return inline.get(skill_id, {
        "name": skill_id.replace("_", " ").title(),
        "explanation": f"Let's explore {skill_id.replace('_', ' ')}. This is a core skill for your target career.",
        "example": "We'll use a practical example to make this concrete.",
        "question": _default_question(skill_id),
        "difficulty": _map_level(level),
        "estimatedMinutes": 25,
        "learningObjectives": [f"Understand core concepts of {skill_id.replace('_', ' ')}"],
    })


def _default_question(skill_id: str) -> Dict:
    return {
        "id": f"q_{skill_id}_default",
        "text": f"Which of the following best describes the purpose of {skill_id.replace('_', ' ')}?",
        "options": [
            "It provides a structured framework for understanding core concepts",
            "It is only used in advanced applications",
            "It replaces all other approaches in the field",
            "It is primarily a theoretical concept with no practical applications",
        ],
        "correctIndex": 0,
        "conceptTag": skill_id,
        "correctExplanation": f"{skill_id.replace('_', ' ')} provides fundamental structure that all advanced work builds upon.",
    }


def _map_level(level: str) -> str:
    mapping = {"beginner": "Beginner", "intermediate": "Intermediate", "advanced": "Advanced"}
    return mapping.get(level, "Intermediate")


def _get_inline_content() -> Dict:
    """Rich inline teaching content for key skills — no file dependency needed."""
    return {
        "python_foundations": {
            "id": "python_foundations",
            "name": "Python Foundations",
            "difficulty": "Beginner",
            "estimatedMinutes": 30,
            "learningObjectives": [
                "Write Python variables, functions, and loops",
                "Understand Python's dynamic typing",
                "Use lists, dicts, and basic data structures",
            ],
            "keyPoints": [
                "Variables are dynamic — no type declaration needed",
                "Indentation defines code blocks (no curly braces)",
                "Functions are first-class objects",
                "Python's standard library is vast",
            ],
            "explanation_beginner": (
                "**Python** is the most popular language for data science and AI, and for good reason: "
                "it reads almost like English, has an enormous ecosystem of ML libraries, and lets you "
                "focus on *what* to compute rather than *how* to manage memory.\n\n"
                "**Why Python for AI?** Libraries like NumPy, Pandas, Scikit-learn, PyTorch, and "
                "TensorFlow are all Python-first. Every major AI company uses Python.\n\n"
                "**Core building blocks you need:**\n"
                "- **Variables** — named containers for data\n"
                "- **Data types** — integers, floats, strings, lists, dicts\n"
                "- **Functions** — reusable blocks of code\n"
                "- **Loops & conditionals** — control flow\n"
                "- **Modules** — importing others' work (`import numpy as np`)"
            ),
            "example": (
                "```python\n"
                "# Variables are dynamic — Python infers the type\n"
                "student_name = 'Priya'      # string\n"
                "score = 87                  # integer\n"
                "gpa = 3.8                   # float\n"
                "subjects = ['Math', 'CS', 'Physics']  # list\n\n"
                "# Function with a default parameter\n"
                "def grade(score, passing=60):\n"
                "    if score >= passing:\n"
                "        return f'{score} — Pass ✓'\n"
                "    return f'{score} — Needs improvement'\n\n"
                "# Loop through students\n"
                "scores = [87, 55, 92, 48]\n"
                "for s in scores:\n"
                "    print(grade(s))\n"
                "```\n\n"
                "**Output:**\n"
                "```\n87 — Pass ✓\n55 — Pass ✓\n92 — Pass ✓\n48 — Needs improvement\n```"
            ),
            "question": {
                "id": "q_py_001",
                "text": "What will this code print?\n```python\nx = 10\ny = x + 5\nx = 20\nprint(y)\n```",
                "options": ["25", "15", "20", "Error"],
                "correctIndex": 1,
                "conceptTag": "Variable Assignment",
                "correctExplanation": "When `y = x + 5` runs, Python evaluates `x + 5` immediately (10 + 5 = 15) and stores 15 in y. Later changing `x` to 20 does NOT affect `y` — assignments are snapshots, not live references. So `print(y)` outputs 15.",
            },
        },
        "statistics_probability": {
            "id": "statistics_probability",
            "name": "Statistics & Probability",
            "difficulty": "Intermediate",
            "estimatedMinutes": 40,
            "learningObjectives": [
                "Calculate mean, median, variance, and standard deviation",
                "Understand probability distributions",
                "Apply Bayes' theorem to real problems",
                "Interpret p-values and hypothesis tests",
            ],
            "keyPoints": [
                "Mean is sensitive to outliers; median is robust",
                "Variance measures spread; std dev is in original units",
                "Normal distribution appears everywhere in nature",
                "Bayes' theorem lets you update beliefs with evidence",
            ],
            "explanation_beginner": (
                "**Statistics** is the science of learning from data under uncertainty. "
                "For machine learning, it answers: *'Is this pattern real, or just noise?'*\n\n"
                "**Descriptive Statistics** summarise your data:\n"
                "- **Mean (μ):** average value — sensitive to outliers\n"
                "- **Median:** middle value — robust to outliers\n"
                "- **Variance (σ²):** average squared distance from the mean\n"
                "- **Standard Deviation (σ):** square root of variance — in the same units as your data\n\n"
                "**Why does this matter for AI?** Your model's loss function *is* a statistical measure. "
                "Understanding variance vs bias, overfitting vs underfitting — all of this is statistics."
            ),
            "example": (
                "```python\nimport numpy as np\n\n"
                "scores = [72, 85, 90, 55, 88, 92, 78, 65]\n\n"
                "mean = np.mean(scores)          # 78.125\n"
                "median = np.median(scores)       # 81.5\n"
                "variance = np.var(scores)        # 154.86\n"
                "std_dev = np.std(scores)         # 12.44\n\n"
                "print(f'Mean:   {mean:.2f}')      # 78.13\n"
                "print(f'Std Dev: {std_dev:.2f}')  # 12.44\n"
                "```\n\n"
                "**Interpretation:** Scores average 78%, but with a standard deviation of 12.4, "
                "scores typically range from 65–90. A model predicting 'average score' would be "
                "wrong by about 12 points on average — that error IS the std dev."
            ),
            "question": {
                "id": "q_stat_001",
                "text": "A dataset is [2, 4, 4, 4, 5, 5, 7, 9]. What is the variance?",
                "options": ["2.0", "4.0", "5.0", "3.5"],
                "correctIndex": 1,
                "conceptTag": "Variance",
                "correctExplanation": "Mean = (2+4+4+4+5+5+7+9)/8 = 5.0. Variance = average of squared differences from mean = [(9+1+1+1+0+0+4+16)/8] = 32/8 = 4.0. Variance measures how spread out the data is.",
            },
        },
        "machine_learning": {
            "id": "machine_learning",
            "name": "Machine Learning Fundamentals",
            "difficulty": "Intermediate",
            "estimatedMinutes": 50,
            "learningObjectives": [
                "Distinguish supervised, unsupervised, and reinforcement learning",
                "Understand the training and evaluation pipeline",
                "Apply linear regression and decision trees",
                "Identify overfitting and underfitting",
            ],
            "keyPoints": [
                "ML learns patterns from data without explicit programming",
                "Training set teaches the model; test set evaluates it",
                "Overfitting: perfect on training, poor on new data",
                "Features are the inputs; labels are the outputs (supervised)",
            ],
            "explanation_beginner": (
                "**Machine Learning** is the field where computers learn patterns from data "
                "without being explicitly programmed for each rule.\n\n"
                "**The key insight:** Instead of writing:\n"
                "> *'If the email contains the word FREE and ALL CAPS then it's spam'*\n\n"
                "You show the computer 10,000 labelled spam/not-spam emails and it figures "
                "out the rules itself — often discovering patterns humans never would.\n\n"
                "**Three main paradigms:**\n"
                "1. **Supervised Learning** — Learn from labelled examples (spam detection, house prices)\n"
                "2. **Unsupervised Learning** — Find hidden structure in unlabelled data (customer segments)\n"
                "3. **Reinforcement Learning** — Learn by reward and punishment (chess, robotics)\n\n"
                "**The ML pipeline:** Collect data → Features engineering → Train model → Evaluate → Deploy"
            ),
            "example": (
                "```python\nfrom sklearn.linear_model import LinearRegression\nimport numpy as np\n\n"
                "# Study hours vs exam scores\n"
                "hours = np.array([1, 2, 3, 4, 5, 6, 7, 8]).reshape(-1, 1)\n"
                "scores = np.array([40, 50, 60, 65, 70, 80, 85, 92])\n\n"
                "# Train the model\n"
                "model = LinearRegression()\n"
                "model.fit(hours, scores)\n\n"
                "# Predict for a new student studying 5.5 hours\n"
                "prediction = model.predict([[5.5]])\n"
                "print(f'Predicted score: {prediction[0]:.1f}')  # ~74.5\n"
                "```\n\n"
                "The model learned: *score ≈ 6.5 × hours + 33.5* "
                "purely from the 8 data points — no rules were written manually."
            ),
            "question": {
                "id": "q_ml_001",
                "text": "A decision tree achieves 99% training accuracy but only 62% on the validation set. What is this called?",
                "options": ["Underfitting", "Overfitting (High Variance)", "Optimal Convergence", "Data Leakage"],
                "correctIndex": 1,
                "conceptTag": "Overfitting vs Underfitting",
                "correctExplanation": "This is overfitting (high variance). The model memorised the training data so well it fails to generalise to new examples. Solutions: reduce model complexity, add regularisation, use more training data, or apply cross-validation.",
            },
        },
        "linear_algebra": {
            "id": "linear_algebra",
            "name": "Linear Algebra",
            "difficulty": "Intermediate",
            "estimatedMinutes": 40,
            "learningObjectives": [
                "Understand vectors, matrices, and tensor operations",
                "Compute dot products and matrix multiplications",
                "Understand eigenvalues and their role in PCA",
                "Connect linear algebra to neural network operations",
            ],
            "keyPoints": [
                "A vector represents a direction and magnitude",
                "Matrix multiplication is how neural networks transform data",
                "Eigenvalues describe how transformations scale data",
                "Every ML model is doing linear algebra under the hood",
            ],
            "explanation_beginner": (
                "**Linear Algebra** is the mathematics of vectors and matrices — "
                "the language that machine learning speaks.\n\n"
                "**A vector** is an ordered list of numbers. In ML, a row in your dataset is a vector: "
                "`[age=25, income=50000, education=16]` is a 3D vector.\n\n"
                "**A matrix** is a 2D grid of numbers. Your entire dataset is a matrix: "
                "*rows = samples, columns = features*.\n\n"
                "**Why it matters for AI:**\n"
                "- Neural network layers are **matrix multiplications**\n"
                "- Training is **vector gradient** computation\n"
                "- Attention (in Transformers) is **dot product** operations\n"
                "- PCA uses **eigenvalues** to compress data\n\n"
                "Understanding linear algebra means you can read research papers, debug shape errors, "
                "and implement algorithms from scratch."
            ),
            "example": (
                "```python\nimport numpy as np\n\n"
                "# A vector (one data point: [study_hours, sleep_hours, score])\n"
                "student = np.array([6, 7, 85])\n\n"
                "# A matrix (3 students, 3 features each)\n"
                "students = np.array([\n"
                "    [6, 7, 85],\n"
                "    [3, 5, 60],\n"
                "    [8, 8, 92]\n"
                "])\n\n"
                "# Dot product — measures similarity / weighted sum\n"
                "weights = np.array([0.5, 0.3, 0.2])\n"
                "weighted_sum = np.dot(student, weights)  # neural network neuron!\n"
                "print(f'Weighted score: {weighted_sum:.2f}')  # 22.7\n\n"
                "# Matrix multiplication — transform all students at once\n"
                "W = np.array([[0.5, 0.2], [0.3, 0.4], [0.1, 0.3]])  # weight matrix\n"
                "transformed = students @ W  # this is what a neural layer does!\n"
                "print(transformed.shape)  # (3, 2) — 3 students, 2 outputs\n"
                "```"
            ),
            "question": {
                "id": "q_la_001",
                "text": "If matrix A has shape (3, 4) and matrix B has shape (4, 2), what is the shape of A @ B (matrix multiplication)?",
                "options": ["(3, 2)", "(4, 4)", "(3, 4)", "Error — incompatible shapes"],
                "correctIndex": 0,
                "conceptTag": "Matrix Multiplication",
                "correctExplanation": "Matrix multiplication A @ B requires the inner dimensions to match: (3, 4) @ (4, 2) — inner dimensions are both 4. The result shape is the outer dimensions: (3, 2). This is why neural network layer shapes must be carefully designed.",
            },
        },
    }
