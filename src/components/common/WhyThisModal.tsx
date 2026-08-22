import React from 'react';
import { Recommendation } from '../../types';
import { X, CheckCircle2, AlertTriangle, Target, Sparkles, BrainCircuit } from 'lucide-react';

interface WhyThisModalProps {
  recommendation: Recommendation | null;
  onClose: () => void;
}

export const WhyThisModal: React.FC<WhyThisModalProps> = ({ recommendation, onClose }) => {
  if (!recommendation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Why am I seeing this?</h3>
              <p className="text-xs text-purple-300">Explainable AI Recommendation Signals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Target Recommendation Header */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 px-2 py-0.5 rounded bg-indigo-100">
              {recommendation.type} • {recommendation.estimatedTime}
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-2">{recommendation.title}</h4>
            <p className="text-xs text-slate-600 mt-1">Target Skill Gap: {recommendation.skillGapClosed}</p>
          </div>

          {/* AI Decision Drivers */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Matching Signals from Your Learner Model</span>
            </h5>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-900">Strong Baseline: </span>
                  Your {recommendation.whyReason.strongSkills.join(', ')} proficiency is verified at 85%+. You possess all prerequisite foundations.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-slate-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-900">Diagnostic Signal: </span>
                  {recommendation.whyReason.recentGapTrigger}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-slate-800">
                <Target className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-indigo-900">Career Alignment: </span>
                  {recommendation.whyReason.careerRequirement}
                </div>
              </div>
            </div>
          </div>

          {/* Prerequisite Readiness */}
          <div>
            <h5 className="text-xs font-semibold text-slate-700 mb-2">Prerequisite Status Check</h5>
            <div className="flex flex-wrap gap-2">
              {recommendation.prerequisites.map((p, i) => (
                <span
                  key={i}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 ${
                    p.status === 'met'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}
                >
                  {p.status === 'met' ? '✓' : '◐'} {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
