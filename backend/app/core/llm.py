"""
PathFinder Backend — LLM Provider Abstraction Layer

Architecture:
    LLMProvider (abstract interface)
        ├── MockProvider       — scripted demo responses, no API key needed
        └── GeminiProvider     — Google Gemini 1.5 Flash (optional, requires GEMINI_API_KEY)

The rest of the application calls:
    provider = get_llm_provider()
    response = provider.generate(prompt, context)

This ensures the application is model-independent and can run fully offline.
"""

import os
import json
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


# ─── Abstract Base ────────────────────────────────────────────────────────────

class LLMProvider(ABC):
    """Abstract LLM Provider interface. All providers must implement generate()."""

    @abstractmethod
    def generate(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Generate a natural language response for a given prompt and optional context."""

    @abstractmethod
    def is_available(self) -> bool:
        """Return True if this provider is configured and ready."""


# ─── Mock Provider (offline, always works) ────────────────────────────────────

class MockProvider(LLMProvider):
    """
    A deterministic, demo-quality LLM provider that requires no API key.
    
    Designed for hackathon demonstrations: produces realistic, contextual
    responses based on keyword analysis of the prompt.
    """

    def is_available(self) -> bool:
        return True

    def generate(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        prompt_lower = prompt.lower()

        # --- Teaching explanations ---
        if "explain" in prompt_lower and "variable" in prompt_lower:
            return (
                "A **variable** is like a labelled box where you can store a value. "
                "In Python, you create one simply by writing `name = value`.\n\n"
                "**Example:**\n```python\nage = 18\nname = 'Priya'\nprint(f'{name} is {age} years old')\n```\n\n"
                "Think of it this way: when Python sees `age = 18`, it creates a box labelled "
                "'age' and puts the number 18 inside. Any time you write `age` later, "
                "Python opens that box and uses the value inside."
            )

        if "explain" in prompt_lower and ("linear algebra" in prompt_lower or "matrix" in prompt_lower):
            return (
                "**Linear Algebra** is the mathematics of vectors and matrices — the language that machine learning speaks.\n\n"
                "**Why it matters for AI:** Every dataset is a matrix (rows = samples, columns = features). "
                "Neural networks multiply matrices billions of times. Understanding this lets you debug model shapes, "
                "understand attention mechanisms, and implement algorithms from scratch.\n\n"
                "**Core concepts you'll learn:**\n"
                "- Vectors: ordered lists of numbers (like a data point)\n"
                "- Matrices: grids of numbers (like your full dataset)\n"
                "- Dot product: how similarity is measured\n"
                "- Eigenvalues: how PCA compresses data\n\n"
                "**Simple example:** If you have 3 students and 4 test scores, your data is a 3×4 matrix."
            )

        if "explain" in prompt_lower and "statistic" in prompt_lower:
            return (
                "**Statistics** is the science of learning from data under uncertainty.\n\n"
                "For machine learning, it answers: *'Is this pattern real or just noise?'*\n\n"
                "**Core concepts:**\n"
                "- **Mean & Variance:** Describe the center and spread of your data\n"
                "- **Probability distributions:** Model how data is generated (Normal, Binomial, etc.)\n"
                "- **Hypothesis testing:** Decide if an observed difference is statistically significant\n"
                "- **Bayes' theorem:** Update your beliefs as new evidence arrives\n\n"
                "**Example:** If your model achieves 92% accuracy on test data, statistics helps you "
                "determine whether that's genuinely better than 90% or just random variation."
            )

        if "explain" in prompt_lower and ("machine learning" in prompt_lower or "ml" in prompt_lower):
            return (
                "**Machine Learning** is the field where computers learn patterns from data without being explicitly programmed.\n\n"
                "**The core idea:** Instead of writing rules, you show examples:\n"
                "- 10,000 emails labelled 'spam' or 'not spam'\n"
                "- The algorithm finds patterns automatically\n"
                "- It can now classify new emails it has never seen\n\n"
                "**Three main types:**\n"
                "1. **Supervised Learning** — Learn from labelled examples (most common)\n"
                "2. **Unsupervised Learning** — Find hidden patterns in unlabelled data\n"
                "3. **Reinforcement Learning** — Learn by trial, error and reward\n\n"
                "**Your first algorithm:** Linear Regression — predicts a number (e.g., house price) from features."
            )

        if "explain" in prompt_lower and "python" in prompt_lower:
            return (
                "**Python** is the primary programming language of data science and AI.\n\n"
                "**Why Python for AI?**\n"
                "- Readable syntax that looks almost like English\n"
                "- The richest ecosystem of ML libraries (NumPy, Pandas, Scikit-learn, PyTorch, TensorFlow)\n"
                "- Massive community support\n\n"
                "**Key concepts you need:**\n"
                "```python\n# Variables and data types\nx = 42          # integer\npi = 3.14       # float\nname = 'Riya'   # string\nscores = [95, 87, 92]  # list\n\n# Functions\ndef greet(name):\n    return f'Hello, {name}!'\n\n# Loops\nfor score in scores:\n    print(score)\n```\n\n"
                "Python's power for AI comes from libraries — one line of code that would take hundreds in C++."
            )

        # --- Exercise generation ---
        if "exercise" in prompt_lower or "question" in prompt_lower or "quiz" in prompt_lower:
            if "python" in prompt_lower or "variable" in prompt_lower:
                return (
                    "**Quick Exercise — Python Variables:**\n\n"
                    "What will this code print?\n"
                    "```python\nx = 10\ny = x + 5\nx = 20\nprint(y)\n```\n\n"
                    "A) 25\nB) 15\nC) 20\nD) 30\n\n"
                    "*(Think carefully — does changing `x` after creating `y` affect `y`?)*"
                )
            if "statistic" in prompt_lower:
                return (
                    "**Quick Exercise — Statistics:**\n\n"
                    "A dataset has values: [2, 4, 4, 4, 5, 5, 7, 9]. What is the **variance**?\n\n"
                    "A) 2.0\nB) 4.0\nC) 5.0\nD) 3.5\n\n"
                    "*(Hint: Variance = average of squared differences from the mean)*"
                )

        # --- Evaluation / feedback ---
        if "correct" in prompt_lower or "evaluate" in prompt_lower or "feedback" in prompt_lower:
            if "wrong" in prompt_lower or "incorrect" in prompt_lower:
                return (
                    "**Not quite right — let's work through it together.**\n\n"
                    "The key insight you might be missing: when you assign `y = x + 5`, "
                    "Python evaluates `x + 5` *at that moment* and stores the result (15) in `y`. "
                    "Later changing `x` to 20 doesn't change `y` — they're independent boxes.\n\n"
                    "So `print(y)` outputs **15**.\n\n"
                    "This is different from spreadsheets, where cells update automatically. "
                    "In Python, assignments are snapshots in time. Try it yourself in a Python shell!"
                )
            return (
                "**Excellent work! That's exactly right.** ✅\n\n"
                "You've correctly understood that Python variable assignment is a snapshot — "
                "changing `x` after computing `y` doesn't retroactively affect `y`.\n\n"
                "This concept is fundamental. It protects you from common bugs when working "
                "with data pipelines where intermediate values need to stay stable.\n\n"
                "You're ready to move to the next concept: **Data Types and Type Conversion**."
            )

        # --- Career-related questions ---
        if "why" in prompt_lower and ("career" in prompt_lower or "ai engineer" in prompt_lower or "machine learning" in prompt_lower):
            return (
                "Based on your learner profile, **AI Engineering** stands out for you for several reasons:\n\n"
                "1. **Strong match with your interests:** You indicated interest in mathematics and problem-solving — "
                "both are core to AI engineering.\n\n"
                "2. **Your existing Python foundation** gives you a significant head start. Most AI engineers "
                "start from zero Python; you're already ahead.\n\n"
                "3. **High industry demand:** AI Engineering is growing at +34% year-over-year — one of the "
                "fastest-growing technical roles globally.\n\n"
                "4. **Clear learning path:** Unlike some fields, the AI engineering learning path is well-defined: "
                "Python → Mathematics → Machine Learning → Deep Learning → Deployment.\n\n"
                "Your current gaps (Statistics, Linear Algebra) are bridgeable within your 3-month target."
            )

        if "linear algebra" in prompt_lower and "need" in prompt_lower:
            return (
                "**Linear algebra is in your roadmap because it's the foundation of machine learning and neural networks.**\n\n"
                "Here's specifically why your target career (AI Engineer) requires it:\n\n"
                "- **Vectors** represent data points and model weights\n"
                "- **Matrix multiplication** is how neural network layers transform data\n"
                "- **Eigenvalues** power dimensionality reduction (PCA)\n"
                "- **Gradients** in deep learning are vectors — you can't understand backpropagation without it\n\n"
                "Without linear algebra, machine learning becomes 'magic boxes' you can't debug or improve. "
                "With it, you understand *why* things work — and that's what separates engineers from users."
            )

        if "3 hours" in prompt_lower or "limited time" in prompt_lower or "only have" in prompt_lower:
            return (
                "Understood — 3 hours is a focused session. Let me prioritise your roadmap accordingly.\n\n"
                "**This week's priority (3 hours):**\n"
                "1. ⚡ **Statistics Fundamentals — Mean, Variance, Standard Deviation** (1.5h) — Critical gap\n"
                "2. 📝 **Python Functions Practice** (45 min) — Reinforces foundation\n"
                "3. 🧪 **Mini Quiz: Probability Basics** (45 min) — Assesses readiness for ML\n\n"
                "I'm postponing the optional **Data Visualization** module and the **SQL Advanced** "
                "topics until your next available session. Your core gap in Statistics needs attention first."
            )

        if "don't understand" in prompt_lower or "confused" in prompt_lower or "explain again" in prompt_lower:
            return (
                "No problem at all — let's try a completely different angle.\n\n"
                "Sometimes the formal definition makes a concept harder than it needs to be. "
                "Let me use a real-world analogy instead.\n\n"
                "**Imagine you're measuring students' heights in your class:**\n"
                "- The **mean** is the average height\n"
                "- The **variance** tells you how *spread out* the heights are — "
                "are most students similar height, or are some very tall and some very short?\n"
                "- The **standard deviation** is the variance in the same units as your measurement\n\n"
                "This is exactly what statistics does with any data — it describes the 'shape' of your numbers. "
                "Machine learning uses this to understand patterns in training data.\n\n"
                "Does this make more sense? Try explaining it back to me in your own words — "
                "that's the most powerful way to check understanding."
            )

        # --- Generic helpful assistant response ---
        return (
            "I understand your question. As your PathFinder AI mentor, let me address this "
            "in the context of your current learning journey.\n\n"
            "Based on your learner profile and current position in your roadmap, here's what I recommend:\n\n"
            "Focus on building strong fundamentals first. The concepts you're studying now are the "
            "building blocks for everything that follows. If anything is unclear, ask me to explain "
            "it differently — I can use different analogies, code examples, or visual descriptions.\n\n"
            "Remember: your roadmap is personalized to your current skill level and target career. "
            "Every topic you see has been selected because it's a necessary step toward your goal. "
            "You're making progress — keep going."
        )


# ─── Gemini Provider ──────────────────────────────────────────────────────────

class GeminiProvider(LLMProvider):
    """
    Google Gemini 1.5 Flash provider.
    Requires GEMINI_API_KEY environment variable.
    """

    def __init__(self):
        self._api_key = os.getenv("GEMINI_API_KEY", "")
        self._model = None

        if self._api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self._api_key)
                self._model = genai.GenerativeModel("gemini-1.5-flash")
            except ImportError:
                pass

    def is_available(self) -> bool:
        return bool(self._api_key and self._model)

    def generate(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        if not self.is_available():
            return MockProvider().generate(prompt, context)

        system_context = (
            "You are PathFinder AI, an intelligent personal education and career mentor. "
            "You guide students from Grade 12 through career selection, skill development, "
            "learning, practice, and career readiness. You are encouraging, precise, and "
            "always aware of the learner's current profile and goals.\n\n"
        )
        if context:
            system_context += f"Learner Context: {json.dumps(context, indent=2)}\n\n"

        full_prompt = f"{system_context}User: {prompt}\nPathFinder AI:"

        try:
            response = self._model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            return MockProvider().generate(prompt, context)


# ─── Provider Factory ─────────────────────────────────────────────────────────

_provider_instance: Optional[LLMProvider] = None


def get_llm_provider() -> LLMProvider:
    """
    Returns the active LLM provider based on LLM_PROVIDER env var.
    
    LLM_PROVIDER=mock    → MockProvider (default, no API key needed)
    LLM_PROVIDER=gemini  → GeminiProvider (requires GEMINI_API_KEY)
    """
    global _provider_instance
    if _provider_instance is not None:
        return _provider_instance

    provider_name = os.getenv("LLM_PROVIDER", "mock").lower().strip()

    if provider_name == "gemini":
        candidate = GeminiProvider()
        if candidate.is_available():
            _provider_instance = candidate
        else:
            _provider_instance = MockProvider()
    else:
        _provider_instance = MockProvider()

    return _provider_instance


# ─── Legacy Compatibility Functions ──────────────────────────────────────────
# These preserve backwards-compatibility with existing router code.

def generate_chat_response(message: str, context: dict = None) -> str:
    """Generate a conversational response. Legacy wrapper."""
    return get_llm_provider().generate(message, context)


def generate_why_reason(skill_gap: str, career: str, prior_knowledge: dict) -> dict:
    """Generate an explainable 'why this was recommended' reason."""
    prompt = (
        f"A learner is targeting the {career} role and has a skill gap in '{skill_gap}'. "
        f"Prior knowledge: {prior_knowledge}. "
        f"Explain in 1-2 sentences why studying {skill_gap} is important for {career}."
    )
    explanation = get_llm_provider().generate(prompt)
    strong = [k for k, v in prior_knowledge.items() if isinstance(v, (int, float)) and v >= 70]
    return {
        "strongSkills": strong[:2] if strong else ["General Knowledge"],
        "partiallyMastered": [skill_gap],
        "careerRequirement": f"Essential competency for a {career}.",
        "recentGapTrigger": explanation[:200] if len(explanation) > 200 else explanation,
    }


def generate_roadmap(target_career: str, skill_gaps: list) -> list:
    """Generate a roadmap using the skill graph engine (LLM-independent)."""
    # Roadmap generation is now handled by the skill graph + learning path engines.
    # This function returns None to signal that the caller should use those engines.
    return None
