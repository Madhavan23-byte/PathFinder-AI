import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BrainCircuit,
  Target,
  Flame,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  TrendingUp,
  BookOpen,
  ChevronRight,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { DashboardData, Recommendation } from '../types';
import { AdaptiveLoopBanner } from '../components/common/AdaptiveLoopBanner';
import { WhyThisModal } from '../components/common/WhyThisModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedWhyRec, setSelectedWhyRec] = useState<Recommendation | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiService.getDashboard();
      setData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load your learner dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="h-32 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">Unable to load your dashboard</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMsg}</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-slate-900">Your learner model is being built</h2>
          <p className="text-xs text-slate-500">
            Complete your diagnostic assessment to understand your current strengths, career readiness, and skill gaps.
          </p>
        </div>
        <NavLink
          to="/assessment"
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow-md inline-flex items-center gap-2"
        >
          <span>Start Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </NavLink>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {user?.name || 'Learner'} 👋
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Target Career:{' '}
            <span className="font-bold text-indigo-600">{data.targetCareer || 'Career Navigator'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/assessment"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Retake Assessment</span>
          </NavLink>

          <NavLink
            to="/learn"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Continue Learning</span>
          </NavLink>
        </div>
      </div>

      {/* Adaptive Loop Vision Banner */}
      <AdaptiveLoopBanner />

      {/* Real Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Career Readiness</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{data.careerReadiness}%</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Verified API Readiness</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Focus</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-slate-900 truncate">{data.currentFocus || 'Initial Assessment'}</div>
            <div className="text-xs text-slate-500 mt-1">Active Skill Gap</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Roadmap Progress</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{data.roadmapProgress}%</div>
            <div className="text-xs text-slate-500 mt-1">
              {data.completedPhases} of {data.totalPhases} Phases Complete
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Learning Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{data.streakDays} Days</div>
            <div className="text-xs text-amber-600 font-semibold mt-1">Active Rhythm</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Two Column Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Recommended Action Card */}
          {data.primaryRecommendation ? (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white shadow-xl border border-indigo-800/60 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Next Recommended Action</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Est. Time: {data.primaryRecommendation.estimatedTime}</span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                    {data.primaryRecommendation.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Skill Gap Closed: <span className="text-cyan-300 font-semibold">{data.primaryRecommendation.skillGapClosed}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <NavLink
                    to="/learn"
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    <span>Start Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </NavLink>

                  <button
                    onClick={() => setSelectedWhyRec(data.primaryRecommendation)}
                    className="px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-purple-500/50 text-purple-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span>Why am I seeing this?</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
              <p className="text-xs text-slate-500">Complete your profile and diagnostic assessment to unlock recommendations.</p>
            </div>
          )}

          {/* Skill Snapshot Chart */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Skill Snapshot</h3>
                <p className="text-xs text-slate-500">Current proficiency vs Required career proficiency</p>
              </div>
              <NavLink to="/skill-gaps" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                <span>View Full Knowledge Graph</span>
                <ChevronRight className="w-4 h-4" />
              </NavLink>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.skillsOverview || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                  <Bar dataKey="current" name="Current Mastery %" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="required" name="Target Required %" fill="#CBD5E1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-8">
          {/* Mini Roadmap Preview */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Adaptive Roadmap</h3>
              <NavLink to="/roadmap" className="text-xs font-semibold text-indigo-600 hover:underline">
                View Full
              </NavLink>
            </div>

            <div className="space-y-3">
              {(data.recentRoadmap || []).slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    item.status === 'completed'
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                      : item.status === 'current'
                      ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {item.status === 'current' && <span className="w-3 h-3 rounded-full bg-indigo-600 animate-ping shrink-0" />}
                    {item.status === 'locked' && <span className="w-3 h-3 rounded-full border border-slate-400 shrink-0" />}
                    <span className="truncate">{item.title}</span>
                  </div>

                  <span className="text-[10px] font-medium shrink-0">
                    {item.status === 'completed' ? '✓ Done' : item.status === 'current' ? 'Active' : 'Locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Rhythm Summary */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Learning Rhythm</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Planned Hours:</span>
                <span className="font-bold text-slate-900 font-mono">{data.plannedHours || 0} hrs / wk</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Actual Logged:</span>
                <span className="font-bold text-indigo-600 font-mono">{data.actualHours || 0} hrs / wk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explainable AI Modal */}
      {selectedWhyRec && (
        <WhyThisModal recommendation={selectedWhyRec} onClose={() => setSelectedWhyRec(null)} />
      )}
    </div>
  );
};
