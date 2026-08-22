import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Flame,
  Calendar,
  AlertCircle,
  RefreshCw,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart as ReLineChart,
  Line,
} from 'recharts';
import { NavLink } from 'react-router-dom';
import { apiService } from '../services/api';
import { ProgressData } from '../types';

export const ProgressPage: React.FC = () => {
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProgress = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiService.getProgress();
      setData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load progress metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-3xl" />
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
          <h2 className="text-base font-bold text-slate-900">Unable to load progress</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMsg}</p>
        </div>
        <button
          onClick={fetchProgress}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!data || data.learningHours === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <LineChart className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-slate-900">Your progress will appear here as you begin learning</h2>
          <p className="text-xs text-slate-500">
            Complete your diagnostic assessment and practice questions to populate your progress analytics.
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-600 flex items-center justify-center">
              <LineChart className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Progress & Learning Rhythm</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Empirical progress metrics and supportive rhythm analysis without high-pressure shaming.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#4F46E5"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="163"
                strokeDashoffset={163 - (163 * (data.careerReadiness || 0)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-extrabold text-sm text-slate-900">{data.careerReadiness}%</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Career Readiness</span>
            <p className="text-xs text-emerald-600 font-semibold mt-1">API Verified</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Skills Mastered</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {data.skillsMasteredCount} / {data.totalSkillsCount}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Verified by assessment</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Learning Hours</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{data.learningHours} hrs</div>
          <p className="text-xs text-indigo-600 font-semibold mt-0.5">Logged Learning Time</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Current Streak</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 flex items-center gap-1.5">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-400" />
            <span>{data.streakDays} Days</span>
          </div>
          <p className="text-xs text-amber-600 font-semibold mt-0.5">Consistent Habit</p>
        </div>
      </div>

      {/* Learning Rhythm Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Learning Rhythm & Study Schedule</span>
            </h2>
            <p className="text-xs text-slate-400">Planned vs Actual study commitments</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">Planned: <strong className="text-white">{data.plannedWeeklyHours} hrs/wk</strong></span>
            <span className="text-slate-400">Actual: <strong className="text-indigo-400">{data.actualWeeklyHours} hrs/wk</strong></span>
          </div>
        </div>

        {/* Weekly Bar Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeklyRhythm || []}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', background: '#0F172A', border: '1px solid #334155', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="planned" name="Planned Hours" fill="#334155" radius={[6, 6, 0, 0]} />
              <Bar dataKey="actual" name="Actual Logged" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assessment Trend Line Chart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Diagnostic Assessment Score Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={data.scoreTrend || []}>
              <XAxis dataKey="quiz" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} dot={{ r: 5, fill: '#4F46E5' }} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
