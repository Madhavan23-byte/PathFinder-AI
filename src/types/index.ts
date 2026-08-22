export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  targetCareer: string;
  education: string;
  currentRole: string;
  isDemoAccount?: boolean;
}

export interface KnowledgeMetrics {
  overallMastery: number; // percentage
  conceptsMastered: number;
  totalConcepts: number;
  strongSkills: string[];
  weakSkills: string[];
}

export interface AbilityMetrics {
  assessmentAccuracy: number; // percentage
  totalAttempts: number;
  masteryProgression: number; // trend +%
}

export interface PaceMetrics {
  avgSessionMinutes: number;
  progressVelocity: 'Optimal' | 'Accelerated' | 'Moderate' | 'Behind';
  estimatedDaysToMastery: number;
}

export interface BehaviorMetrics {
  sessionsPerWeek: number;
  completionRate: number; // percentage
  consistencyScore: number; // 0-100
  roadmapDelayDays: number;
}

export interface PreferenceMetrics {
  resourceTypes: ('Video' | 'Text' | 'Visual' | 'Hands-on practice' | 'Interactive' | 'Projects' | 'Quizzes')[];
  explanationFormats: ('Step-by-step' | 'Conceptual' | 'Code-first' | 'Visual Diagram' | 'Analogy')[];
}

export interface AvailabilityMetrics {
  weeklyHours: number;
  preferredDays: string[];
  targetCompletionDate: string;
}

export interface LearnerProfile {
  user: User;
  knowledge: KnowledgeMetrics;
  ability: AbilityMetrics;
  pace: PaceMetrics;
  behavior: BehaviorMetrics;
  preferences: PreferenceMetrics;
  availability: AvailabilityMetrics;
  lastUpdated: string;
}

export type SkillStatus = 'mastered' | 'in_progress' | 'needs_reinforcement' | 'missing' | 'locked';

export interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: number; // 0 - 100
  requiredLevel: number; // 0 - 100
  status: SkillStatus;
  prerequisites: string[];
  careerRelevance: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface SkillGap {
  skillId: string;
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  gapPriority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedHours: number;
  prerequisites: string[];
  careerRelevance: string;
}

export interface CareerRole {
  id: string;
  title: string;
  description: string;
  matchScore: number; // percentage fit
  readinessScore: number; // percentage ready
  estimatedMonths: number;
  salaryRange: string;
  demandGrowth: string;
  keySkills: { name: string; required: number; userProficiency: number }[];
}

export interface AssessmentQuestion {
  id: string;
  skill: string;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  conceptTag: string;
}

export interface RootCauseDiagnosis {
  conceptUnderstanding: boolean;
  formulaApplication: boolean;
  algebraicStep: boolean;
  unitConversion: boolean;
  feedbackSummary: string;
  recommendedAction: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  skillName: string;
  phase: number;
  phaseTitle: string;
  order: number;
  status: 'completed' | 'current' | 'locked';
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  resourcesCount: number;
  whyPositioned: string;
}

export interface RecommendationReason {
  strongSkills: string[];
  partiallyMastered: string[];
  careerRequirement: string;
  recentGapTrigger: string;
}

export interface Recommendation {
  id: string;
  title: string;
  type: 'Course' | 'Practice' | 'Project' | 'Assessment' | 'Revision';
  skillGapClosed: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  prerequisites: { name: string; status: 'met' | 'partial' | 'missing' }[];
  careerRelevance: 'High' | 'Medium' | 'Critical';
  whyReason: RecommendationReason;
  provider: string;
  rating: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: string;
  masteryPercentage: number;
  dateEarned?: string;
  iconName: string;
  verifiedByAssessment: boolean;
  isUnlocked: boolean;
}

export interface StudyPartner {
  id: string;
  name: string;
  role: string;
  avatar: string;
  matchPercentage: number;
  targetCareer: string;
  currentFocus: string;
  complementarySkills: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'adaptive';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
