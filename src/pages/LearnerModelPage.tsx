import React from 'react';
import {
  BrainCircuit,
  Award,
  Zap,
  Clock,
  Activity,
  BookOpen,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useApp } from '../context/AppContext';

export const LearnerModelPage: React.FC = () => {
  const { profile, skills } = useApp();

  const radarData = skills.map((s) => ({
    skill: s.name.split(' ')[0],
    mastery: s.currentLevel,
    required: s.requiredLevel,
  }));

  const progressionData = [
    { week: 'Wk 1', mastery: 35 },
    { week: 'Wk 2', mastery: 42 },
    { week: 'Wk 3', mastery: 50 },
    { week: 'Wk 4', mastery: 58 },
    { week: 'Wk 5', mastery: 68 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Learner Model</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic 6-dimensional intelligence profile evaluated continuously by PathFinder AI Engine.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 font-medium">
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
          <span>Last updated after your latest assessment</span>
        </div>
      </div>

      {/* 6 Dimensions Card Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Knowledge Dimension */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>1. Knowledge</span>
            </h3>
            <span className="text-xs font-bold text-indigo-600">{profile.knowledge.overallMastery}%</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Concepts Mastered:</span>
              <span className="font-bold text-slate-900">{profile.knowledge.conceptsMastered} / {profile.knowledge.totalConcepts}</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-emerald-700 block mb-1">Strong Baseline Areas:</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.knowledge.strongSkills.map((sk, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-amber-700 block mb-1">Identified Weak Concepts:</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.knowledge.weakSkills.map((sk, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                    ! {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Ability Dimension */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>2. Ability</span>
            </h3>
            <span className="text-xs font-bold text-purple-600">{profile.ability.assessmentAccuracy}% Accuracy</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Diagnostic Quiz Accuracy:</span>
              <span className="font-bold text-slate-900">{profile.ability.assessmentAccuracy}%</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Total Attempts Logged:</span>
              <span className="font-bold text-slate-900">{profile.ability.totalAttempts} questions</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Mastery Progression Velocity:</span>
              <span className="font-bold text-emerald-600">+{profile.ability.masteryProgression}% acceleration</span>
            </div>
          </div>
        </div>

        {/* 3. Pace Dimension */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              <span>3. Pace</span>
            </h3>
            <span className="text-xs font-bold text-cyan-600">{profile.pace.progressVelocity}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Average Session Time:</span>
              <span className="font-bold text-slate-900">{profile.pace.avgSessionMinutes} mins / session</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Progress Velocity Index:</span>
              <span className="font-bold text-slate-900">{profile.pace.progressVelocity}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Est. Days to Career Readiness:</span>
              <span className="font-bold text-indigo-600">{profile.pace.estimatedDaysToMastery} days</span>
            </div>
          </div>
        </div>

        {/* 4. Behavior Dimension */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" />
              <span>4. Behavior</span>
            </h3>
            <span className="text-xs font-bold text-amber-600">{profile.behavior.consistencyScore}% Score</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Active Sessions / Week:</span>
              <span className="font-bold text-slate-900">{profile.behavior.sessionsPerWeek} days/wk</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Module Completion Rate:</span>
              <span className="font-bold text-slate-900">{profile.behavior.completionRate}%</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Roadmap Delay Days:</span>
              <span className="font-bold text-emerald-600">{profile.behavior.roadmapDelayDays} days (On Track)</span>
            </div>
          </div>
        </div>

        {/* 5. Preferences Dimension */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>5. Preferences</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">Resource Formats</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Preferred Content Types:</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.preferences.resourceTypes.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Optimal Explanation Styles:</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.preferences.explanationFormats.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px]">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6. Goals Dimension */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>6. Goals</span>
            </h3>
            <span className="text-xs font-bold text-emerald-600">Active Target</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Target Role:</span>
              <span className="font-bold text-indigo-600">{profile.user.targetCareer}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Target Completion Date:</span>
              <span className="font-bold text-slate-900">{profile.availability.targetCompletionDate}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Weekly Commitment:</span>
              <span className="font-bold text-slate-900">{profile.availability.weeklyHours} hrs / week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Radar Chart: Skill Balance */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Multi-Dimensional Skill Balance</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#475569' }} />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="Current Mastery" dataKey="mastery" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.4} />
                <Radar name="Required Level" dataKey="required" stroke="#A855F7" fill="#A855F7" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Area Chart: Mastery Trajectory */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Mastery Trajectory (Past 5 Weeks)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="mastery" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
