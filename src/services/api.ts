import {
  LearnerProfile,
  SkillGap,
  Recommendation,
  RoadmapItem,
  CareerRole,
  Badge,
  StudyPartner,
  RootCauseDiagnosis,
} from '../types';

import {
  mockLearnerProfile,
  mockSkillGaps,
  mockRecommendations,
  mockRoadmapItems,
  mockCareerRoles,
  mockBadges,
  mockStudyPartners,
  mockAssessmentQuestions,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  if (!API_BASE_URL) return null;
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[PathFinder API] Backend unreachable at ${API_BASE_URL}${endpoint}. Falling back to mock layer.`, err);
    return null;
  }
}

export const apiService = {
  // Profile & Learner Model
  async getLearnerProfile(): Promise<LearnerProfile> {
    const data = await fetchAPI<LearnerProfile>('/api/profile');
    return data || mockLearnerProfile;
  },

  async updateProfile(updates: Partial<LearnerProfile>): Promise<LearnerProfile> {
    const data = await fetchAPI<LearnerProfile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data || { ...mockLearnerProfile, ...updates };
  },

  // Skill Gaps & Career Roles
  async getSkillGaps(): Promise<SkillGap[]> {
    const data = await fetchAPI<SkillGap[]>('/api/skill-gaps');
    return data || mockSkillGaps;
  },

  async getCareers(): Promise<CareerRole[]> {
    const data = await fetchAPI<CareerRole[]>('/api/careers');
    return data || mockCareerRoles;
  },

  // Recommendations
  async getRecommendations(): Promise<Recommendation[]> {
    const data = await fetchAPI<Recommendation[]>('/api/recommendations');
    return data || mockRecommendations;
  },

  // Roadmap & Adaptive Recalculation
  async getRoadmap(): Promise<RoadmapItem[]> {
    const data = await fetchAPI<RoadmapItem[]>('/api/roadmap');
    return data || mockRoadmapItems;
  },

  async recalculateRoadmap(triggerReason?: string): Promise<{ success: boolean; updatedRoadmap: RoadmapItem[]; message: string }> {
    const data = await fetchAPI<{ success: boolean; updatedRoadmap: RoadmapItem[]; message: string }>('/api/roadmap/recalculate', {
      method: 'POST',
      body: JSON.stringify({ triggerReason }),
    });

    if (data) return data;

    // Simulated recalculation adjustment:
    const reordered = [...mockRoadmapItems];
    // Move Model Evaluation earlier
    const evalIndex = reordered.findIndex(item => item.id === 'rd_05');
    if (evalIndex !== -1) {
      const [evalItem] = reordered.splice(evalIndex, 1);
      evalItem.status = 'current';
      evalItem.whyPositioned = 'ADAPTED: Prioritized based on recent assessment weakness in model evaluation trade-offs.';
      reordered.splice(2, 0, evalItem);
    }

    return {
      success: true,
      updatedRoadmap: reordered,
      message: 'Adaptive AI engine recalculated your learning path based on your latest accuracy & concept gap signals.',
    };
  },

  // Assessment & Practice
  async submitAssessment(answers: Record<string, number>): Promise<{
    score: number;
    mastered: string[];
    weaknesses: string[];
    adaptiveFeedback: string;
  }> {
    const data = await fetchAPI<any>('/api/assessment/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });

    if (data) return data;

    let correctCount = 0;
    const weaknesses: string[] = [];
    const mastered: string[] = [];

    mockAssessmentQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswerIndex) {
        correctCount++;
        mastered.push(q.conceptTag);
      } else if (answers[q.id] !== undefined) {
        weaknesses.push(q.conceptTag);
      }
    });

    const scorePct = Math.round((correctCount / mockAssessmentQuestions.length) * 100);

    return {
      score: scorePct,
      mastered,
      weaknesses: weaknesses.length > 0 ? weaknesses : ['Advanced Model Tuning'],
      adaptiveFeedback: `Assessment complete (${scorePct}% score). Diagnostic model updated your skill gap matrix.`,
    };
  },

  async diagnosePracticeAnswer(questionId: string, selectedIndex: number, correctIndex: number): Promise<RootCauseDiagnosis> {
    const isCorrect = selectedIndex === correctIndex;

    if (isCorrect) {
      return {
        conceptUnderstanding: true,
        formulaApplication: true,
        algebraicStep: true,
        unitConversion: true,
        feedbackSummary: 'Perfect response! You correctly identified the core concept and mathematical logic.',
        recommendedAction: 'Ready to advance to higher difficulty questions on this topic.',
      };
    }

    // Granular root-cause diagnosis breakdown
    return {
      conceptUnderstanding: true,
      formulaApplication: true,
      algebraicStep: false,
      unitConversion: true,
      feedbackSummary: 'The core statistical concept appears correct! The error occurred during the algebraic step of calculating the False Positive Rate.',
      recommendedAction: 'Practice 2 targeted algebra steps before attempting the full confusion matrix question again.',
    };
  },

  // Badges & Partners
  async getBadges(): Promise<Badge[]> {
    const data = await fetchAPI<Badge[]>('/api/badges');
    return data || mockBadges;
  },

  async getStudyPartners(): Promise<StudyPartner[]> {
    const data = await fetchAPI<StudyPartner[]>('/api/partners');
    return data || mockStudyPartners;
  },

  // AI Chat Assistant
  async sendAIChat(message: string, context?: any): Promise<string> {
    const data = await fetchAPI<{ response: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });

    if (data) return data.response;

    // Smart contextual responses for demo
    const msg = message.toLowerCase();
    if (msg.includes('why') || msg.includes('statistics')) {
      return 'Statistics forms the foundation for machine learning algorithms. Concepts like probability distributions, p-values, and hypothesis testing directly determine how model parameters are estimated and how loss functions evaluate uncertainty.';
    } else if (msg.includes('explain') || msg.includes('differently') || msg.includes('simple')) {
      return 'Think of overfitting like memorizing exam answers instead of learning the underlying concepts. When the test questions change slightly, a memorizer fails — just like an overfitted model fails on unseen validation data!';
    } else if (msg.includes('code') || msg.includes('example')) {
      return 'Here is a quick Python snippet for computing Precision and Recall using Scikit-Learn:\n\n```python\nfrom sklearn.metrics import precision_score, recall_score\n\ny_true = [0, 1, 1, 0, 1]\ny_pred = [0, 1, 0, 0, 1]\n\nprec = precision_score(y_true, y_pred)\nrec = recall_score(y_true, y_pred)\nprint(f"Precision: {prec:.2f}, Recall: {rec:.2f}")\n```';
    }

    return `Based on your current learner model for ${mockLearnerProfile.user.targetCareer}, focusing on ${mockLearnerProfile.knowledge.weakSkills[0]} will give you the highest career readiness bump (+12%). Let me know if you would like a code example or visual explanation!`;
  },
};
