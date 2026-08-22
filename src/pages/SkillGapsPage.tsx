import React, { useEffect, useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  X,
  Target,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { apiService } from '../services/api';
import { SkillGap, LearnerProfile } from '../types';

export const SkillGapsPage: React.FC = () => {
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedGapNode, setSelectedGapNode] = useState<SkillGap | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [gapsData, profileData] = await Promise.all([
        apiService.getSkillGaps(),
        apiService.getLearnerProfile(),
      ]);
      setSkillGaps(gapsData);
      setProfile(profileData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load skill gaps. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-3xl" />
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
          <h2 className="text-base font-bold text-slate-900">Unable to load skill gaps</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMsg}</p>
        </div>
        <button
          onClick={fetchData}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (skillGaps.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <GitPullRequest className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-slate-900">No skill gaps calculated yet</h2>
          <p className="text-xs text-slate-500">
            Complete your diagnostic assessment to analyze your proficiency gaps against your target career.
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
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Target Career Skill Gap</span>
          <h1 className="text-2xl font-bold text-white">{profile?.user?.targetCareer || 'Career Track'}</h1>
          <p className="text-xs text-slate-300">
            Real-time gap evaluation comparing self-declared & verified skill mastery against industry standards.
          </p>
        </div>

        <div className="px-6 py-4 rounded-2xl bg-indigo-950/80 border border-indigo-800/80 text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-indigo-300 block">Career Readiness Fit</span>
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-200">
            {profile?.knowledge?.overallMastery || 0}%
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
                      onClick={() => setSelectedGapNode(gap)}
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

      {/* Side Inspector Drawer */}
      {selectedGapNode && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-base">{selectedGapNode.skillName}</h3>
                </div>
                <button
                  onClick={() => setSelectedGapNode(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Current Mastery Level:</span>
                  <span className="font-bold text-indigo-600 font-mono">{selectedGapNode.currentLevel}%</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Required Target Level:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedGapNode.requiredLevel}%</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Priority Level:</span>
                  <span className="font-bold text-rose-600">{selectedGapNode.gapPriority}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Prerequisites</h4>
                {selectedGapNode.prerequisites.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">None (Baseline Topic)</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedGapNode.prerequisites.map((p, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedGapNode(null)}
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
