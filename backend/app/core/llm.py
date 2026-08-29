"""
PathFinder Backend — Domain AI Engine
A self-contained, offline-first intelligent personal education and career mentor.
Consists of:
1. Intent & NLP Classifier
2. Contextual Roadmap Generator
3. Domain Knowledge Base Lookup
4. Project Mentoring Guide
No external paid API dependencies (Gemini, OpenAI), keeping deployment light and free.
"""
import json
import os
import re
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List


class LLMProvider(ABC):
    """Abstract LLM Provider interface."""

    @abstractmethod
    def generate(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Generate a natural language response for a given prompt and optional context."""

    @abstractmethod
    def is_available(self) -> bool:
        """Return True if this provider is configured and ready."""


class PathFinderDomainAI(LLMProvider):
    """
    Unified domain AI engine that runs locally/offline.
    Injects learner context dynamically into tailored templates.
    """

    def is_available(self) -> bool:
        return True

    def generate(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        prompt_lower = prompt.lower()
        ctx = context or {}

        # 1. Extract context variables with fallback defaults
        target_career = ctx.get("targetCareer", "Machine Learning Engineer")
        weak_skills = ctx.get("weakSkills", [])
        strong_skills = ctx.get("strongSkills", [])
        student_name = ctx.get("studentName", "Learner")
        project_id = ctx.get("projectId", "")
        milestone_id = ctx.get("currentMilestone", "")

        # Map list of strings to user-friendly text
        weak_str = ", ".join(weak_skills) if weak_skills else "Statistics & Model Evaluation"
        strong_str = ", ".join(strong_skills) if strong_skills else "Python Foundations & SQL Databases"

        # 2. Intent Classification
        
        # Intent A: Project mentoring
        if project_id or "project" in prompt_lower or "milestone" in prompt_lower:
            return self._get_project_mentor_hint(project_id, milestone_id, prompt_lower)

        # Intent B: Explaining technical concepts (domain knowledge base lookup)
        concept_match = self._find_matching_concept(prompt_lower)
        if concept_match:
            return self._explain_concept(concept_match, target_career, weak_skills)

        # Intent C: Career advice / Match explanation
        if "why" in prompt_lower and ("career" in prompt_lower or "role" in prompt_lower or "job" in prompt_lower or "readiness" in prompt_lower):
            return (
                f"Hello {student_name}! Based on your learner profile, the **{target_career}** role is an excellent target for you.\n\n"
                f"Here is why this career is a strong match for your profile:\n"
                f"1. **Strengths Foundation**: Your background in **{strong_str}** gives you a solid head start.\n"
                f"2. **Targeted Bridge**: The primary gaps you need to address are **{weak_str}**. These are crucial for the day-to-day work of a {target_career}.\n"
                f"3. **High Industry Growth**: This field is experiencing high demand (+30% YoY growth) with strong career trajectories.\n\n"
                f"I've structured your roadmap to address your gaps sequentially. Focus on mastering one concept at a time!"
            )

        # Intent D: Roadmap/Path queries
        if "roadmap" in prompt_lower or "path" in prompt_lower or "what next" in prompt_lower or "what should i do" in prompt_lower:
            first_gap = weak_skills[0] if weak_skills else "Statistics & Probability"
            return (
                f"Your personalized roadmap is optimized for **{target_career}**.\n\n"
                f"Currently, your path is structured into distinct phases:\n"
                f"1. **Foundations**: Mastering core logic and databases (Complete or verified).\n"
                f"2. **Core Skills (Current focus)**: Bridging your gap in **{first_gap}**.\n"
                f"3. **Advanced AI & MLOps**: Moving into deep learning and production deployment.\n\n"
                f"Your immediate next action is to complete the study module for **{first_gap}**. This builds the prerequisite math needed for machine learning modeling."
            )

        # Intent E: Exercise / Quiz request
        if "exercise" in prompt_lower or "practice" in prompt_lower or "quiz" in prompt_lower:
            return (
                f"Here is a targeted practice exercise to test your understanding:\n\n"
                f"**Concept: Precision vs Recall**\n"
                f"A medical classification model has high Recall but low Precision. What is the practical implication?\n\n"
                f"A) The model misses many actual cancer cases (high False Negatives)\n"
                f"B) The model flags many healthy patients as having cancer (high False Positives)\n"
                f"C) The model has overall high accuracy on balanced datasets\n"
                f"D) The model requires scaling of features before training\n\n"
                f"*Hint: Precision = TP / (TP + FP). High False Positives will inflate the denominator and lower precision.*"
            )

        # Intent F: General conversation/greeting
        return (
            f"Hello {student_name}! I am your PathFinder AI mentor.\n\n"
            f"I am guiding your learning path toward becoming a **{target_career}**.\n"
            f"Currently, your strengths lie in **{strong_str}**, and we are focused on bridging your gaps in **{weak_str}**.\n\n"
            f"How can I assist you today? You can ask me to:\n"
            f"- **Explain a concept** (e.g. *'Explain Linear Algebra'*)\n"
            f"- **Give career guidance** (e.g. *'Why is this role suitable for me?'*)\n"
            f"- **Provide a practice exercise** (e.g. *'Give me a Python quiz'*)\n"
            f"- **Clarify project steps** or give programming hints."
        )

    def _find_matching_concept(self, prompt: str) -> Optional[str]:
        """Map keywords to specific concept IDs in our teaching database."""
        mappings = {
            "python": "python_foundations",
            "variable": "python_foundations",
            "loop": "python_foundations",
            "statistic": "statistics_probability",
            "probability": "statistics_probability",
            "variance": "statistics_probability",
            "mean": "statistics_probability",
            "matrix": "linear_algebra",
            "vector": "linear_algebra",
            "linear algebra": "linear_algebra",
            "gradient": "calculus_optimization",
            "calculus": "calculus_optimization",
            "derivative": "calculus_optimization",
            "machine learning": "machine_learning",
            "supervised": "machine_learning",
            "unsupervised": "machine_learning",
            "overfitting": "machine_learning",
            "underfitting": "machine_learning",
            "precision": "model_evaluation",
            "recall": "model_evaluation",
            "evaluation": "model_evaluation",
            "roc": "model_evaluation",
            "deep learning": "deep_learning",
            "neural network": "deep_learning",
            "transformer": "deep_learning",
            "mlops": "mlops",
            "docker": "docker_kubernetes",
            "kubernetes": "docker_kubernetes",
            "container": "docker_kubernetes",
            "sql": "sql_databases",
            "database": "sql_databases",
            "join": "sql_databases",
            "data structure": "data_structures",
            "algorithm": "data_structures",
            "sorting": "data_structures",
            "cybersecurity": "cybersecurity_fundamentals",
            "network": "networking_basics",
            "web dev": "web_development",
            "html": "web_development",
            "react": "react_frontend",
            "ui": "ui_ux_design",
            "ux": "ui_ux_design",
        }
        for kw, skill_id in mappings.items():
            if kw in prompt:
                return skill_id
        return None

    def _explain_concept(self, skill_id: str, target_career: str, weak_skills: List[str]) -> str:
        """Retrieve explanation from inline teaching database."""
        from app.core.teaching_engine import get_topic_content
        topic = get_topic_content(skill_id, "beginner")
        
        explanation = topic.get("explanation", "")
        example = topic.get("example", "")
        name = topic.get("skillName", skill_id.replace("_", " ").title())

        response = f"### 📖 Concept Guide: {name}\n\n{explanation}\n\n"
        if example:
            response += f"#### 💻 Practical Example:\n{example}\n\n"
        
        # Contextual link to their goals
        if skill_id in [s.lower().replace(" ", "_") for s in weak_skills]:
            response += f"⚠️ **Note:** This is currently marked as a critical skill gap in your learning roadmap for the **{target_career}** path. Mastering this module is essential to proceed."
        else:
            response += f"✓ This topic reinforces the foundational skills needed for your target goal of **{target_career}**."
            
        return response

    def _get_project_mentor_hint(self, project_id: str, milestone_id: str, prompt: str) -> str:
        """Provide domain-specific hint for projects without exposing direct answers."""
        pid = project_id or ""
        mid = milestone_id or ""

        # Student Grade Analyzer
        if "proj_py_01" in pid or "grade" in prompt or "csv" in prompt:
            if "m1" in mid or "read" in prompt:
                return (
                    "**Project Mentor Hint (Reading CSV):**\n"
                    "Use Python's built-in `csv` module. You don't need pandas for this beginner project!\n"
                    "```python\nimport csv\nwith open('grades.csv', mode='r') as file:\n    reader = csv.reader(file)\n    header = next(reader) # Skip header row\n    for row in reader:\n        print(row) # Access values by index\n```\n"
                    "Remember to convert score fields to floats before performing mathematics!"
                )
            if "m2" in mid or "stat" in prompt or "mean" in prompt or "median" in prompt:
                return (
                    "**Project Mentor Hint (Statistics):**\n"
                    "- **Mean**: sum of all scores divided by the number of students.\n"
                    "- **Median**: sort the list of scores. If the count is odd, pick the middle element. If even, average the two middle elements.\n"
                    "```python\nscores = sorted([float(row[2]) for row in data])\n# Now write conditional logic to handle odd/even lengths\n```"
                )
            return (
                "**Project Mentor Hint (Grade Analyzer):**\n"
                "Ensure your script properly handles headers and skips empty rows. Write helper functions for each statistic "
                "to keep your code clean and reusable."
            )

        # College Course Database
        if "proj_sql_01" in pid or "college" in prompt or "course" in prompt or "join" in prompt:
            return (
                "**Project Mentor Hint (Database Design):**\n"
                "Remember to establish Foreign Key constraints to link tables:\n"
                "- `Enrollment` table should have `student_id` referencing `Students(id)` and `course_id` referencing `Courses(id)`.\n"
                "Use `GROUP BY` and `COUNT()` to determine which courses have the highest enrollment counts."
            )

        # Generic Project advice
        return (
            "**Project Mentor:**\n"
            "To solve this problem:\n"
            "1. **Break it down**: Write helper functions for distinct tasks.\n"
            "2. **Debug with prints**: Print the types and shapes of your variables at intermediate steps.\n"
            "3. **Handle edge cases**: Make sure your code doesn't crash on empty inputs or unexpected data types.\n\n"
            "Let me know which specific milestone or coding block you're working on, and I'll give you a directed hint!"
        )


# --- Factory & Compatibility Layer ---

_provider_instance: Optional[LLMProvider] = None


def get_llm_provider() -> LLMProvider:
    """Return the active local domain AI provider."""
    global _provider_instance
    if _provider_instance is None:
        _provider_instance = PathFinderDomainAI()
    return _provider_instance


def generate_chat_response(message: str, context: dict = None) -> str:
    return get_llm_provider().generate(message, context)


def generate_why_reason(skill_gap: str, career: str, prior_knowledge: dict) -> dict:
    prompt = (
        f"Why is studying {skill_gap} important for a career as a {career}?"
    )
    explanation = get_llm_provider().generate(prompt)
    strong = [k for k, v in prior_knowledge.items() if isinstance(v, (int, float)) and v >= 70]
    return {
        "strongSkills": strong[:2] if strong else ["Programming Fundamentals"],
        "partiallyMastered": [skill_gap],
        "careerRequirement": f"Required competency for {career}.",
        "recentGapTrigger": explanation[:200] + "..." if len(explanation) > 200 else explanation,
    }


def generate_roadmap(target_career: str, skill_gaps: list) -> list:
    """Roadmap generation is handled dynamically by the skill graph engine."""
    return None
