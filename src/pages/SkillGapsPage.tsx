import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Target,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SkillGap, Skill } from '../types';

export const SkillGapsPage: React.FC = () => {
  const { profile, skillGaps, skills, activeCareerRole } = useApp();
  const [selectedSkillNode, setSelectedSkillNode] = useState<Skill | null>(null);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">Critical Gap</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">High Priority</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">Medium Priority</span>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Target Career Skill Gap</span>
          <h1 className="text-2xl font-bold text-white">{activeCareerRole.title} Track</h1>
          <p className="text-xs text-slate-300">
            Real-time gap evaluation comparing self-declared & verified skill mastery against industry standards.
          </p>
        </div>

        <div className="px-6 py-4 rounded-2xl bg-indigo-950/80 border border-indigo-800/80 text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-indigo-300 block">Career Readiness Fit</span>
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-200">
            {profile.knowledge.overallMastery}%
          </span>
        </div>
      </div>

      {/* Skill Gap Comparison Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-indigo-600" />
            <span>Career Skill Gap Matrix</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">{skillGaps.length} Gaps Tracked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Skill Name</th>
                <th className="py-3 px-4">Current Mastery</th>
                <th className="py-3 px-4">Required</th>
                <th className="py-3 px-4">Gap Status</th>
                <th className="py-3 px-4">Est. Hours</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {skillGaps.map((gap) => (
                <tr key={gap.skillId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{gap.skillName}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: `${gap.currentLevel}%` }} />
                      </div>
                      <span className="font-mono text-slate-700">{gap.currentLevel}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{gap.requiredLevel}%</td>
                  <td className="py-3.5 px-4">{getPriorityBadge(gap.gapPriority)}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{gap.estimatedHours} hrs</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        const matched = skills.find((s) => s.name === gap.skillName);
                        if (matched) setSelectedSkillNode(matched);
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-semibold hover:bg-indigo-100 transition-colors"
                    >
                      Inspect Node
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Knowledge Graph Node Map */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <span>Interactive Skill Knowledge Graph</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Click any node to inspect prerequisite dependencies and recommended remediation modules.
          </p>
        </div>

        {/* Visual Node Flow Matrix */}
        <div className="p-6 rounded-2xl bg-slate-950 text-white border border-slate-800 overflow-x-auto">
          <div className="min-w-[650px] flex items-center justify-between gap-4 relative">
            {skills.map((skill, idx) => (
              <React.Fragment key={skill.id}>
                <div
                  onClick={() => setSelectedSkillNode(skill)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-105 min-w-[140px] text-center space-y-2 relative z-10 ${
                    skill.status === 'mastered'
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 shadow-lg shadow-emerald-950/50'
                      : skill.status === 'in_progress'
                      ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200 shadow-lg shadow-indigo-950/50'
                      : skill.status === 'needs_reinforcement'
                      ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    {skill.status.replace('_', ' ')}
                  </div>
                  <div className="text-xs font-bold text-white truncate">{skill.name}</div>
                  <div className="text-xs font-mono font-semibold">{skill.currentLevel}% Mastery</div>
                </div>

                {idx < skills.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Side Inspector Drawer */}
      {selectedSkillNode && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-base">{selectedSkillNode.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedSkillNode(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Current Mastery Level:</span>
                  <span className="font-bold text-indigo-600 font-mono">{selectedSkillNode.currentLevel}%</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Required Target Level:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedSkillNode.requiredLevel}%</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Career Relevance:</span>
                  <span className="font-bold text-rose-600">{selectedSkillNode.careerRelevance}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Prerequisites</h4>
                {selectedSkillNode.prerequisites.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">None (Baseline Topic)</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSkillNode.prerequisites.map((p, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedSkillNode(null)}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
