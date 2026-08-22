import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Map,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Lock,
  Clock,
  BookOpen,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { apiService } from '../services/api';
import { RoadmapItem } from '../types';

export const RoadmapPage: React.FC = () => {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [whySequenceOpen, setWhySequenceOpen] = useState(false);
  const [recalculateNotice, setRecalculateNotice] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getRoadmap();
      setRoadmap(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load your roadmap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    setRecalculateNotice(null);
    try {
      const res = await apiService.recalculateRoadmap('Manual user refresh trigger');
      if (res.updatedRoadmap) setRoadmap(res.updatedRoadmap);
      setRecalculateNotice(res.message || 'Roadmap re-sequenced by PathFinder AI Engine.');
    } catch (err: any) {
      setRecalculateNotice('Recalculation error. Please try again.');
    } finally {
      setIsRecalculating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="h-16 bg-slate-200 rounded-2xl w-full" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
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
          <h2 className="text-base font-bold text-slate-900">Unable to load roadmap</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMsg}</p>
        </div>
        <button
          onClick={fetchRoadmap}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (roadmap.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Map className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-slate-900">Your personalized roadmap is being built</h2>
          <p className="text-xs text-slate-500">
            Your personalized roadmap will appear after your diagnostic assessment.
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
              <Map className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Adaptive Learning Roadmap</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic learning sequence calculated from your skill gaps & assessment performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setWhySequenceOpen(!whySequenceOpen)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span>Why this sequence?</span>
          </button>

          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Roadmap'}</span>
          </button>
        </div>
      </div>

      {/* Adaptive Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white border border-indigo-800 flex items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold text-indigo-100">
            This roadmap adapts as you learn. Completing diagnostic questions automatically re-sequences phases.
          </span>
        </div>
      </div>

      {recalculateNotice && (
        <div className="p-4 rounded-2xl bg-purple-950/80 border border-purple-700 text-purple-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{recalculateNotice}</span>
        </div>
      )}

      {/* Why This Sequence Panel */}
      {whySequenceOpen && (
        <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 text-slate-800 text-xs space-y-2 animate-in fade-in duration-200">
          <h4 className="font-bold text-purple-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <span>AI Sequencing Rationalization</span>
          </h4>
          <p className="leading-relaxed text-slate-700">
            Your roadmap order is generated by topological sorting of prerequisite skills combined with priority skill gap urgency. Baseline prerequisites are placed first, followed immediately by targeted remediation.
          </p>
        </div>
      )}

      {/* Timeline Roadmap Flow */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 sm:before:left-8 before:w-0.5 before:bg-slate-200">
        {roadmap.map((item) => {
          const isCompleted = item.status === 'completed';
          const isCurrent = item.status === 'current';

          return (
            <div key={item.id} className="relative flex items-start gap-4 sm:gap-6 pl-2">
              <div
                className={`w-9 h-9 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-md transition-transform hover:scale-105 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                    : 'bg-slate-200 text-slate-500 border border-slate-300'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isCurrent ? item.phase : <Lock className="w-4 h-4" />}
              </div>

              <div
                className={`flex-1 p-5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-white border-indigo-500/80 shadow-lg ring-1 ring-indigo-500/20'
                    : isCompleted
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-white border-slate-200 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                      Phase {item.phase}: {item.phaseTitle}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCurrent
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.estimatedHours} hrs
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      {item.resourcesCount} modules
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Skill Topic: {item.skillName}</p>

                {item.whyPositioned && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                    💡 <span className="font-semibold text-slate-800">Adaptive AI Note:</span> {item.whyPositioned}
                  </div>
                )}

                {isCurrent && (
                  <div className="mt-4 flex justify-end">
                    <NavLink
                      to="/learn"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                    >
                      <span>Enter Module</span>
                      <ArrowRight className="w-4 h-4" />
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
