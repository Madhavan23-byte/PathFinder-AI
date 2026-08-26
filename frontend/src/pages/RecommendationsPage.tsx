import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  HelpCircle,
  ArrowRight,
  Star,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { apiService } from '../services/api';
import { Recommendation } from '../types';
import { WhyThisModal } from '../components/common/WhyThisModal';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedWhyRec, setSelectedWhyRec] = useState<Recommendation | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getRecommendations();
      setRecommendations(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'We couldn\'t load your recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const filteredRecs = filterType === 'All'
    ? recommendations
    : recommendations.filter((r) => r.type === filterType);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-48 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
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
          <h2 className="text-base font-bold text-slate-900">Unable to load recommendations</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMsg}</p>
        </div>
        <button
          onClick={fetchRecommendations}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-slate-900">No recommendations available</h2>
          <p className="text-xs text-slate-500">
            Complete your profile and diagnostic assessment to receive personalized recommendations.
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
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recommended For You</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explainable AI recommendations prioritized according to your highest priority skill gaps.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Course', 'Practice', 'Project', 'Revision'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === type
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation Cards List */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredRecs.map((rec) => (
          <div
            key={rec.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider">
                  {rec.type} • {rec.estimatedTime}
                </span>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{rec.rating}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{rec.title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Target Gap: <span className="font-semibold text-indigo-600">{rec.skillGapClosed}</span>
                </p>
              </div>

              {/* Prerequisites check */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(rec.prerequisites || []).map((p, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      p.status === 'met'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {p.status === 'met' ? '✓' : '◐'} {p.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedWhyRec(rec)}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <span>Why am I seeing this?</span>
              </button>

              <NavLink
                to="/learn"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
              >
                <span>Start Topic</span>
                <ArrowRight className="w-4 h-4" />
              </NavLink>
            </div>
          </div>
        ))}
      </div>

      {/* Explainable AI Modal */}
      {selectedWhyRec && (
        <WhyThisModal recommendation={selectedWhyRec} onClose={() => setSelectedWhyRec(null)} />
      )}
    </div>
  );
};
