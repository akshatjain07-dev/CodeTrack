import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { AllQuestionsPage } from './pages/AllQuestionsPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { RevisionCenterPage } from './pages/RevisionCenterPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TopicsPage } from './pages/TopicsPage';
import { PlatformsPage } from './pages/PlatformsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Application Shell with persistent sidebar and headers */}
        <Route path="/" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="questions" element={<AllQuestionsPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="revisions" element={<RevisionCenterPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="topics" element={<TopicsPage />} />
          <Route path="platforms" element={<PlatformsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
