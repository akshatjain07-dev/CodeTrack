import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import {
  Menu,
  X,
  Search,
  Flame,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { useProblems } from '../context/ProblemContext';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { stats } = useProblems();
  const { isConfigured, profile } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/library?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090B] text-[#FAFAFA]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex-1 flex flex-col max-w-xs w-full bg-[#18181B]">
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#A1A1AA] hover:text-[#FAFAFA] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onMobileClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#27272A] bg-[#18181B]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] rounded-lg md:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-72 lg:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search DSA problems, topics, sheets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
              />
            </form>
          </div>

          {/* Quick Metrics & Status Pills */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Supabase Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#09090B] border border-[#27272A]">
              <Database className="w-3.5 h-3.5 text-[#6366F1]" />
              <span className="text-[#A1A1AA]">Sync:</span>
              {isConfigured ? (
                <span className="text-[#10B981] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  Supabase Live
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Local Mock
                </span>
              )}
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{stats.currentStreak}d Streak</span>
            </div>

            {/* Solved Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-[#10B981]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{stats.totalSolved} Solved</span>
            </div>

            {/* Profile Pill */}
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-[#27272A] border border-transparent hover:border-[#27272A] transition-colors"
            >
              <span className="text-xs font-medium text-[#FAFAFA] hidden sm:inline">
                {profile?.displayName?.split(' ')[0] || 'Alex'}
              </span>
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-7 h-7 rounded-full object-cover border border-[#3F3F46]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#6366F1]/20 border border-[#6366F1]/40 flex items-center justify-center text-[#6366F1] font-semibold text-xs">
                  {profile?.displayName ? profile.displayName[0].toUpperCase() : 'A'}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#09090B] p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
