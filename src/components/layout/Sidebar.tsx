import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Learner Model', path: '/learner-model', icon: BrainCircuit, badge: 'AI' },
    { label: 'Skill Gaps', path: '/skill-gaps', icon: GitPullRequest },
    { label: 'Recommendations', path: '/recommendations', icon: Sparkles },
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

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || 'PathFinder Learner'
  )}&background=4F46E5&color=fff`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
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

          {/* Navigation Items */}
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

          {/* Authenticated User Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user?.avatar || defaultAvatar}
                  alt={user?.name || 'Learner'}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Learner'}</p>
                  <p className="text-[10px] text-indigo-400 truncate">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
