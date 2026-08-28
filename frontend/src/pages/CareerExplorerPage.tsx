import React, { useState, useEffect } from 'react';
import {
  Compass, Sparkles, ChevronRight, CheckCircle2, AlertCircle,
  TrendingUp, Clock, DollarSign, Building2, Briefcase, Trophy,
  Loader2, Target, Zap, Info, ArrowRight, Star,
} from 'lucide-react';
import { apiService } from '../services/api';
import { CareerRole, CareerSkillStatus } from '../types';

const DIFFICULTY_COLORS: Record<string, string> = {
  strong: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  partial: 'bg-amber-100 text-amber-700 border border-amber-200',
  gap: 'bg-rose-100 text-rose-700 border border-rose-200',
};

const URGENCY_LABEL: Record<string, string> = {
  strong: '✓ Strong',
  partial: '~ Partial',
  gap: '✗ Gap',
};

export const CareerExplorerPage: React.FC = () => {
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<CareerRole | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedSuccess, setSelectedSuccess] = useState<string | null>(null);
  const [basedOn, setBasedOn] = useState<any>(null);
  const [expandedWhy, setExpandedWhy] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getCareerRecommendations();
      setCareers(data.recommendations);
      setBasedOn(data.basedOn);
      if (data.recommendations.length > 0) {
        setSelectedCareer(data.recommendations[0]);
      }
    } catch (err: any) {
      // Fallback to static list
      try {
        const staticCareers = await apiService.getCareers();
        setCareers(staticCareers);
        if (staticCareers.length > 0) setSelectedCareer(staticCareers[0]);
      } catch {
        setError('Unable to load career recommendations.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCareer = async (career: CareerRole) => {
    setIsSelecting(true);
    try {
      await apiService.selectCareer(career.id || '', career.title);
      setSelectedSuccess(career.title);
      setTimeout(() => setSelectedSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to update career goal.');
    } finally {
      setIsSelecting(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-500';
  };

  const getMatchBg = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-pink-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <p className="text-slate-600 font-medium">Analysing your learner profile…</p>
          <p className="text-slate-400 text-xs">Career Discovery Engine running</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            Career Explorer
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            AI-powered career recommendations based on your learner profile and skill assessment.
          </p>
        </div>
        {basedOn && (
          <div className="flex gap-4 text-xs text-slate-500">
            <div className="text-center">
              <p className="font-bold text-slate-800 text-base">{basedOn.totalCareersEvaluated}</p>
              <p>Careers evaluated</p>
            </div>
            <div className="text-center">
              <p className={`font-bold text-base ${basedOn.assessmentComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                {basedOn.assessmentComplete ? '✓' : '○'}
              </p>
              <p>Assessment</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800 text-base">{basedOn.selfDeclaredSkills}</p>
              <p>Skills declared</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {selectedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm text-emerald-800 font-medium">
            Career goal updated to <strong>{selectedSuccess}</strong>! Your roadmap has been regenerated.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Left: Career List ── */}
        <div className="lg:col-span-2 space-y-3">
          {careers.map((career, idx) => (
            <div
              key={career.id || career.title}
              onClick={() => setSelectedCareer(career)}
              className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                selectedCareer?.title === career.title
                  ? 'border-indigo-400 bg-indigo-50/80 shadow-md shadow-indigo-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {idx === 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5" /> Top Match
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-slate-900 mt-0.5">{career.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{career.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-xl font-black ${getMatchColor(career.matchScore || 0)}`}>
                    {career.matchScore || 0}%
                  </p>
                  <p className="text-[10px] text-slate-400">match</p>
                </div>
              </div>

              {/* Match bar */}
              <div className="mt-3">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getMatchBg(career.matchScore || 0)} rounded-full transition-all duration-700`}
                    style={{ width: `${career.matchScore || 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Right: Career Detail ── */}
        {selectedCareer && (
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{selectedCareer.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{selectedCareer.description}</p>
                </div>
                <div className="text-center shrink-0">
                  <p className={`text-3xl font-black ${getMatchColor(selectedCareer.matchScore || 0)}`}>
                    {selectedCareer.matchScore || 0}%
                  </p>
                  <p className="text-xs text-slate-400">Match Score</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">{selectedCareer.salaryRange}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{selectedCareer.demandGrowth}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>{selectedCareer.estimatedMonths}mo to ready</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* AI Explanation — "Why this career" */}
              {selectedCareer.explanation && (
                <div>
                  <button
                    onClick={() => setExpandedWhy(expandedWhy === selectedCareer.title ? null : selectedCareer.title)}
                    className="flex items-center gap-2 text-sm font-bold text-indigo-700 mb-2 hover:text-indigo-600"
                  >
                    <Sparkles className="w-4 h-4" />
                    Why PathFinder recommends this for you
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expandedWhy === selectedCareer.title ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedWhy === selectedCareer.title && (
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                      <p className="text-sm text-indigo-900 leading-relaxed">{selectedCareer.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Skill Status */}
              {selectedCareer.skillStatuses && selectedCareer.skillStatuses.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    Your Skill Readiness
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      ({selectedCareer.strongCount || 0} strong, {selectedCareer.gapCount || 0} gaps to bridge)
                    </span>
                  </p>
                  <div className="space-y-2">
                    {selectedCareer.skillStatuses.map((sk: CareerSkillStatus) => (
                      <div key={sk.name} className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[sk.status]} w-16 text-center shrink-0`}>
                          {URGENCY_LABEL[sk.status]}
                        </span>
                        <span className="text-xs text-slate-700 flex-1 truncate">{sk.name}</span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${
                              sk.status === 'strong' ? 'bg-emerald-400' :
                              sk.status === 'partial' ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${Math.min(sk.learnerLevel, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 w-8 text-right shrink-0">{sk.learnerLevel}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Companies */}
              {selectedCareer.topCompanies && (
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" /> Top Companies Hiring
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.topCompanies.map(c => (
                      <span key={c} className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Typical Projects */}
              {selectedCareer.typicalProjects && (
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" /> Typical Portfolio Projects
                  </p>
                  <div className="space-y-1.5">
                    {selectedCareer.typicalProjects.map(p => (
                      <div key={p} className="flex items-center gap-2 text-xs text-slate-600">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {selectedCareer.certifications && (
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" /> Key Certifications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.certifications.map(c => (
                      <span key={c} className="text-xs px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="pt-2">
                <button
                  onClick={() => handleSelectCareer(selectedCareer)}
                  disabled={isSelecting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100"
                >
                  {isSelecting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating your roadmap…</>
                    : <><Zap className="w-4 h-4" /> Set {selectedCareer.title} as My Goal <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
                <p className="text-xs text-slate-400 text-center mt-2">This will regenerate your personalised learning roadmap.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
