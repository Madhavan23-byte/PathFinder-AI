import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  ArrowRight,
  Target,
  Zap,
  Award,
  CheckCircle2,
  Activity,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                PathFinder
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-indigo-400">
                Adaptive AI Navigator
              </span>
            </div>
          </NavLink>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#adaptive-loop" className="hover:text-white transition-colors">Adaptive AI</a>
            <a href="#credentials" className="hover:text-white transition-colors">Badges</a>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/login"
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Log In
            </NavLink>
            <NavLink
              to="/signup"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all"
            >
              Start Free
            </NavLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 lg:px-12 overflow-hidden">
        {/* Glow Backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Beyond Static Roadmaps — Continuously Adaptive Learning</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your Career Path Should{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
              Adapt to You.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            PathFinder builds a dynamic learner model across knowledge, pace, behavior, and goals — continuously personalizing what you learn, how you learn, and how fast you progress.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <NavLink
              to="/signup"
              className="px-7 py-3.5 text-sm font-bold rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>

            <NavLink
              to="/login"
              className="px-7 py-3.5 text-sm font-bold rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-purple-500/50 hover:text-white shadow-lg transition-all flex items-center gap-2"
            >
              <span>Sign In to Account</span>
            </NavLink>
          </div>

          {/* Adaptive Loop Diagram */}
          <div id="adaptive-loop" className="pt-12">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-200">The 12-Step Continuous Adaptation Cycle</span>
                </div>
                <span className="text-xs text-indigo-400 font-mono">Live Loop</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-left">
                {[
                  { step: '1', name: 'Goals', desc: 'Career Target' },
                  { step: '2', name: 'Assess', desc: 'Diagnostic Quiz' },
                  { step: '3', name: 'Model', desc: '6D Profiling' },
                  { step: '4', name: 'Gaps', desc: 'Skill Prioritization' },
                  { step: '5', name: 'Personalize', desc: 'Explainable AI' },
                  { step: '6', name: 'Roadmap', desc: 'Dynamic Sequencing' },
                  { step: '7', name: 'Learn', desc: 'Structured Content' },
                  { step: '8', name: 'Practice', desc: 'Root Cause Feedback' },
                  { step: '9', name: 'Observe', desc: 'Rhythm Analytics' },
                  { step: '10', name: 'Adapt', desc: 'Live Recalculation' },
                  { step: '11', name: 'Support', desc: 'Non-Shame Workload' },
                  { step: '12', name: 'Measure', desc: 'Verified Mastery' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all group"
                  >
                    <div className="text-[10px] font-mono text-indigo-400 font-bold mb-1">
                      STEP {item.step}
                    </div>
                    <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Core Differentiation
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Why PathFinder is Not Another Static LMS
            </h2>
            <p className="text-slate-400 text-sm">
              Generic course marketplaces force every student down the exact same linear path. PathFinder dynamically evolves as you answer diagnostic questions and complete practice modules.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Dynamic 6D Learner Model</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tracks Knowledge, Ability, Pace, Behavior, Resource Preferences, and Career Goals instead of relying on basic course completion percentages.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Explainable AI Recommendations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every recommended topic includes a visible "Why am I seeing this?" button breaking down exact skill gap signals and prerequisite readiness.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Root Cause Practice Diagnosis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you make a mistake, PathFinder pinpoints whether it was concept misunderstanding, formula misapplication, or algebra error.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-slate-950 border-t border-slate-800 text-center space-y-6">
        <h3 className="text-2xl font-bold text-white">Ready to Experience Truly Adaptive AI Learning?</h3>
        <div className="flex justify-center gap-4">
          <NavLink
            to="/signup"
            className="px-6 py-3 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            Create Account
          </NavLink>
        </div>
        <p className="text-xs text-slate-500">PathFinder © 2026. Powered by FastAPI + MongoDB.</p>
      </footer>
    </div>
  );
};
