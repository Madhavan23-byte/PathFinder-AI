import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  HelpCircle,
  BrainCircuit,
} from 'lucide-react';
import { apiService } from '../services/api';
import { RootCauseDiagnosis } from '../types';

export const PracticePage: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rootCause, setRootCause] = useState<RootCauseDiagnosis | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState<'Intermediate' | 'Advanced'>('Intermediate');
  const [adaptationBanner, setAdaptationBanner] = useState<string | null>(null);

  const questionData = {
    concept: 'Model Evaluation — Confusion Matrix',
    difficulty: difficultyLevel,
    text: 'A Machine Learning model for fraud detection evaluates 1,000 transactions. It correctly identifies 90 fraudulent cases, misclassifies 10 fraudulent cases as legitimate, and flags 20 legitimate transactions as fraudulent. What is the Precision of the model?',
    options: [
      '81.8% (Precision = 90 / (90 + 20))',
      '90.0% (Precision = 90 / (90 + 10))',
      '75.0% (Precision = 90 / (90 + 30))',
      '95.0% (Precision = 190 / 200)',
    ],
    correctIndex: 0,
  };

  const handleSubmit = async () => {
    if (selectedOption === null) return;

    setIsSubmitted(true);
    const diagnosis = await apiService.diagnosePracticeAnswer(
      'q_practice_01',
      selectedOption,
      questionData.correctIndex
    );
    setRootCause(diagnosis);

    if (selectedOption === questionData.correctIndex) {
      setDifficultyLevel('Advanced');
      setAdaptationBanner('Performance: 100%! Dynamic AI scaled next question difficulty to Advanced.');
    } else {
      setAdaptationBanner('Performance: Needs Refinement. We will reinforce the algebraic step before scaling difficulty.');
    }
  };

  const handlePracticeAgain = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setRootCause(null);
    setAdaptationBanner(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Diagnostic Practice</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Targeted concept reinforcement with real-time root-cause analysis on mistakes.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
          Difficulty: {difficultyLevel}
        </span>
      </div>

      {/* Adaptive Difficulty Banner (Requirement 16) */}
      {adaptationBanner && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white border border-purple-700 flex items-center gap-3 shadow-md animate-in fade-in duration-200">
          <Sparkles className="w-5 h-5 text-purple-300 shrink-0" />
          <span className="text-xs font-semibold">{adaptationBanner}</span>
        </div>
      )}

      {/* Main Practice Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Concept: {questionData.concept}
          </span>
          <span className="text-xs text-slate-400 font-mono">Question 1 of 1</span>
        </div>

        <p className="text-sm font-semibold text-slate-900 leading-relaxed">{questionData.text}</p>

        {/* Options */}
        <div className="space-y-3">
          {questionData.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === questionData.correctIndex;

            return (
              <div
                key={idx}
                onClick={() => !isSubmitted && setSelectedOption(idx)}
                className={`p-4 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                  isSubmitted
                    ? isCorrectOption
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                      : isSelected
                      ? 'bg-rose-50 border-rose-400 text-rose-900'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                    : isSelected
                    ? 'bg-indigo-600/10 border-indigo-600 text-indigo-950 shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-400 text-slate-500'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{option}</span>
                </div>

                {isSubmitted && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {isSubmitted && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-rose-600" />}
              </div>
            );
          })}
        </div>

        {/* Submit Controls */}
        {!isSubmitted && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-40"
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>

      {/* Root Cause Analysis Panel (Requirement 15) */}
      {isSubmitted && rootCause && (
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-base text-white">Root Cause Diagnostic Breakdown</h3>
            </div>
            <span className="text-xs font-mono text-indigo-400">Diagnostic Verdict</span>
          </div>

          {/* Granular Diagnostic Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">Concept Understanding</span>
              <span className="font-bold text-emerald-400">✓ Correct</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">Formula Selection</span>
              <span className="font-bold text-emerald-400">✓ Correct</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">Algebraic Step</span>
              <span className={`font-bold ${rootCause.algebraicStep ? 'text-emerald-400' : 'text-rose-400'}`}>
                {rootCause.algebraicStep ? '✓ Correct' : '✕ Error Point'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">Unit Conversion</span>
              <span className="font-bold text-emerald-400">✓ Correct</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-purple-200 text-xs leading-relaxed space-y-1">
            <p className="font-bold text-white">PathFinder Verdict:</p>
            <p>{rootCause.feedbackSummary}</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handlePracticeAgain}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Practice Similar Question</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
