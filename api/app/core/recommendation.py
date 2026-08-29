"""
PathFinder Backend — ML Recommendation Engine
Uses pure Python TF-IDF Vectorization and Cosine Similarity to recommend courses based on skill gaps.
No external dependencies (pandas, scikit-learn, numpy) required, keeping Vercel deployment size minimal.
"""
import json
import math
import re
from pathlib import Path
from typing import List, Dict, Any

_CATALOG_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "courses_catalog.json"


def tokenize(text: str) -> List[str]:
    """Tokenize text into lowercase alphanumeric words."""
    return re.findall(r"\b\w+\b", text.lower())


def compute_tf(doc: List[str]) -> Dict[str, float]:
    """Compute normalized term frequency."""
    tf = {}
    for word in doc:
        tf[word] = tf.get(word, 0) + 1
    total = len(doc)
    return {w: count / total for w, count in tf.items()} if total > 0 else {}


def compute_idf(docs: List[List[str]]) -> Dict[str, float]:
    """Compute smoothed inverse document frequency."""
    N = len(docs)
    df = {}
    for doc in docs:
        unique_words = set(doc)
        for word in unique_words:
            df[word] = df.get(word, 0) + 1

    idf = {}
    for word, count in df.items():
        # Smoothed IDF formula: ln(1 + N/DF) + 1
        idf[word] = math.log(1 + N / count) + 1
    return idf


def tfidf(tf: Dict[str, float], idf: Dict[str, float]) -> Dict[str, float]:
    """Calculate TF-IDF vector."""
    return {w: val * idf.get(w, 0.0) for w, val in tf.items()}


def cosine_similarity(v1: Dict[str, float], v2: Dict[str, float]) -> float:
    """Compute cosine similarity between two sparse dictionaries."""
    dot = 0.0
    for w, val in v1.items():
        if w in v2:
            dot += val * v2[w]

    mag1 = math.sqrt(sum(val**2 for val in v1.values()))
    mag2 = math.sqrt(sum(val**2 for val in v2.values()))

    if mag1 == 0.0 or mag2 == 0.0:
        return 0.0
    return dot / (mag1 * mag2)


def _load_catalog() -> List[Dict[str, Any]]:
    """Load the course catalog into a list of dictionaries."""
    if not _CATALOG_PATH.exists():
        return []
    with open(_CATALOG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def recommend_resources(skill_gap_name: str, top_n: int = 2) -> List[Dict[str, Any]]:
    """
    Recommend top N learning resources for a given skill gap using ML.
    
    This fulfills the "AI/ML Recommendation Engine" requirement.
    Uses pure Python TF-IDF and Cosine Similarity to match the user's missing
    skill against course descriptions and tags in courses_catalog.json.
    """
    catalog = _load_catalog()
    if not catalog:
        return []

    # 1. Feature Engineering: Combine tags and description into a single corpus
    documents = []
    for course in catalog:
        tags_str = " ".join(course.get("tags", []))
        desc = course.get("description", "")
        combined = f"{tags_str} {desc}"
        documents.append(tokenize(combined))

    # 2. Tokenize target query
    query_str = f"{skill_gap_name} concepts tutorials practice"
    query_tokens = tokenize(query_str)

    # 3. Fit TF-IDF on the entire corpus (catalog docs + query)
    all_docs = documents + [query_tokens]
    idf = compute_idf(all_docs)

    # 4. Vectorize query
    query_tf = compute_tf(query_tokens)
    query_vector = tfidf(query_tf, idf)

    # 5. Vectorize and calculate similarity for each course
    recommendations = []
    for idx, course in enumerate(catalog):
        doc_tf = compute_tf(documents[idx])
        doc_vector = tfidf(doc_tf, idf)

        sim = cosine_similarity(query_vector, doc_vector)
        if sim > 0.05:  # Only recommend if there is some relevance
            course_copy = dict(course)
            course_copy["match_score"] = float(sim)
            recommendations.append(course_copy)

    # 6. Sort by similarity score descending
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations[:top_n]


if __name__ == "__main__":
    print("Testing ML Recommendation Engine...")
    recs = recommend_resources("Model Evaluation & Tuning", top_n=2)
    for r in recs:
        print(f"Match: {r['title']} (Score: {r['match_score']:.2f})")
