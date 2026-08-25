import React, { createContext, useContext, useState } from 'react';
import { NotificationItem, CareerRole, LearnerProfile } from '../types';

interface AppContextType {
  profile?: LearnerProfile | null;
  notifications: NotificationItem[];
  unreadCount: number;
  demoStep: number;
  markNotificationRead: (id: string) => void;
  setDemoStep: (step: number) => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [demoStep, setDemoStep] = useState<number>(1);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const nextDemoStep = () => setDemoStep((prev) => Math.min(prev + 1, 10));
  const prevDemoStep = () => setDemoStep((prev) => Math.max(prev - 1, 1));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        notifications,
        unreadCount,
        demoStep,
        markNotificationRead,
        setDemoStep,
        nextDemoStep,
        prevDemoStep,
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
