import React, { useEffect, useState } from 'react';
import {
  Target,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  BrainCircuit,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { apiService } from '../services/api';
import { AssessmentQuestion, RootCauseDiagnosis } from '../types';

export const PracticePage: React.FC = () => {
  const [question, setQuestion] = useState<AssessmentQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rootCause, setRootCause] = useState<RootCauseDiagnosis | null>(null);

  const fetchNextQuestion = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSelectedOption(null);
    setIsSubmitted(false);
    setRootCause(null);

    try {
      const q = await apiService.getNextPracticeQuestion();
      setQuestion(q);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load practice question from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion();
  }, []);

  const handleSubmit = async () => {
    if (selectedOption === null || !question) return;

    setIsSubmitting(true);
    try {
      const diagnosis = await apiService.submitPracticeAnswer({
        questionId: question.id,
        selectedIndex: selectedOption,
      });
      setRootCause(diagnosis);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit practice response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Practice Error</h2>
        <p className="text-xs text-slate-500">{errorMsg}</p>
        <button
          onClick={fetchNextQuestion}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!question) return null;

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
          Difficulty: {question.difficulty}
        </span>
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Concept: {question.conceptTag}
          </span>
          <span className="text-xs text-slate-400 font-mono">Skill: {question.skill}</span>
        </div>

        <p className="text-sm font-semibold text-slate-900 leading-relaxed">{question.question}</p>

        {question.codeSnippet && (
          <div className="p-4 rounded-2xl bg-slate-900 text-indigo-300 font-mono text-xs overflow-x-auto">
            <pre>{question.codeSnippet}</pre>
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <div
                key={idx}
                onClick={() => !isSubmitted && setSelectedOption(idx)}
                className={`p-4 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
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
              </div>
            );
          })}
        </div>

        {/* Submit Controls */}
        {!isSubmitted && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null || isSubmitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-40 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Diagnosing...</span>
                </>
              ) : (
                <span>Submit Answer</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Backend Generated Root Cause Analysis Panel */}
      {isSubmitted && rootCause && (
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-base text-white">Backend Root Cause Diagnosis</h3>
            </div>
            <span className="text-xs font-mono text-indigo-400">Diagnostic Verdict</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">Concept Understanding</span>
              <span className={`font-bold ${rootCause.conceptUnderstanding ? 'text-emerald-400' : 'text-rose-400'}`}>
                {rootCause.conceptUnderstanding ? '✓ Correct' : '✕ Gap'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">Formula Selection</span>
              <span className={`font-bold ${rootCause.formulaApplication ? 'text-emerald-400' : 'text-rose-400'}`}>
                {rootCause.formulaApplication ? '✓ Correct' : '✕ Error Point'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">Algebraic Step</span>
              <span className={`font-bold ${rootCause.algebraicStep ? 'text-emerald-400' : 'text-rose-400'}`}>
                {rootCause.algebraicStep ? '✓ Correct' : '✕ Error Point'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">Unit Conversion</span>
              <span className={`font-bold ${rootCause.unitConversion ? 'text-emerald-400' : 'text-rose-400'}`}>
                {rootCause.unitConversion ? '✓ Correct' : '✕ Gap'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-purple-200 text-xs leading-relaxed space-y-1">
            <p className="font-bold text-white">PathFinder Verdict:</p>
            <p>{rootCause.feedbackSummary}</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={fetchNextQuestion}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Next Practice Question</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
