import {
  User,
  AuthResponse,
  LearnerProfile,
  SkillGap,
  Recommendation,
  RoadmapItem,
  CareerRole,
  Badge,
  StudyPartner,
  DashboardData,
  ProgressData,
  AssessmentQuestion,
  AssessmentResult,
  RootCauseDiagnosis,
} from '../types';

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== '') {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000';
  }
  return '';
};

const API_BASE_URL = getApiBaseUrl();

function getAuthToken(): string | null {
  return localStorage.getItem('pathfinder_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('pathfinder_token', token);
  } else {
    localStorage.removeItem('pathfinder_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Server error (${response.status})`;
    try {
      const errData = await response.json();
      if (errData && errData.detail) {
        errorMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      } else if (errData && errData.message) {
        errorMessage = errData.message;
      }
    } catch (_) {
      // json parse fallback
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const apiService = {
  // --- AUTHENTICATION API ---
  async signup(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<{ message: string }> {
    try {
      const res = await request<{ message: string }>('/api/auth/logout', { method: 'POST' });
      setAuthToken(null);
      return res;
    } catch (e) {
      setAuthToken(null);
      return { message: 'Logged out' };
    }
  },

  async getCurrentUser(): Promise<User> {
    return request<User>('/api/auth/me');
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(data: { token: string; password: string }): Promise<{ message: string }> {
    return request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // --- DASHBOARD & PROFILE DATA API ---
  async getDashboard(): Promise<DashboardData> {
    return request<DashboardData>('/api/dashboard');
  },

  async getLearnerModel(): Promise<LearnerProfile> {
    return request<LearnerProfile>('/api/learner-model');
  },

  async getSkillGaps(): Promise<SkillGap[]> {
    return request<SkillGap[]>('/api/skill-gaps');
  },

  async getRecommendations(): Promise<Recommendation[]> {
    return request<Recommendation[]>('/api/recommendations');
  },

  async getRoadmap(): Promise<RoadmapItem[]> {
    return request<RoadmapItem[]>('/api/roadmap');
  },

  async recalculateRoadmap(triggerReason?: string): Promise<{ success: boolean; updatedRoadmap: RoadmapItem[]; message: string }> {
    return request<{ success: boolean; updatedRoadmap: RoadmapItem[]; message: string }>('/api/roadmap/recalculate', {
      method: 'POST',
      body: JSON.stringify({ triggerReason }),
    });
  },

  // --- ASSESSMENT & PRACTICE API ---
  async startAssessment(): Promise<AssessmentQuestion[]> {
    return request<AssessmentQuestion[]>('/api/assessment/start');
  },

  async submitAssessment(answers: Record<string, number>): Promise<AssessmentResult> {
    return request<AssessmentResult>('/api/assessment/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  async getAssessmentResult(attemptId: string): Promise<AssessmentResult> {
    return request<AssessmentResult>(`/api/assessment/result/${attemptId}`);
  },

  async getNextPracticeQuestion(): Promise<AssessmentQuestion> {
    return request<AssessmentQuestion>('/api/practice/next');
  },

  async submitPracticeAnswer(data: { questionId: string; selectedIndex: number }): Promise<RootCauseDiagnosis> {
    return request<RootCauseDiagnosis>('/api/practice/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // --- PROGRESS & BADGES API ---
  async getProgress(): Promise<ProgressData> {
    return request<ProgressData>('/api/progress');
  },

  async getBadges(): Promise<Badge[]> {
    return request<Badge[]>('/api/badges');
  },

  // --- USER PROFILE & CAREERS API ---
  async getProfile(): Promise<LearnerProfile> {
    return request<LearnerProfile>('/api/profile');
  },

  async updateProfile(updates: Partial<LearnerProfile>): Promise<LearnerProfile> {
    return request<LearnerProfile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getCareers(): Promise<CareerRole[]> {
    return request<CareerRole[]>('/api/careers');
  },

  async getPartners(): Promise<StudyPartner[]> {
    return request<StudyPartner[]>('/api/partners');
  },

  async sendAIChat(message: string, context?: any): Promise<string> {
    const res = await request<{ response: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
    return res.response;
  },
};
