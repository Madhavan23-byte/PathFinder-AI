import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  RefreshCw,
  Target,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationPanel } from '../common/NotificationPanel';

interface TopbarProps {
  onOpenSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenSidebar }) => {
  const { profile, unreadCount, isRecalculating, recalculateRoadmap } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative flex-1 hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts, skills, career roles, or recommendations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Right: Actions, Adaptive Sync, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Target Career Chip */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Target: {profile.user.targetCareer}</span>
          </div>

          {/* Quick Recalculate Roadmap Button */}
          <button
            onClick={() => recalculateRoadmap('Manual user sync request from Topbar')}
            disabled={isRecalculating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50"
            title="Trigger AI Learner Model recalculation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isRecalculating ? 'Recalculating...' : 'Recalculate Path'}
            </span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Profile Quick Link */}
          <NavLink
            to="/profile"
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img
              src={profile.user.avatar}
              alt={profile.user.name}
              className="w-8 h-8 rounded-full object-cover border border-indigo-200"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                <span>{profile.user.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-500">Learner ID: {profile.user.id}</div>
            </div>
          </NavLink>
        </div>
      </div>
    </header>
  );
};
