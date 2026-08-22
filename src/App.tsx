import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages Imports
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
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
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Landing */}
              <Route index element={<LandingPage />} />

              {/* Guest Auth Routes (Redirects to /dashboard if logged in) */}
              <Route
                path="login"
                element={
                  <ProtectedRoute allowGuest>
                    <LoginPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="signup"
                element={
                  <ProtectedRoute allowGuest>
                    <SignupPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="forgot-password"
                element={
                  <ProtectedRoute allowGuest>
                    <ForgotPasswordPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reset-password"
                element={
                  <ProtectedRoute allowGuest>
                    <ResetPasswordPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Learner Routes (Redirects to /login if unauthenticated) */}
              <Route
                path="onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="assessment"
                element={
                  <ProtectedRoute>
                    <AssessmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="learner-model"
                element={
                  <ProtectedRoute>
                    <LearnerModelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="skill-gaps"
                element={
                  <ProtectedRoute>
                    <SkillGapsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="recommendations"
                element={
                  <ProtectedRoute>
                    <RecommendationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="roadmap"
                element={
                  <ProtectedRoute>
                    <RoadmapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="learn"
                element={
                  <ProtectedRoute>
                    <LearnPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="practice"
                element={
                  <ProtectedRoute>
                    <PracticePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="progress"
                element={
                  <ProtectedRoute>
                    <ProgressPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="career-explorer"
                element={
                  <ProtectedRoute>
                    <CareerExplorerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="badges"
                element={
                  <ProtectedRoute>
                    <BadgesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="collaboration"
                element={
                  <ProtectedRoute>
                    <CollaborationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="demo"
                element={
                  <ProtectedRoute>
                    <DemoModePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
