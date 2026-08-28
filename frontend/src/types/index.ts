export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  education?: string;
  currentRole?: string;
  targetCareer?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface KnowledgeMetrics {
  overallMastery: number;
  conceptsMastered: number;
  totalConcepts: number;
  strongSkills: string[];
  weakSkills: string[];
  masteredConcepts?: string[];
}

export interface AbilityMetrics {
  assessmentAccuracy: number;
  totalAttempts: number;
  masteryProgression: number;
}

export interface PaceMetrics {
  avgSessionMinutes: number;
  progressVelocity: 'Optimal' | 'Accelerated' | 'Moderate' | 'Behind' | 'New Learner';
  estimatedDaysToMastery: number;
}

export interface BehaviorMetrics {
  sessionsPerWeek: number;
  completionRate: number;
  consistencyScore: number;
  roadmapDelayDays: number;
}

export interface PreferenceMetrics {
  resourceTypes: string[];
  explanationFormats: string[];
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
  currentLevel: number;
  requiredLevel: number;
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

export interface CareerSkillStatus {
  name: string;
  learnerLevel: number;
  requiredLevel: number;
  status: 'strong' | 'partial' | 'gap';
}

export interface CareerRole {
  id: string;
  title: string;
  description: string;
  matchScore: number;
  readinessScore: number;
  estimatedMonths: number;
  salaryRange: string;
  demandGrowth: string;
  keySkills: { name: string; required: number; userProficiency: number }[];
  explanation?: string;
  skillStatuses?: CareerSkillStatus[];
  gapCount?: number;
  strongCount?: number;
  typicalProjects?: string[];
  certifications?: string[];
  topCompanies?: string[];
}

export interface CareerRecommendationResponse {
  recommendations: CareerRole[];
  basedOn: {
    selfDeclaredSkills: number;
    assessmentComplete: boolean;
    targetCareer: string;
    totalCareersEvaluated: number;
  };
}

export interface NextAction {
  actionType: string;
  actionLabel: string;
  targetRoute: string;
  reason: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  estimatedMinutes: number;
}

export interface AssessmentQuestion {
  id: string;
  skill: string;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex?: number;
  explanation?: string;
  conceptTag: string;
  skillId?: string;
}

export interface AssessmentResult {
  attemptId: string;
  score: number;
  mastered: string[];
  weaknesses: string[];
  difficultyReached: string;
  recommendedNextAction: string;
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
  status: 'completed' | 'current' | 'locked' | 'remedial';
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  resourcesCount: number;
  whyPositioned: string;
  description?: string;
  prerequisites?: string[];
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

export interface DashboardData {
  targetCareer: string;
  careerReadiness: number;
  currentFocus: string;
  roadmapProgress: number;
  completedPhases: number;
  totalPhases: number;
  streakDays: number;
  primaryRecommendation: Recommendation;
  skillsOverview: { name: string; current: number; required: number }[];
  recentRoadmap: RoadmapItem[];
  plannedHours: number;
  actualHours: number;
}

export interface ProgressData {
  careerReadiness: number;
  skillsMasteredCount: number;
  totalSkillsCount: number;
  learningHours: number;
  streakDays: number;
  plannedWeeklyHours: number;
  actualWeeklyHours: number;
  weeklyRhythm: { day: string; planned: number; actual: number }[];
  scoreTrend: { quiz: string; score: number }[];
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

// ── Teaching Engine Types ─────────────────────────────────────────────────────

export interface TeachingQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  conceptTag: string;
  correctExplanation: string;
}

export interface TeachingSession {
  skillId: string;
  skillName: string;
  phase: 'explain' | 'example' | 'question' | 'evaluate' | 'feedback' | 'complete';
  explanation: string;
  example: string;
  question: TeachingQuestion;
  difficulty: string;
  estimatedMinutes: number;
  learningObjectives: string[];
  keyPoints: string[];
}

export interface TeachingEvaluation {
  isCorrect: boolean;
  score: number;
  feedbackTitle: string;
  feedbackBody: string;
  conceptUnderstanding: boolean;
  correctIndex: number;
  correctExplanation: string;
  recommendedAction: 'continue' | 'practice_more' | 'remedial';
  nextPhase: string;
}

export interface NextConceptResponse {
  skillId: string | null;
  skillName?: string;
  difficulty?: string;
  estimatedMinutes?: number;
  prerequisites?: string[];
  teachingRoute?: string;
  message: string;
  recommendedAction?: string;
}

// ── Project Types ─────────────────────────────────────────────────────────────

export interface ProjectMilestone {
  id: string;
  title: string;
  estimatedHours: number;
  completed: boolean;
}

export interface Project {
  id: string;
  title: string;
  skillStage: string;
  targetCareers: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  description: string;
  objective: string;
  skillsUsed: string[];
  milestones: ProjectMilestone[];
  evaluationCriteria: string[];
  expectedOutput: string;
  portfolioValue: string;
  careerMatch?: boolean;
  completedMilestones?: number;
  totalMilestones?: number;
  completionPercentage?: number;
  status?: 'available' | 'in_progress' | 'completed';
  isStarted?: boolean;
}

// ── Career Readiness Types ────────────────────────────────────────────────────

export interface ReadinessFactor {
  score: number;
  weight: number;
  insight: string;
}

export interface ReadinessScore {
  overallScore: number;
  readinessLabel: string;
  topImprovement: string;
  skillMastery: ReadinessFactor & { details: { skill: string; score: number; weight: number; status: string }[] };
  assessmentPerformance: ReadinessFactor;
  projectCompletion: ReadinessFactor & { completedMilestones: number; totalMilestones: number };
  learningConsistency: ReadinessFactor & { streakDays: number; sessionsPerWeek: number };
}
