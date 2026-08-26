"""
PathFinder Backend — LLM Integration
Provides helper functions for calling Google Gemini API.
"""
import os
import google.generativeai as genai

# Try to get the API key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Configure Gemini if key is present
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def _get_model():
    """Returns the Gemini 1.5 Flash model instance."""
    if not GEMINI_API_KEY:
        return None
    return genai.GenerativeModel("gemini-1.5-flash")


def generate_chat_response(message: str, context: dict = None) -> str:
    """Generates a response from Gemini based on user message and learner context."""
    model = _get_model()
    if not model:
        return "⚠️ Gemini API key is missing. Please add GEMINI_API_KEY to your .env file to enable AI Chat."
    
    system_prompt = (
        "You are PathFinder, a highly intelligent and encouraging AI tutor. "
        "Your goal is to help the user master concepts required for their target career.\n\n"
    )
    if context:
        system_prompt += f"Learner Context: {context}\n\n"
    
    prompt = f"{system_prompt}\nUser: {message}\nPathFinder:"
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"⚠️ An error occurred while generating AI response: {str(e)}"


def generate_why_reason(skill_gap: str, career: str, prior_knowledge: dict) -> dict:
    """Generates an explainable 'Why this was recommended' reason."""
    model = _get_model()
    
    # Fallback if no API key
    if not model:
        return {
            "strongSkills": ["Python", "SQL"] if "Python" in str(prior_knowledge) else ["Basics"],
            "partiallyMastered": [skill_gap],
            "careerRequirement": f"Essential for {career}.",
            "recentGapTrigger": f"Diagnostic identified {skill_gap} as a priority."
        }
        
    prompt = f"""
    You are an educational AI. A user is targeting the {career} role. 
    They have a skill gap in '{skill_gap}'.
    Prior Knowledge: {prior_knowledge}
    
    Return ONLY a valid JSON object with the following keys explaining why they should study {skill_gap}:
    {{
        "strongSkills": [list of 1-2 skills they are already good at based on prior knowledge],
        "partiallyMastered": ["{skill_gap}"],
        "careerRequirement": "1 short sentence on why {career} needs this skill",
        "recentGapTrigger": "1 short sentence on how fixing this gap will help them"
    }}
    Make sure the response is exactly JSON and nothing else (no markdown backticks).
    """
    
    try:
        response = model.generate_content(prompt)
        import json
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
        return json.loads(text.strip())
    except Exception:
        return {
            "strongSkills": ["General Technical Knowledge"],
            "partiallyMastered": [skill_gap],
            "careerRequirement": f"Important competency for a {career}.",
            "recentGapTrigger": "Recommended to bridge your knowledge gap."
        }


def generate_roadmap(target_career: str, skill_gaps: list) -> list:
    """Generates a personalized learning roadmap using Gemini."""
    model = _get_model()
    
    # Fallback if no API key
    if not model:
        return None
        
    prompt = f"""
    You are an AI career path generator. Create a personalized learning roadmap for a user targeting a {target_career} role.
    Their identified skill gaps are: {skill_gaps}
    
    Create exactly 4 learning phases/milestones that directly address these gaps.
    Return ONLY a valid JSON array of objects with the following schema:
    [
        {{
            "title": "Module Title",
            "skillName": "The specific skill gap addressed",
            "phase": 1,
            "phaseTitle": "Phase 1 Group Name",
            "estimatedHours": 10,
            "difficulty": "Beginner/Intermediate/Advanced",
            "resourcesCount": 5,
            "whyPositioned": "1 sentence explanation"
        }}
    ]
    Ensure the JSON is strictly valid. No markdown wrapping.
    """
    
    try:
        response = model.generate_content(prompt)
        import json
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
        return json.loads(text.strip())
    except Exception:
        return None
