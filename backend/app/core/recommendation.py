"""
PathFinder Backend — ML Recommendation Engine
Uses TF-IDF Vectorization and Cosine Similarity to recommend courses based on skill gaps.
"""
import json
from pathlib import Path
from typing import List, Dict, Any

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

_CATALOG_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "courses_catalog.json"


def _load_catalog() -> pd.DataFrame:
    """Load the course catalog into a pandas DataFrame."""
    if not _CATALOG_PATH.exists():
        return pd.DataFrame()
    with open(_CATALOG_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return pd.DataFrame(data)


def recommend_resources(skill_gap_name: str, top_n: int = 2) -> List[Dict[str, Any]]:
    """
    Recommend top N learning resources for a given skill gap using ML.
    
    This fulfills the "AI/ML Recommendation Engine" requirement.
    Instead of hardcoding rules, we use Natural Language Processing (TF-IDF)
    to match the user's missing skill against course descriptions and tags.
    """
    df = _load_catalog()
    if df.empty:
        return []

    # 1. Feature Engineering: Combine tags and description into a single corpus
    df["combined_features"] = df["tags"].apply(lambda x: " ".join(x)) + " " + df["description"]

    # 2. Append the target skill gap to the corpus as the query document
    # We enhance the query slightly to improve TF-IDF matching
    query = f"{skill_gap_name} concepts tutorials practice"
    corpus = df["combined_features"].tolist()
    corpus.append(query)

    # 3. Vectorize text using TF-IDF
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # 4. Calculate Cosine Similarity between the query (last row) and all courses
    query_vector = tfidf_matrix[-1]
    course_vectors = tfidf_matrix[:-1]
    similarity_scores = cosine_similarity(query_vector, course_vectors).flatten()

    # 5. Extract top N matches
    # Get indices of top N scores (args-sort returns ascending, so we reverse it)
    top_indices = similarity_scores.argsort()[::-1][:top_n]

    recommendations = []
    for idx in top_indices:
        if similarity_scores[idx] > 0.05:  # Only recommend if there is some relevance
            course = df.iloc[idx].to_dict()
            course["match_score"] = float(similarity_scores[idx])
            recommendations.append(course)

    return recommendations

# Example usage (for local testing):
if __name__ == "__main__":
    print("Testing ML Recommendation Engine...")
    recs = recommend_resources("Model Evaluation & Tuning", top_n=2)
    for r in recs:
        print(f"Match: {r['title']} (Score: {r['match_score']:.2f})")
