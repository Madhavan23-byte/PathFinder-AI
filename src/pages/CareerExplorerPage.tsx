import React from 'react';
import {
  Compass,
  Target,
  Sparkles,
  CheckCircle2,
  GitPullRequest,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CareerRole } from '../types';

export const CareerExplorerPage: React.FC = () => {
  const { careers, activeCareerRole, updateUserTargetCareer } = useApp();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Career Explorer & What-If Simulator</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate switching career tracks without losing your existing verified skills or completed modules.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Non-Destructive Skill Mapping</span>
        </div>
      </div>

      {/* Non-Destructive Equation Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
          PathFinder What-If Simulation Equation
        </span>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-300">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-300">
            Existing Skills
          </span>
          <span>+</span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-indigo-300">
            Completed Progress
          </span>
          <span>+</span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-purple-300">
            New Career Requirements
          </span>
          <span>=</span>
          <span className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-700 font-bold text-cyan-200">
            Adapted Skill Gaps & Roadmap
          </span>
        </div>
      </div>

      {/* Career Comparison Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {careers.map((role) => {
          const isCurrentActive = role.id === activeCareerRole.id;

          return (
            <div
              key={role.id}
              className={`p-6 rounded-3xl border transition-all space-y-5 flex flex-col justify-between ${
                isCurrentActive
                  ? 'bg-white border-indigo-600 shadow-xl ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-base text-slate-900">{role.title}</h3>
                  </div>

                  {isCurrentActive && (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                      Active Target Goal
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{role.description}</p>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Career Fit</span>
                    <span className="font-bold text-indigo-600 font-mono">{role.matchScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Readiness</span>
                    <span className="font-bold text-emerald-600 font-mono">{role.readinessScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Est. Time</span>
                    <span className="font-bold text-slate-900 font-mono">{role.estimatedMonths} mos</span>
                  </div>
                </div>

                {/* Key Skills Checklist */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Skill Match Breakdown:</span>
                  <div className="space-y-1.5 text-xs">
                    {role.keySkills.slice(0, 4).map((sk, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 truncate">{sk.name}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400">Req: {sk.required}%</span>
                          <span
                            className={
                              sk.userProficiency >= sk.required
                                ? 'text-emerald-600 font-bold'
                                : 'text-amber-600 font-semibold'
                            }
                          >
                            You: {sk.userProficiency}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target Switch Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-mono">
                  {role.salaryRange} • {role.demandGrowth}
                </div>

                {!isCurrentActive ? (
                  <button
                    onClick={() => updateUserTargetCareer(role.id)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <span>Switch Goal to {role.title.split(' ')[0]}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Currently Selected
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
