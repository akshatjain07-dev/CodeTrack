import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ProblemProvider } from './context/ProblemContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ProblemLibrary } from './pages/ProblemLibrary';
import { MyCollections } from './pages/MyCollections';
import { RevisionDeck } from './pages/RevisionDeck';
import { Analytics } from './pages/Analytics';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <ProblemProvider>
          <Routes>
            {/* Standalone Landing Page (No Sidebar) */}
            <Route path="/" element={<Landing />} />

            {/* Standalone Authentication & OAuth Callbacks */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Application Shell with Persistent Navigation Sidebar */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/library" element={<ProblemLibrary />} />
                <Route path="/problems" element={<Navigate to="/library" replace />} />
                <Route path="/collections" element={<MyCollections />} />
                <Route path="/revision" element={<RevisionDeck />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch-all redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ProblemProvider>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
