import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, ShieldCheck, Code2, Database, LineChart, Cpu, Rocket, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { apiService } from '../services/api';
import { Badge } from '../types';

export const BadgesPage: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBadges = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getBadges();
      setBadges(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load micro-credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-6 h-6 text-indigo-500" />;
      case 'Database':
        return <Database className="w-6 h-6 text-cyan-500" />;
      case 'LineChart':
        return <LineChart className="w-6 h-6 text-purple-500" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-amber-500" />;
      case 'Rocket':
        return <Rocket className="w-6 h-6 text-rose-500" />;
      default:
        return <Award className="w-6 h-6 text-indigo-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Unable to load badges</h2>
        <p className="text-xs text-slate-500">{errorMsg}</p>
        <button
          onClick={fetchBadges}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Award className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-slate-900">Your first mastery milestone is waiting</h2>
          <p className="text-xs text-slate-500">
            Complete your first learning milestone to earn a badge.
          </p>
        </div>
        <NavLink
          to="/learn"
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow-md inline-flex items-center gap-2"
        >
          <span>Start Learning</span>
          <ArrowRight className="w-4 h-4" />
        </NavLink>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Micro-Credentials & Badges</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Badges validated by empirical diagnostic accuracy rather than passive video watch time.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Diagnostic Mastery Verified</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-6 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
              badge.isUnlocked
                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                : 'bg-slate-50/80 border-slate-200 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  {getIcon(badge.iconName)}
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    badge.isUnlocked
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {badge.isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{badge.title}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {badge.category}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{badge.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Mastery Accuracy:</span>
                <span className="font-bold text-slate-900 font-mono">{badge.masteryPercentage}%</span>
              </div>

              {badge.isUnlocked && (
                <div className="flex justify-between items-center text-emerald-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Earned:
                  </span>
                  <span>{badge.dateEarned || 'Recent'}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
