import React from 'react';
import { Award, CheckCircle2, Lock, ShieldCheck, Sparkles, Code2, Database, LineChart, Cpu, Rocket } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BadgesPage: React.FC = () => {
  const { profile } = useApp();

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

  const badgesList = [
    {
      id: 'bdg_py',
      title: 'Python ML Foundations',
      description: 'Verified 90%+ proficiency in Python data structures, list comprehensions, and vectorized NumPy operations.',
      category: 'Core Engineering',
      masteryPercentage: 90,
      dateEarned: '2026-08-10',
      iconName: 'Code2',
      verifiedByAssessment: true,
      isUnlocked: true,
    },
    {
      id: 'bdg_sql',
      title: 'Relational Data Architect',
      description: 'Demonstrated ability to write complex multi-table joins, subqueries, and window functions for feature engineering.',
      category: 'Data Infrastructure',
      masteryPercentage: 85,
      dateEarned: '2026-08-15',
      iconName: 'Database',
      verifiedByAssessment: true,
      isUnlocked: true,
    },
    {
      id: 'bdg_stats',
      title: 'Statistical Intuition',
      description: 'Demonstrated 75%+ mastery in probability distributions, hypothesis testing, and variance analysis.',
      category: 'Mathematics',
      masteryPercentage: 55,
      iconName: 'LineChart',
      verifiedByAssessment: false,
      isUnlocked: false,
    },
    {
      id: 'bdg_ml',
      title: 'Applied ML Practitioner',
      description: 'Successfully trained, tuned, and evaluated 3 supervised learning models with zero data leakage.',
      category: 'Core AI',
      masteryPercentage: 42,
      iconName: 'Cpu',
      verifiedByAssessment: false,
      isUnlocked: false,
    },
    {
      id: 'bdg_ops',
      title: 'Production MLOps Engineer',
      description: 'Containerized an end-to-end ML model into a FastAPI microservice deployed on cloud infrastructure.',
      category: 'Deployment',
      masteryPercentage: 10,
      iconName: 'Rocket',
      verifiedByAssessment: false,
      isUnlocked: false,
    },
  ];

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
        {badgesList.map((badge) => (
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
                  <span>{badge.dateEarned}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
