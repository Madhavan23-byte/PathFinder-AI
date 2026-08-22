import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';

// Pages Imports
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { DashboardPage } from './pages/DashboardPage';
import { LearnerModelPage } from './pages/LearnerModelPage';
import { SkillGapsPage } from './pages/SkillGapsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { LearnPage } from './pages/LearnPage';
import { PracticePage } from './pages/PracticePage';
import { ProgressPage } from './pages/ProgressPage';
import { CareerExplorerPage } from './pages/CareerExplorerPage';
import { BadgesPage } from './pages/BadgesPage';
import { CollaborationPage } from './pages/CollaborationPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { DemoModePage } from './pages/DemoModePage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Layout routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="assessment" element={<AssessmentPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="learner-model" element={<LearnerModelPage />} />
            <Route path="skill-gaps" element={<SkillGapsPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="career-explorer" element={<CareerExplorerPage />} />
            <Route path="badges" element={<BadgesPage />} />
            <Route path="collaboration" element={<CollaborationPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="demo" element={<DemoModePage />} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
