import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  LearnerProfile,
  Skill,
  SkillGap,
  RoadmapItem,
  NotificationItem,
  CareerRole,
} from '../types';
import {
  mockUser,
  mockLearnerProfile,
  mockSkills,
  mockSkillGaps,
  mockRoadmapItems,
  mockNotifications,
  mockCareerRoles,
} from '../services/mockData';
import { apiService } from '../services/api';

interface AppContextType {
  user: User;
  profile: LearnerProfile;
  skills: Skill[];
  skillGaps: SkillGap[];
  roadmap: RoadmapItem[];
  notifications: NotificationItem[];
  careers: CareerRole[];
  activeCareerRole: CareerRole;
  isRecalculating: boolean;
  demoStep: number;
  unreadCount: number;
  recalculateRoadmap: (reason?: string) => Promise<void>;
  updateUserTargetCareer: (careerId: string) => void;
  markNotificationRead: (id: string) => void;
  setDemoStep: (step: number) => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  resetLearnerModel: () => void;
  loginAsDemoUser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(mockUser);
  const [profile, setProfile] = useState<LearnerProfile>(mockLearnerProfile);
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>(mockSkillGaps);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(mockRoadmapItems);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [careers] = useState<CareerRole[]>(mockCareerRoles);
  const [activeCareerRole, setActiveCareerRole] = useState<CareerRole>(mockCareerRoles[0]);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(1);

  // Sync state on load
  useEffect(() => {
    async function initData() {
      const fetchedProfile = await apiService.getLearnerProfile();
      if (fetchedProfile) setProfile(fetchedProfile);

      const fetchedGaps = await apiService.getSkillGaps();
      if (fetchedGaps) setSkillGaps(fetchedGaps);

      const fetchedRoadmap = await apiService.getRoadmap();
      if (fetchedRoadmap) setRoadmap(fetchedRoadmap);
    }
    initData();
  }, []);

  const recalculateRoadmap = async (reason?: string) => {
    setIsRecalculating(true);
    try {
      const res = await apiService.recalculateRoadmap(reason);
      if (res.success) {
        setRoadmap(res.updatedRoadmap);

        // Add adaptive notification
        const newNotif: NotificationItem = {
          id: `notif_${Date.now()}`,
          title: 'Roadmap Adapted by AI',
          message: res.message || 'Your learning path sequence has been automatically re-optimized based on your mastery trajectory.',
          type: 'adaptive',
          timestamp: 'Just now',
          read: false,
          actionUrl: '/roadmap',
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    } finally {
      setIsRecalculating(false);
    }
  };

  const updateUserTargetCareer = (careerId: string) => {
    const selected = careers.find((c) => c.id === careerId);
    if (!selected) return;

    setActiveCareerRole(selected);
    setUser((prev) => ({ ...prev, targetCareer: selected.title }));

    // Non-destructive update: recalculate readiness score without clearing progress
    setProfile((prev) => ({
      ...prev,
      user: { ...prev.user, targetCareer: selected.title },
      knowledge: {
        ...prev.knowledge,
        overallMastery: selected.readinessScore,
      },
    }));

    // Trigger adaptive notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: `Target Career Updated to ${selected.title}`,
      message: `Your existing skill tree and completed modules were retained. Skill gaps and roadmap sequence re-mapped to match ${selected.title}.`,
      type: 'adaptive',
      timestamp: 'Just now',
      read: false,
      actionUrl: '/skill-gaps',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const nextDemoStep = () => setDemoStep((prev) => Math.min(prev + 1, 10));
  const prevDemoStep = () => setDemoStep((prev) => Math.max(prev - 1, 1));

  const resetLearnerModel = () => {
    setProfile(mockLearnerProfile);
    setRoadmap(mockRoadmapItems);
    setSkillGaps(mockSkillGaps);
    setDemoStep(1);
  };

  const loginAsDemoUser = () => {
    setUser(mockUser);
    setProfile(mockLearnerProfile);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        skills,
        skillGaps,
        roadmap,
        notifications,
        careers,
        activeCareerRole,
        isRecalculating,
        demoStep,
        unreadCount,
        recalculateRoadmap,
        updateUserTargetCareer,
        markNotificationRead,
        setDemoStep,
        nextDemoStep,
        prevDemoStep,
        resetLearnerModel,
        loginAsDemoUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
