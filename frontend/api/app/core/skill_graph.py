"""
PathFinder Backend — Skill Prerequisite Graph Engine

Represents skills as a directed acyclic graph (DAG) where edges encode prerequisites.
Provides topological sorting to generate properly-ordered learning paths.

Example graph:
    deep_learning → machine_learning → statistics → python_foundations
    deep_learning → linear_algebra   → python_foundations

A learner who wants Deep Learning but lacks Python and Statistics will be
routed: Python → Statistics → Linear Algebra → Machine Learning → Deep Learning
"""

import json
from pathlib import Path
from typing import Dict, List, Set, Optional, Tuple
from collections import defaultdict, deque

_SKILL_GRAPH_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "skill_graph.json"


class SkillGraph:
    """
    Directed Acyclic Graph of skills.
    Each node is a skill. Each edge A→B means "A is a prerequisite of B".
    """

    def __init__(self, skill_data: List[Dict]):
        # {skill_id: skill_metadata}
        self.skills: Dict[str, Dict] = {}
        # {skill_id: [prerequisite_skill_ids]}
        self.prerequisites: Dict[str, List[str]] = defaultdict(list)
        # {skill_id: [skills that depend on this skill]}
        self.dependents: Dict[str, List[str]] = defaultdict(list)

        for skill in skill_data:
            sid = skill["id"]
            self.skills[sid] = skill
            prereqs = skill.get("prerequisites", [])
            self.prerequisites[sid] = prereqs
            for prereq in prereqs:
                self.dependents[prereq].append(sid)

    def get_skill(self, skill_id: str) -> Optional[Dict]:
        return self.skills.get(skill_id)

    def get_prerequisites(self, skill_id: str) -> List[str]:
        return self.prerequisites.get(skill_id, [])

    def topological_sort(self, target_skills: List[str]) -> List[str]:
        """
        Returns a topologically-sorted order of all skills needed to reach
        the target skills, including all transitive prerequisites.

        This is the core algorithm ensuring no skill appears before its prerequisites.
        Uses Kahn's algorithm (BFS-based topological sort).
        """
        # Collect all needed skills (DFS to find all transitive prerequisites)
        needed: Set[str] = set()
        stack = list(target_skills)
        while stack:
            sid = stack.pop()
            if sid not in needed and sid in self.skills:
                needed.add(sid)
                for prereq in self.prerequisites.get(sid, []):
                    if prereq not in needed:
                        stack.append(prereq)

        # Kahn's algorithm on the subgraph of needed skills
        in_degree = {sid: 0 for sid in needed}
        for sid in needed:
            for prereq in self.prerequisites.get(sid, []):
                if prereq in needed:
                    in_degree[sid] += 1

        queue = deque([sid for sid in needed if in_degree[sid] == 0])
        result = []
        while queue:
            node = queue.popleft()
            result.append(node)
            for dependent in self.dependents.get(node, []):
                if dependent in needed:
                    in_degree[dependent] -= 1
                    if in_degree[dependent] == 0:
                        queue.append(dependent)

        return result

    def get_ordered_learning_path(
        self,
        target_career_skills: List[str],
        mastered_skills: Set[str],
        weak_skills: Set[str],
    ) -> List[Dict]:
        """
        Returns an ordered list of skill learning stages for a learner.

        - Skips skills already mastered (proficiency >= 80%)
        - Marks weak skills as remedial priority
        - Respects prerequisite ordering
        - Returns enriched dicts with phase, estimated hours, status
        """
        ordered_ids = self.topological_sort(target_career_skills)

        path = []
        phase = 1
        for sid in ordered_ids:
            skill = self.skills.get(sid)
            if not skill:
                continue

            if sid in mastered_skills:
                status = "completed"
            elif sid in weak_skills:
                status = "remedial"
            elif not path or path[-1]["status"] in ("completed",):
                status = "current" if not any(p["status"] == "current" for p in path) else "locked"
            else:
                status = "locked"

            path.append({
                "id": sid,
                "title": skill.get("name", sid),
                "skillName": skill.get("name", sid),
                "phase": phase,
                "phaseTitle": skill.get("category", "Core Skills"),
                "status": status,
                "estimatedHours": skill.get("estimatedHours", 10),
                "difficulty": skill.get("difficulty", "Intermediate"),
                "description": skill.get("description", ""),
                "prerequisites": skill.get("prerequisites", []),
                "whyPositioned": _build_why_positioned(skill, ordered_ids, sid),
            })
            phase += 1

        return path


def _build_why_positioned(skill: Dict, ordered_ids: List[str], current_id: str) -> str:
    """Generate a 'why is this positioned here' explanation."""
    prereqs = skill.get("prerequisites", [])
    name = skill.get("name", current_id)
    if not prereqs:
        return f"{name} is a foundational skill with no prerequisites. It's the right starting point."
    idx = ordered_ids.index(current_id) if current_id in ordered_ids else -1
    prereq_names = [skill.get("name", p) for p in prereqs]
    return (
        f"{name} appears here because it requires {', '.join(prereq_names)} as prerequisites. "
        f"Those have already been sequenced earlier in your path."
    )


# ─── Singleton loader ─────────────────────────────────────────────────────────

_graph_instance: Optional[SkillGraph] = None


def get_skill_graph() -> SkillGraph:
    global _graph_instance
    if _graph_instance is not None:
        return _graph_instance

    if _SKILL_GRAPH_PATH.exists():
        with open(_SKILL_GRAPH_PATH, "r", encoding="utf-8") as f:
            skill_data = json.load(f)
    else:
        skill_data = _get_fallback_skill_data()

    _graph_instance = SkillGraph(skill_data)
    return _graph_instance


def generate_learning_path(
    target_career_title: str,
    skill_scores: Dict[str, float],
    mastery_threshold: float = 75.0,
) -> List[Dict]:
    """
    High-level function: given a career and the learner's current skill scores,
    return the complete ordered learning path.

    Args:
        target_career_title: e.g. "Machine Learning Engineer"
        skill_scores: {skill_id: score_0_to_100}
        mastery_threshold: Skills above this score are considered mastered.
    """
    from app.core.career_engine import get_career_skill_requirements

    career_skills = get_career_skill_requirements(target_career_title)
    target_ids = []
    for sk in career_skills:
        name_key = sk.get("name", "").lower().replace(" ", "_").replace("&", "and").replace("/", "_")
        target_ids.append(name_key)

    graph = get_skill_graph()

    mastered = {sid for sid, score in skill_scores.items() if score >= mastery_threshold}
    weak = {sid for sid, score in skill_scores.items() if 0 < score < mastery_threshold}

    return graph.get_ordered_learning_path(target_ids, mastered, weak)


def _get_fallback_skill_data() -> List[Dict]:
    """Inline fallback skill graph if JSON file not yet present."""
    return [
        {"id": "programming_fundamentals", "name": "Programming Fundamentals", "category": "Foundation", "prerequisites": [], "estimatedHours": 8, "difficulty": "Beginner", "description": "Core logic, variables, loops, and conditionals."},
        {"id": "python_foundations", "name": "Python Foundations", "category": "Foundation", "prerequisites": ["programming_fundamentals"], "estimatedHours": 12, "difficulty": "Beginner", "description": "Python syntax, data types, functions, and modules."},
        {"id": "data_structures", "name": "Data Structures & Algorithms", "category": "Foundation", "prerequisites": ["python_foundations"], "estimatedHours": 20, "difficulty": "Intermediate", "description": "Lists, dicts, sets, trees, graphs, sorting, and search."},
        {"id": "sql_databases", "name": "SQL & Databases", "category": "Data", "prerequisites": ["programming_fundamentals"], "estimatedHours": 10, "difficulty": "Beginner", "description": "Relational databases, SQL queries, joins, aggregation."},
        {"id": "mathematics_foundations", "name": "Mathematics Foundations", "category": "Mathematics", "prerequisites": [], "estimatedHours": 8, "difficulty": "Beginner", "description": "Algebra, functions, sets, and mathematical notation."},
        {"id": "statistics_probability", "name": "Statistics & Probability", "category": "Mathematics", "prerequisites": ["mathematics_foundations"], "estimatedHours": 15, "difficulty": "Intermediate", "description": "Descriptive stats, probability, distributions, hypothesis testing."},
        {"id": "linear_algebra", "name": "Linear Algebra", "category": "Mathematics", "prerequisites": ["mathematics_foundations"], "estimatedHours": 15, "difficulty": "Intermediate", "description": "Vectors, matrices, dot products, eigenvalues, and transformations."},
        {"id": "calculus_optimization", "name": "Calculus & Optimization", "category": "Mathematics", "prerequisites": ["mathematics_foundations"], "estimatedHours": 12, "difficulty": "Intermediate", "description": "Derivatives, gradients, chain rule, and gradient descent."},
        {"id": "machine_learning", "name": "Machine Learning Fundamentals", "category": "Machine Learning", "prerequisites": ["python_foundations", "statistics_probability", "linear_algebra"], "estimatedHours": 30, "difficulty": "Intermediate", "description": "Supervised/unsupervised learning, model training, evaluation."},
        {"id": "model_evaluation", "name": "Model Evaluation & Tuning", "category": "Machine Learning", "prerequisites": ["machine_learning", "statistics_probability"], "estimatedHours": 15, "difficulty": "Intermediate", "description": "Cross-validation, metrics, hyperparameter tuning, bias-variance."},
        {"id": "deep_learning", "name": "Deep Learning", "category": "AI", "prerequisites": ["machine_learning", "linear_algebra", "calculus_optimization"], "estimatedHours": 35, "difficulty": "Advanced", "description": "Neural networks, backpropagation, CNNs, RNNs, Transformers."},
        {"id": "nlp", "name": "Natural Language Processing", "category": "AI", "prerequisites": ["deep_learning", "statistics_probability"], "estimatedHours": 25, "difficulty": "Advanced", "description": "Text processing, embeddings, language models, and transformers."},
        {"id": "computer_vision", "name": "Computer Vision", "category": "AI", "prerequisites": ["deep_learning", "linear_algebra"], "estimatedHours": 25, "difficulty": "Advanced", "description": "Image classification, object detection, CNNs, and segmentation."},
        {"id": "mlops", "name": "MLOps & Deployment", "category": "Engineering", "prerequisites": ["machine_learning", "data_structures"], "estimatedHours": 20, "difficulty": "Advanced", "description": "Model serving, Docker, CI/CD pipelines, monitoring, and cloud."},
        {"id": "data_engineering", "name": "Data Engineering", "category": "Data", "prerequisites": ["sql_databases", "python_foundations"], "estimatedHours": 20, "difficulty": "Intermediate", "description": "ETL pipelines, data warehousing, Spark, and Airflow."},
        {"id": "data_visualization", "name": "Data Visualization", "category": "Data", "prerequisites": ["python_foundations", "statistics_probability"], "estimatedHours": 8, "difficulty": "Beginner", "description": "Matplotlib, Seaborn, Plotly, and storytelling with data."},
        {"id": "cloud_platforms", "name": "Cloud Platforms (AWS/GCP/Azure)", "category": "Infrastructure", "prerequisites": ["programming_fundamentals"], "estimatedHours": 20, "difficulty": "Intermediate", "description": "Cloud services, storage, compute, managed ML services."},
        {"id": "docker_kubernetes", "name": "Docker & Kubernetes", "category": "Infrastructure", "prerequisites": ["programming_fundamentals"], "estimatedHours": 15, "difficulty": "Intermediate", "description": "Containerisation, orchestration, and service deployment."},
        {"id": "cybersecurity_fundamentals", "name": "Cybersecurity Fundamentals", "category": "Security", "prerequisites": ["networking_basics", "programming_fundamentals"], "estimatedHours": 20, "difficulty": "Intermediate", "description": "CIA triad, attack vectors, cryptography, and defence strategies."},
        {"id": "networking_basics", "name": "Networking Basics", "category": "Infrastructure", "prerequisites": [], "estimatedHours": 10, "difficulty": "Beginner", "description": "TCP/IP, DNS, HTTP, firewalls, and network architecture."},
        {"id": "web_development", "name": "Web Development Fundamentals", "category": "Software", "prerequisites": ["programming_fundamentals"], "estimatedHours": 20, "difficulty": "Beginner", "description": "HTML, CSS, JavaScript, REST APIs, and basic frameworks."},
        {"id": "software_engineering", "name": "Software Engineering Principles", "category": "Software", "prerequisites": ["data_structures", "python_foundations"], "estimatedHours": 20, "difficulty": "Intermediate", "description": "Design patterns, SOLID principles, testing, and code quality."},
        {"id": "ui_ux_design", "name": "UI/UX Design Principles", "category": "Design", "prerequisites": [], "estimatedHours": 15, "difficulty": "Beginner", "description": "User research, wireframing, prototyping, and usability testing."},
        {"id": "react_frontend", "name": "React & Frontend Development", "category": "Software", "prerequisites": ["web_development"], "estimatedHours": 25, "difficulty": "Intermediate", "description": "React, component design, state management, and modern frontend."},
    ]
