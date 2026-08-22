import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Award,
  Zap,
  Clock,
  Activity,
  BookOpen,
  Target,
  RefreshCw,
  AlertCircle,
  ArrowRight,
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
import { NavLink } from 'react-router-dom';
import { apiService } from '../services/api';
import { LearnerProfile } from '../types';

export const LearnerModelPage: React.FC = () => {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLearnerModel = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getLearnerModel();
      setProfile(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load your learner model. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearnerModel();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-2xl" />
          ))}
        </div>
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
          <h2 className="text-base font-bold text-slate-900">Unable to load learner model</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMsg}</p>
        </div>
        <button
          onClick={fetchLearnerModel}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!profile || !profile.knowledge) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-slate-900">Your learner model is being built</h2>
          <p className="text-xs text-slate-500">
            Complete your diagnostic assessment to understand your current strengths and skill gaps.
          </p>
        </div>
        <NavLink
          to="/assessment"
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow-md inline-flex items-center gap-2"
        >
          <span>Start Diagnostic Assessment</span>
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
          <span>Last updated: {profile.lastUpdated || 'Just now'}</span>
        </div>
      </div>

      {/* 6 Dimensions Card Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Knowledge */}
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
              <span className="font-bold text-slate-900">
                {profile.knowledge.conceptsMastered} / {profile.knowledge.totalConcepts}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-emerald-700 block mb-1">Strong Areas:</span>
              <div className="flex flex-wrap gap-1.5">
                {(profile.knowledge.strongSkills || []).map((sk, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-amber-700 block mb-1">Needs Reinforcement:</span>
              <div className="flex flex-wrap gap-1.5">
                {(profile.knowledge.weakSkills || []).map((sk, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                    ! {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Ability */}
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
              <span className="text-slate-600">Quiz Accuracy:</span>
              <span className="font-bold text-slate-900">{profile.ability.assessmentAccuracy}%</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Total Attempts Logged:</span>
              <span className="font-bold text-slate-900">{profile.ability.totalAttempts} questions</span>
            </div>
          </div>
        </div>

        {/* 3. Pace */}
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
              <span className="text-slate-600">Avg Session Duration:</span>
              <span className="font-bold text-slate-900">{profile.pace.avgSessionMinutes} mins</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Est. Days to Mastery:</span>
              <span className="font-bold text-indigo-600">{profile.pace.estimatedDaysToMastery} days</span>
            </div>
          </div>
        </div>

        {/* 4. Behavior */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" />
              <span>4. Behavior</span>
            </h3>
            <span className="text-xs font-bold text-amber-600">{profile.behavior.consistencyScore}% Consistency</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Active Days / Week:</span>
              <span className="font-bold text-slate-900">{profile.behavior.sessionsPerWeek} days/wk</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Completion Rate:</span>
              <span className="font-bold text-slate-900">{profile.behavior.completionRate}%</span>
            </div>
          </div>
        </div>

        {/* 5. Preferences */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>5. Preferences</span>
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Preferred Formats:</span>
              <div className="flex flex-wrap gap-1.5">
                {(profile.preferences?.resourceTypes || []).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6. Goals */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>6. Goals</span>
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Target Role:</span>
              <span className="font-bold text-indigo-600">{profile.user.targetCareer || 'Career Goal'}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Weekly Hours:</span>
              <span className="font-bold text-slate-900">{profile.availability.weeklyHours} hrs/wk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
