import React from 'react';
import { Sparkles, ArrowRight, Activity } from 'lucide-react';

export const AdaptiveLoopBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shadow-xl border border-indigo-900/50 mb-8">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>PathFinder Adaptive AI Engine Active</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            "The system changes because <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300">YOU change</span>."
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your learner model observes performance across 6 cognitive dimensions (Knowledge, Ability, Pace, Behavior, Preferences, Goals) and updates your recommendations in real-time.
          </p>
        </div>

        <div className="w-full lg:w-auto bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Assess</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-indigo-300">
            <span>Model Update</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-purple-300">
            <span>Identify Gap</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <span>Adapt Path</span>
          </div>
        </div>
      </div>
    </div>
  );
};
