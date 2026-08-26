import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  PlayCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BrainCircuit,
  Target,
  RefreshCw,
  Award,
  Zap,
  HelpCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DemoModePage: React.FC = () => {
  const { demoStep, nextDemoStep, prevDemoStep, setDemoStep } = useApp();

  const demoStepsList = [
    {
      step: 1,
      title: '1. Learner Profile Ingestion',
      subtitle: 'Target Career: Machine Learning Engineer | Self-Declared Skills: Python (80%), SQL (70%), Stats (40%)',
      keyConcept: 'Self-declared skills are registered as baseline hypotheses to be verified.',
      path: '/onboarding',
    },
    {
      step: 2,
      title: '2. Adaptive Diagnostic Assessment',
      subtitle: '12-Question Quiz with Live Difficulty Scaling',
      keyConcept: 'System dynamically adjusts question difficulty (Easy → Intermediate → Advanced) based on response accuracy.',
      path: '/assessment',
    },
    {
      step: 3,
      title: '3. 6D Learner Model Calibration',
      subtitle: 'Knowledge (68%), Ability (78%), Pace (Optimal), Behavior (92%), Preferences, Goals',
      keyConcept: 'Combines quiz signals into a holistic multi-dimensional intelligence model.',
      path: '/learner-model',
    },
    {
      step: 4,
      title: '4. Skill Gap Matrix & Knowledge Graph',
      subtitle: 'Identified Critical Gap: Model Evaluation & Tuning (30% vs 80% Required)',
      keyConcept: 'Highlights prerequisite dependencies and calculates priority skill gap urgency.',
      path: '/skill-gaps',
    },
    {
      step: 5,
      title: '5. Explainable AI Recommendation Engine',
      subtitle: 'Recommended Topic: Decision Trees & ROC-AUC Evaluation',
      keyConcept: 'Clicking "Why am I seeing this?" exposes exact skill gap drivers and prerequisite checks.',
      path: '/recommendations',
    },
    {
      step: 6,
      title: '6. Structured Learning Workspace',
      subtitle: 'Content Module + PathFinder AI Assistant Sidekick',
      keyConcept: 'Maintains structured modular path while AI assistant answers contextual questions on demand.',
      path: '/learn',
    },
    {
      step: 7,
      title: '7. Diagnostic Practice & Assessment',
      subtitle: 'User attempts question on Confusion Matrix Precision calculation',
      keyConcept: 'Evaluates empirical performance under real-time conditions.',
      path: '/practice',
    },
    {
      step: 8,
      title: '8. Granular Root Cause Analysis',
      subtitle: 'Diagnosis: Concept Understanding ✓, Formula Selection ✓, Algebraic Step ✕',
      keyConcept: 'Pinpoints exact error mechanics rather than showing generic "Wrong answer" feedback.',
      path: '/practice',
    },
    {
      step: 9,
      title: '9. Adaptive Workload & Reinforcement Support',
      subtitle: 'Non-shaming schedule adjust prompt + Targeted algebra reinforcement',
      keyConcept: 'System supports learner pace without negative penalties or shaming language.',
      path: '/progress',
    },
    {
      step: 10,
      title: '10. Live Roadmap Recalculation',
      subtitle: 'Roadmap Re-Sequenced: Model Evaluation Moved Ahead of Deep Learning',
      keyConcept: 'Proves the central thesis: "The system changes because YOU change."',
      path: '/roadmap',
    },
  ];

  const currentStepObj = demoStepsList.find((s) => s.step === demoStep) || demoStepsList[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-purple-800/60 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <PlayCircle className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Hackathon Judge Guided Demo Mode</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Demonstrating the Adaptive AI Learning Loop
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Step through the 10-phase demonstration proving how PathFinder observes performance and adapts the user's career path in real time.
            </p>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-purple-500/40 text-center shrink-0">
            <span className="text-[10px] text-purple-300 font-bold block uppercase">Current Demo Stage</span>
            <span className="text-2xl font-black text-white font-mono">{demoStep} / 10</span>
          </div>
        </div>
      </div>

      {/* BEFORE / AFTER Transformation Visualizer Box */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <span>The Core Hackathon Proof: Before vs After Adaptation</span>
          </h3>
          <span className="text-xs text-emerald-400 font-mono">Live Simulation</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* BEFORE CARD */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-0.5 rounded bg-slate-800">
              BEFORE (Initial Hypothesis)
            </span>
            <h4 className="text-sm font-bold text-slate-200">Machine Learning Fundamentals → Next</h4>
            <p className="text-xs text-slate-400">Standard static roadmap sequence based on self-declared background.</p>
          </div>

          {/* AFTER CARD */}
          <div className="p-5 rounded-2xl bg-indigo-950/80 border border-indigo-500/60 space-y-3 shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 px-2.5 py-0.5 rounded bg-indigo-900 border border-indigo-700">
              AFTER (Adaptive AI Observation)
            </span>
            <h4 className="text-sm font-bold text-white">Model Evaluation Reinforcement → Prioritized</h4>
            <p className="text-xs text-indigo-200">
              Diagnostic test flagged confusion matrix weakness → Roadmap automatically re-ordered Model Evaluation ahead of Deep Learning.
            </p>
          </div>
        </div>
      </div>

      {/* Active Demo Step Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Step {currentStepObj.step} of 10
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{currentStepObj.title}</h2>
          </div>

          <NavLink
            to={currentStepObj.path}
            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs border border-purple-200 flex items-center gap-1.5"
          >
            <span>Jump to UI Screen ({currentStepObj.path})</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">{currentStepObj.subtitle}</p>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 space-y-1">
          <span className="font-bold block">💡 Key Product Mechanism:</span>
          <p>{currentConcept(currentStepObj.keyConcept)}</p>
        </div>

        {/* Step Timeline Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {demoStepsList.map((s) => (
            <button
              key={s.step}
              onClick={() => setDemoStep(s.step)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                s.step === demoStep
                  ? 'bg-indigo-600 text-white shadow-md'
                  : s.step < demoStep
                  ? 'bg-slate-100 text-emerald-700 border border-slate-200'
                  : 'bg-slate-50 text-slate-400 border border-slate-200'
              }`}
            >
              Step {s.step}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={prevDemoStep}
            disabled={demoStep === 1}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 disabled:opacity-30 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <button
            onClick={nextDemoStep}
            disabled={demoStep === 10}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-30 flex items-center gap-1.5"
          >
            <span>Next Demo Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function currentConcept(text: string) {
  return text;
}
