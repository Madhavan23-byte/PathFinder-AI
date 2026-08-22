import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BrainCircuit,
  GitPullRequest,
  Sparkles,
  Map,
  BookOpen,
  Target,
  LineChart,
  Compass,
  Award,
  Users,
  User,
  Settings,
  Flame,
  PlayCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { profile } = useApp();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Learner Model', path: '/learner-model', icon: BrainCircuit, badge: 'AI' },
    { label: 'Skill Gaps', path: '/skill-gaps', icon: GitPullRequest },
    { label: 'Recommendations', path: '/recommendations', icon: Sparkles, badge: 'New' },
    { label: 'Adaptive Roadmap', path: '/roadmap', icon: Map },
    { label: 'Learn Workspace', path: '/learn', icon: BookOpen },
    { label: 'Diagnostic Practice', path: '/practice', icon: Target },
    { label: 'Progress & Rhythm', path: '/progress', icon: LineChart },
    { label: 'Career Explorer', path: '/career-explorer', icon: Compass },
    { label: 'Micro-Credentials', path: '/badges', icon: Award },
    { label: 'Study Partners', path: '/collaboration', icon: Users },
    { label: 'Learner Profile', path: '/profile', icon: User },
    { label: 'App Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header / Brand Logo */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  PathFinder
                </span>
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-indigo-400">
                  Adaptive AI Engine
                </span>
              </div>
            </NavLink>

            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Special Hackathon Demo Mode Callout */}
          <div className="px-4 pt-4">
            <NavLink
              to="/demo"
              onClick={onClose}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                location.pathname === '/demo'
                  ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/50 text-white shadow-lg shadow-purple-500/10'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800 hover:border-purple-500/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <PlayCircle className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-purple-200">Hackathon Demo</div>
                  <div className="text-[10px] text-slate-400">Interactive Adaptation Loop</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-medium">
                Try
              </span>
            </NavLink>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
            <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/25 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile Mini Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <img
                src={profile.user.avatar}
                alt={profile.user.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile.user.name}</p>
                <p className="text-xs text-indigo-400 truncate">{profile.user.targetCareer}</p>
              </div>

              <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold bg-amber-950/40 border border-amber-800/40 px-2 py-1 rounded-lg">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>5d</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
