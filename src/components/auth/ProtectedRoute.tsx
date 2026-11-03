import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RefreshCw } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, loading, demoMode } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-sky-500 flex items-center justify-center font-mono font-bold text-slate-950 text-base shadow-sm animate-pulse">
            CT
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
            <span>Verifying session security...</span>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated or has explicitly chosen local demo mode
  if (user || demoMode) {
    return <Outlet />;
  }

  // Redirect unauthenticated user to /login with origin path saved
  return <Navigate to="/login" state={{ from: location }} replace />;
};
