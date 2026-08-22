import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  HelpCircle,
  Clock,
  BookOpen,
  Target,
  ArrowRight,
  Star,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Recommendation } from '../types';
import { WhyThisModal } from '../components/common/WhyThisModal';

export const RecommendationsPage: React.FC = () => {
  const { notifications } = useApp();
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedWhyRec, setSelectedWhyRec] = useState<Recommendation | null>(null);

  const recommendationsList: Recommendation[] = [
    {
      id: 'rec_01',
      title: 'Precision, Recall & ROC-AUC Deep Dive',
      type: 'Practice',
      skillGapClosed: 'Model Evaluation & Tuning',
      difficulty: 'Intermediate',
      estimatedTime: '45 mins',
      prerequisites: [
        { name: 'Python Foundations', status: 'met' },
        { name: 'Statistics & Probability', status: 'partial' },
      ],
      careerRelevance: 'Critical',
      whyReason: {
        strongSkills: ['Python Foundations', 'SQL Queries'],
        partiallyMastered: ['Statistics'],
        careerRequirement: 'Machine Learning Engineer role requires 80%+ evaluation mastery.',
        recentGapTrigger: 'Your recent diagnostic test showed ambiguity between Type I and Type II error trade-offs.',
      },
      provider: 'PathFinder Interactive Lab',
      rating: 4.9,
    },
    {
      id: 'rec_02',
      title: 'Hands-on Customer Churn Classifier Project',
      type: 'Project',
      skillGapClosed: 'Machine Learning Fundamentals',
      difficulty: 'Intermediate',
      estimatedTime: '3.5 hours',
      prerequisites: [
        { name: 'Python Foundations', status: 'met' },
        { name: 'SQL', status: 'met' },
      ],
      careerRelevance: 'High',
      whyReason: {
        strongSkills: ['Python', 'SQL'],
        partiallyMastered: ['Supervised Learning'],
        careerRequirement: 'Builds portfolio evidence for end-to-end classification pipeline.',
        recentGapTrigger: 'Matches your preferred "Hands-on Projects" learning style.',
      },
      provider: 'PathFinder Capstone Studio',
      rating: 4.8,
    },
    {
      id: 'rec_03',
      title: 'Cross-Validation & Grid Search Optimization',
      type: 'Course',
      skillGapClosed: 'Model Evaluation & Tuning',
      difficulty: 'Intermediate',
      estimatedTime: '2 hours',
      prerequisites: [
        { name: 'Python', status: 'met' },
        { name: 'Statistics', status: 'partial' },
      ],
      careerRelevance: 'High',
      whyReason: {
        strongSkills: ['Python Foundations'],
        partiallyMastered: ['Overfitting Diagnosis'],
        careerRequirement: 'Prevents data leakage in industrial ML models.',
        recentGapTrigger: 'Identified as a high-velocity concept based on your learning speed.',
      },
      provider: 'Scikit-Learn Mastery Series',
      rating: 4.7,
    },
    {
      id: 'rec_04',
      title: 'Adaptive Diagnostic Review: Linear Algebra Basics',
      type: 'Revision',
      skillGapClosed: 'Statistics & Probability',
      difficulty: 'Beginner',
      estimatedTime: '30 mins',
      prerequisites: [{ name: 'Python', status: 'met' }],
      careerRelevance: 'Medium',
      whyReason: {
        strongSkills: ['Python'],
        partiallyMastered: ['Matrix Operations'],
        careerRequirement: 'Required for neural network weight multiplications.',
        recentGapTrigger: 'Refreshes vectors before PyTorch Deep Learning module.',
      },
      provider: 'PathFinder Refresher',
      rating: 4.9,
    },
  ];

  const filteredRecs = filterType === 'All'
    ? recommendationsList
    : recommendationsList.filter((r) => r.type === filterType);

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
                {rec.prerequisites.map((p, i) => (
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
              {/* Visible Why Button (Requirement 12) */}
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
