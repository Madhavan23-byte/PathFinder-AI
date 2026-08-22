import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  AlertCircle,
  RefreshCw,
  BrainCircuit,
  Loader2,
} from 'lucide-react';
import { apiService } from '../services/api';
import { AssessmentQuestion, AssessmentResult } from '../types';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isCompleted, setIsCompleted] = useState(false);
  const [report, setReport] = useState<AssessmentResult | null>(null);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.startAssessment();
      setQuestions(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to start assessment. Please verify backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optIndex }));
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        const result = await apiService.submitAssessment(selectedAnswers);
        setReport(result);
        setIsCompleted(true);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to submit assessment answers.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading diagnostic assessment questions from backend...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Assessment Error</h2>
          <p className="text-xs text-slate-400">{errorMsg}</p>
          <button
            onClick={fetchQuestions}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (isCompleted && report) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Assessment Complete</h1>
            <p className="text-xs text-slate-300">PathFinder Adaptive Engine compiled your initial baseline</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diagnostic Mastery Score</span>
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                {report.score}% Accuracy
              </div>
              <p className="text-xs text-slate-400 mt-1">Difficulty Reached: {report.difficultyReached || 'Intermediate'}</p>
            </div>

            <div className="px-5 py-3 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-200 text-xs font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Learner Model Updated</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Concept Strengths</span>
              </h3>
              <ul className="space-y-1 text-xs text-slate-300">
                {(report.mastered || []).map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Needs Reinforcement</span>
              </h3>
              <ul className="space-y-1 text-xs text-slate-300">
                {(report.weaknesses || []).map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => navigate('/learner-model')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2"
          >
            <BrainCircuit className="w-5 h-5" />
            <span>View Updated Learner Model & Roadmap</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-8 relative">
      <div className="w-full max-w-3xl bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Adaptive Diagnostic Assessment</h1>
              <p className="text-xs text-slate-400">
                Question {currentIndex + 1} of {questions.length} • Skill: {currentQ.skill}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300">
            Difficulty: {currentQ.difficulty}
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Concept Tag: {currentQ.conceptTag}
            </span>
            <p className="text-sm font-semibold text-slate-100 leading-relaxed">{currentQ.question}</p>

            {currentQ.codeSnippet && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                <pre>{currentQ.codeSnippet}</pre>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === optIdx;
              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`p-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-600 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span>{option}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-700/80 pt-4">
          <div className="text-xs text-slate-400 font-mono">
            Progress: {Math.round(((currentIndex + 1) / questions.length) * 100)}%
          </div>

          <button
            onClick={handleNext}
            disabled={selectedAnswers[currentQ.id] === undefined || isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 disabled:opacity-40 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <span>{currentIndex === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
