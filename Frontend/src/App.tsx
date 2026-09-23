import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ScheduledPage } from '@/pages/ScheduledPage';
import { SentPage } from '@/pages/SentPage';
import { SearchPage } from '@/pages/SearchPage';
import { ComposePage } from '@/pages/ComposePage';
import { CampaignsPage } from '@/pages/CampaignsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SlackPage } from '@/pages/SlackPage';
import { useAuth as useAuthHook } from '@/context/AuthContext';

function AppRoutes() {
  const { isAuthenticated } = useAuthHook();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/scheduled" element={<ScheduledPage />} />
                <Route path="/sent" element={<SentPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/compose" element={<ComposePage />} />
                <Route path="/campaigns" element={<CampaignsPage />} />
                <Route path="/campaigns/:status" element={<CampaignsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/slack" element={<SlackPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
