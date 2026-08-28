import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  BrainCircuit, BookOpen, Code2, HelpCircle, CheckCircle2,
  XCircle, ArrowRight, Sparkles, Lightbulb, Target,
  ChevronRight, RefreshCw, Loader2, Trophy, Zap, AlertCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiService } from '../services/api';
import { TeachingSession, TeachingEvaluation } from '../types';

type Phase = 'explain' | 'example' | 'question' | 'evaluate' | 'feedback' | 'complete';

const DEFAULT_SKILL = 'python_foundations';

const AVAILABLE_SKILLS = [
  { id: 'python_foundations', name: 'Python Foundations', icon: '🐍', difficulty: 'Beginner' },
  { id: 'statistics_probability', name: 'Statistics & Probability', icon: '📊', difficulty: 'Intermediate' },
  { id: 'machine_learning', name: 'Machine Learning', icon: '🤖', difficulty: 'Intermediate' },
  { id: 'linear_algebra', name: 'Linear Algebra', icon: '📐', difficulty: 'Intermediate' },
];

export const LearnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const skillId = searchParams.get('skill') || DEFAULT_SKILL;
  const [session, setSession] = useState<TeachingSession | null>(null);
  const [phase, setPhase] = useState<Phase>('explain');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState<TeachingEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStartTime] = useState(Date.now());

  const explanationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSession();
  }, [skillId]);

  const loadSession = async () => {
    setIsLoading(true);
    setError(null);
    setPhase('explain');
    setSelectedAnswer(null);
    setEvaluation(null);
    try {
      const data = await apiService.getTeachingSession(skillId);
      setSession(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load learning session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || selectedAnswer === null) return;
    setIsEvaluating(true);
    try {
      const result = await apiService.evaluateAnswer({
        skillId: session.skillId,
        questionId: session.question.id,
        selectedIndex: selectedAnswer,
        correctIndex: session.question.correctIndex,
      });
      setEvaluation(result);
      setPhase('feedback');
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate answer.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!session) return;
    const score = evaluation?.isCorrect ? 100 : 50;
    const timeSpent = Math.round((Date.now() - sessionStartTime) / 60000);
    try {
      await apiService.completeTeachingSession({
        skillId: session.skillId,
        score,
        timeSpentMinutes: Math.max(timeSpent, 5),
      });
    } catch (_) {}
    setPhase('complete');
  };

  const handleNextConcept = async () => {
    try {
      const next = await apiService.getNextConcept();
      if (next.skillId) {
        navigate(`/learn?skill=${next.skillId}`);
      } else {
        navigate('/project-mentor');
      }
    } catch (_) {
      navigate('/roadmap');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <p className="text-slate-600 font-medium">PathFinder AI is preparing your lesson…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Lesson unavailable</h2>
        <p className="text-slate-500 text-sm">{error}</p>
        <button onClick={loadSession} className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500">
          Retry
        </button>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <BrainCircuit className="w-4 h-4 text-indigo-500" />
            <span>AI Teaching Session</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-indigo-600 font-semibold">{session.skillName}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{session.skillName}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              session.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
              session.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}>{session.difficulty}</span>
            <span className="text-xs text-slate-500">~{session.estimatedMinutes} min</span>
          </div>
        </div>

        {/* Skill Switcher */}
        <div className="flex gap-2 flex-wrap">
          {AVAILABLE_SKILLS.map(sk => (
            <button
              key={sk.id}
              onClick={() => navigate(`/learn?skill=${sk.id}`)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                sk.id === skillId
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400'
              }`}
            >
              {sk.icon} {sk.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Phase Progress Bar ── */}
      <div className="flex items-center gap-2">
        {(['explain', 'example', 'question', 'feedback', 'complete'] as Phase[]).map((p, i) => {
          const phaseOrder: Phase[] = ['explain', 'example', 'question', 'feedback', 'complete'];
          const currentIdx = phaseOrder.indexOf(phase);
          const isComplete = i < currentIdx;
          const isCurrent = p === phase || (phase === 'evaluate' && p === 'question');
          return (
            <React.Fragment key={p}>
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                isCurrent ? 'bg-indigo-600 text-white' :
                isComplete ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-400'
              }`}>
                {isComplete ? <CheckCircle2 className="w-3 h-3" /> : null}
                <span className="capitalize">{p}</span>
              </div>
              {i < 4 && <div className={`flex-1 h-0.5 rounded-full ${isComplete ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Learning Objectives ── */}
      {phase === 'explain' && session.learningObjectives.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" /> Learning Objectives
          </p>
          <ul className="space-y-1">
            {session.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-indigo-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── PHASE: EXPLAIN ── */}
      {phase === 'explain' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">PathFinder AI Explanation</p>
              <p className="text-sm font-semibold text-slate-800">{session.skillName} — Core Concepts</p>
            </div>
          </div>
          <div ref={explanationRef} className="p-6 prose prose-sm prose-indigo max-w-none">
            <ReactMarkdown>{session.explanation}</ReactMarkdown>
          </div>
          {session.keyPoints.length > 0 && (
            <div className="px-6 pb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Key Takeaways
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {session.keyPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-amber-500 font-bold text-xs mt-0.5">→</span>
                    <span className="text-xs text-amber-800">{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="px-6 pb-6">
            <button
              onClick={() => setPhase('example')}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
            >
              <span>See a Practical Example</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── PHASE: EXAMPLE ── */}
      {phase === 'example' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Practical Example</p>
              <p className="text-sm font-semibold text-slate-800">Let's see this in action</p>
            </div>
          </div>
          <div className="p-6 prose prose-sm prose-emerald max-w-none">
            <ReactMarkdown>{session.example}</ReactMarkdown>
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={() => setPhase('explain')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
            >
              ← Review Explanation
            </button>
            <button
              onClick={() => setPhase('question')}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all hover:scale-105"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Test My Understanding</span>
            </button>
          </div>
        </div>
      )}

      {/* ── PHASE: QUESTION ── */}
      {(phase === 'question' || phase === 'evaluate') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Quick Check</p>
              <p className="text-sm font-semibold text-slate-800">Concept: {session.question.conceptTag}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{session.question.text}</ReactMarkdown>
            </div>

            <div className="space-y-3">
              {session.question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => phase !== 'evaluate' && setSelectedAnswer(idx)}
                  disabled={phase === 'evaluate'}
                  className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-medium transition-all ${
                    selectedAnswer === idx
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  } ${phase === 'evaluate' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      selectedAnswer === idx
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-slate-300 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPhase('example')}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
              >
                ← Back to Example
              </button>
              <button
                onClick={() => { setPhase('evaluate'); handleSubmitAnswer(); }}
                disabled={selectedAnswer === null || isEvaluating || phase === 'evaluate'}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 disabled:hover:scale-100"
              >
                {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>{isEvaluating ? 'Evaluating…' : 'Submit Answer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PHASE: FEEDBACK ── */}
      {phase === 'feedback' && evaluation && (
        <div className={`bg-white rounded-3xl border-2 shadow-sm overflow-hidden ${
          evaluation.isCorrect ? 'border-emerald-300' : 'border-rose-300'
        }`}>
          <div className={`flex items-center gap-3 px-6 py-4 border-b ${
            evaluation.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              evaluation.isCorrect ? 'bg-emerald-600' : 'bg-rose-500'
            }`}>
              {evaluation.isCorrect
                ? <CheckCircle2 className="w-5 h-5 text-white" />
                : <XCircle className="w-5 h-5 text-white" />}
            </div>
            <div>
              <p className={`text-sm font-extrabold ${evaluation.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                {evaluation.feedbackTitle}
              </p>
              <p className="text-xs text-slate-500">PathFinder AI Evaluation</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* AI Feedback */}
            <div className={`p-4 rounded-2xl ${evaluation.isCorrect ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <p className="text-sm text-slate-700 leading-relaxed">{evaluation.feedbackBody}</p>
            </div>

            {/* Correct Answer Explanation */}
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" /> Why this answer is correct
              </p>
              <p className="text-sm text-indigo-900">{evaluation.correctExplanation}</p>
            </div>

            {/* Answer review */}
            <div className="space-y-2">
              {session.question.options.map((opt, idx) => {
                const isCorrect = idx === evaluation.correctIndex;
                const isSelected = idx === selectedAnswer;
                return (
                  <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border ${
                    isCorrect ? 'bg-emerald-50 border-emerald-200' :
                    isSelected && !isCorrect ? 'bg-rose-50 border-rose-200' :
                    'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isCorrect ? 'bg-emerald-500 text-white' :
                      isSelected && !isCorrect ? 'bg-rose-500 text-white' :
                      'bg-slate-300 text-slate-600'
                    }`}>
                      {isCorrect ? '✓' : String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-sm ${
                      isCorrect ? 'text-emerald-800 font-semibold' :
                      isSelected && !isCorrect ? 'text-rose-700 line-through' :
                      'text-slate-500'
                    }`}>{opt}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleCompleteSession}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Complete Session & Continue</span>
            </button>
          </div>
        </div>
      )}

      {/* ── PHASE: COMPLETE ── */}
      {phase === 'complete' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-indigo-200">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Session Complete! 🎉</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                You've finished the <strong>{session.skillName}</strong> learning session.
                Your progress has been saved and your roadmap is updated.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={loadSession}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Practice Again
              </button>
              <button
                onClick={handleNextConcept}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Next Concept</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
