import React, { useState } from 'react';
import {
  LineChart,
  Target,
  Flame,
  Award,
  Clock,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Calendar,
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
import { useApp } from '../context/AppContext';

export const ProgressPage: React.FC = () => {
  const { profile } = useApp();
  const [workloadAdjusted, setWorkloadAdjusted] = useState(false);

  const weeklyRhythmData = [
    { day: 'Mon', planned: 2, actual: 2.5 },
    { day: 'Tue', planned: 2, actual: 2.0 },
    { day: 'Wed', planned: 2, actual: 0.0 },
    { day: 'Thu', planned: 2, actual: 1.5 },
    { day: 'Fri', planned: 0, actual: 0.0 },
    { day: 'Sat', planned: 1, actual: 0.5 },
    { day: 'Sun', planned: 1, actual: 0.0 },
  ];

  const scoreTrendData = [
    { quiz: 'Test 1', score: 62 },
    { quiz: 'Test 2', score: 70 },
    { quiz: 'Test 3', score: 75 },
    { quiz: 'Test 4', score: 78 },
  ];

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

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Career Readiness Circular Card */}
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
                strokeDashoffset={163 - (163 * 72) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-extrabold text-sm text-slate-900">72%</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Career Readiness</span>
            <p className="text-xs text-emerald-600 font-semibold mt-1">On Target</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Skills Mastered</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">12 / 20</div>
          <p className="text-xs text-slate-500 mt-0.5">Verified by assessment</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Learning Hours</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">42.5 hrs</div>
          <p className="text-xs text-indigo-600 font-semibold mt-0.5">+4.5 hrs this week</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Current Streak</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 flex items-center gap-1.5">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-400" />
            <span>5 Days</span>
          </div>
          <p className="text-xs text-amber-600 font-semibold mt-0.5">Consistent Habit</p>
        </div>
      </div>

      {/* Learning Rhythm Section & Supportive Workload Prompt (Requirement 18) */}
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
            <span className="text-slate-400">Planned: <strong className="text-white">10 hrs/wk</strong></span>
            <span className="text-slate-400">Actual: <strong className="text-indigo-400">6.5 hrs/wk</strong></span>
            <span className="text-rose-400">Diff: -3.5 hrs</span>
          </div>
        </div>

        {/* Supportive Non-Shaming Workload Card (Requirement 18) */}
        {!workloadAdjusted ? (
          <div className="p-5 rounded-2xl bg-indigo-950/70 border border-indigo-700/60 space-y-3">
            <div className="flex items-start gap-3">
              <HeartHandshake className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Need to adjust your study pace?</h4>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Your recent study schedule seems lighter than planned. That is completely okay! Would you like to adjust your weekly hours or extend your target completion date?
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setWorkloadAdjusted(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Reduce Workload (7 hrs/wk)
              </button>
              <button
                onClick={() => setWorkloadAdjusted(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
              >
                Extend Target Date (+2 wks)
              </button>
              <button
                onClick={() => setWorkloadAdjusted(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
              >
                Keep Current Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Roadmap study pace updated smoothly. Zero penalties applied.</span>
          </div>
        )}

        {/* Weekly Bar Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyRhythmData}>
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
            <ReLineChart data={scoreTrendData}>
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
