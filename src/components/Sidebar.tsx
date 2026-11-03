import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  RotateCcw,
  BarChart2,
  Settings,
  Flame,
  LogOut,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useProblems } from '../context/ProblemContext';

interface SidebarProps {
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onMobileClose }) => {
  const { user, profile, signOut } = useAuth();
  const { stats } = useProblems();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Problem Library', path: '/library', icon: BookOpen },
    { label: 'My Collections', path: '/collections', icon: Layers },
    { label: 'Revision Deck', path: '/revision', icon: RotateCcw, badge: '4 due' },
    { label: 'Analytics', path: '/analytics', icon: BarChart2 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleExitToLanding = () => {
    if (user) {
      signOut();
    }
    navigate('/');
    if (onMobileClose) onMobileClose();
  };

  return (
    <aside className="w-64 h-screen bg-[#18181B] border-r border-[#27272A] flex flex-col justify-between flex-shrink-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 border-b border-[#27272A] flex items-center justify-between">
          <NavLink
            to="/"
            onClick={onMobileClose}
            className="group flex items-center"
          >
            <Logo variant="horizontal" size="md" showProBadge={true} />
          </NavLink>
        </div>

        {/* Quick Streak Card */}
        <div className="px-4 pt-4 pb-2">
          <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#FAFAFA]">
                  {stats.currentStreak} Day Streak
                </p>
                <p className="text-[11px] text-[#A1A1AA]">
                  {stats.solvedToday}/{stats.dailyGoal} solved today
                </p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" title="Streak active" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-3 space-y-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-[#6366F1]/15 text-[#6366F1] border-l-4 border-[#6366F1] pl-2.5 font-semibold'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-[#6366F1]'
                            : 'text-[#71717A] group-hover:text-[#FAFAFA]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User & Exit to Landing / Sign Out Button */}
      <div className="p-3 border-t border-[#27272A] bg-[#18181B] space-y-3">
        {/* Active Sheet Quick Progress */}
        <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#A1A1AA] truncate font-medium">
              {stats.activeSheetTitle}
            </span>
            <span className="text-[#10B981] font-semibold">{stats.activeSheetProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#27272A] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6366F1] to-[#10B981] rounded-full transition-all duration-500"
              style={{ width: `${stats.activeSheetProgress}%` }}
            />
          </div>
        </div>

        {/* User Info Bar */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#27272A]/40 border border-[#27272A]">
          <div className="flex items-center gap-2.5 min-w-0">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-8 h-8 rounded-full object-cover border border-[#3F3F46]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] font-semibold text-xs">
                {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#FAFAFA] truncate">
                {profile?.displayName || 'CS Student'}
              </p>
              <p className="text-[11px] text-[#A1A1AA] truncate">
                {user ? user.email : 'Developer Account'}
              </p>
            </div>
          </div>
        </div>

        {/* Exit to Landing / Sign Out Button */}
        <button
          onClick={handleExitToLanding}
          className="w-full py-2 px-3 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-[#71717A] group-hover:text-rose-400 transition-colors" />
          <span>Exit to Landing</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
