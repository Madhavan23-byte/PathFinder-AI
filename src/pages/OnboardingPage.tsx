import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  User,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Clock,
  BookOpen,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useApp();

  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [education, setEducation] = useState('B.Tech Computer Science');
  const [currentRole, setCurrentRole] = useState('Senior Student / Aspiring ML Engineer');
  const [previousExp, setPreviousExp] = useState('Built basic Python scripts & SQL queries');

  const [selfSkills, setSelfSkills] = useState([
    { name: 'Python', level: 80 },
    { name: 'SQL', level: 70 },
    { name: 'Java', level: 50 },
    { name: 'Statistics', level: 40 },
  ]);
  const [newSkillName, setNewSkillName] = useState('');

  const [targetCareer, setTargetCareer] = useState('Machine Learning Engineer');
  const [timeline, setTimeline] = useState('3 Months');
  const [industry, setIndustry] = useState('AI & SaaS Tech');

  const [resourceTypes, setResourceTypes] = useState<string[]>([
    'Hands-on practice',
    'Visual explanations',
    'Projects',
  ]);

  const [weeklyHours, setWeeklyHours] = useState(10);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Thu', 'Sat', 'Sun']);

  const steps = [
    { num: 1, title: 'Profile' },
    { num: 2, title: 'Skills' },
    { num: 3, title: 'Career' },
    { num: 4, title: 'Preferences' },
    { num: 5, title: 'Availability' },
    { num: 6, title: 'Assessment' },
  ];

  const toggleResourceType = (type: string) => {
    setResourceTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSelfSkills([...selfSkills, { name: newSkillName.trim(), level: 50 }]);
    setNewSkillName('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-8 relative">
      <div className="w-full max-w-3xl bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Learner Profile Setup</h1>
              <p className="text-xs text-slate-400">Step {currentStep} of 6 — PathFinder Adaptive Engine</p>
            </div>
          </div>

          <span className="text-xs font-semibold text-indigo-400 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
            {Math.round((currentStep / 6) * 100)}% Completed
          </span>
        </div>

        {/* Progress Step Indicator */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-1 min-w-[60px] flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s.num === currentStep
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                    : s.num < currentStep
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {s.num < currentStep ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-[10px] font-medium ${s.num === currentStep ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content Panels */}
        <div className="min-h-[300px] flex flex-col justify-center">
          {/* STEP 1: Basic Profile */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                <span>Tell us about your background</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Education</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Role / Student Status</label>
                  <input
                    type="text"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Previous Learning Experience</label>
                  <textarea
                    rows={3}
                    value={previousExp}
                    onChange={(e) => setPreviousExp(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Existing Skills */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span>Self-Declared Skills</span>
                </h2>
                <p className="text-xs text-amber-400 mt-1 flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Important: Self-declared skills will be verified through diagnostic assessment.</span>
                </p>
              </div>

              <div className="space-y-3">
                {selfSkills.map((sk, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-slate-200 min-w-[100px]">{sk.name}</span>
                    <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full" style={{ width: `${sk.level}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-indigo-400 font-mono">{sk.level}%</span>
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add another skill (e.g. PyTorch, Docker)"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Career Goal */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <span>Target Career Goal</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Machine Learning Engineer',
                  'Data Scientist',
                  'AI Engineer',
                  'Full Stack Developer',
                  'Software Engineer',
                  'Data Analyst',
                  'Cybersecurity Engineer',
                ].map((career) => (
                  <div
                    key={career}
                    onClick={() => setTargetCareer(career)}
                    className={`p-4 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                      targetCareer === career
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {career}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Timeline</label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option>1 Month (Intensive)</option>
                    <option>3 Months (Standard)</option>
                    <option>6 Months (Balanced)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Industry Preference (Optional)</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Learning Preferences */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span>Preferred Learning Resource Formats</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Note: These represent resource format preferences, not static learning styles.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  'Hands-on practice',
                  'Visual explanations',
                  'Projects',
                  'Video lessons',
                  'Text guides',
                  'Quizzes',
                ].map((type) => (
                  <div
                    key={type}
                    onClick={() => toggleResourceType(type)}
                    className={`p-4 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                      resourceTypes.includes(type)
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>{type}</span>
                    {resourceTypes.includes(type) && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Availability */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>Weekly Study Availability</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                    <span>Weekly Availability:</span>
                    <span className="text-indigo-400 font-mono">{weeklyHours} hours / week</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">Preferred Study Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedDays.includes(day)
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Start Assessment */}
          {currentStep === 6 && (
            <div className="text-center space-y-6 animate-in fade-in duration-200 py-6">
              <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-2xl font-extrabold text-white">Your Learner Profile is Ready!</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Next, take the 12-question Adaptive Diagnostic Test. The difficulty will dynamically scale based on your accuracy to establish your initial Learner Model baseline.
                </p>
              </div>

              <button
                onClick={() => navigate('/assessment')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Start Adaptive Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        {currentStep < 6 && (
          <div className="flex items-center justify-between border-t border-slate-700/80 pt-6">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 6))}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
