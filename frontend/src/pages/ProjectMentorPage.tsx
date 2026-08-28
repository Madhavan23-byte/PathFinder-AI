import React, { useState, useEffect, useRef } from 'react';
import {
  FolderGit2, CheckCircle2, Circle, ChevronRight, Sparkles,
  MessageSquare, Send, BrainCircuit, Clock, Zap, Trophy,
  Target, BookOpen, AlertCircle, Loader2, ArrowRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiService } from '../services/api';
import { Project } from '../types';

interface ChatMessage {
  role: 'user' | 'mentor';
  content: string;
  timestamp: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  Advanced: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const ProjectMentorPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const [milestoneSuccess, setMilestoneSuccess] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const data = await apiService.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const openProject = async (proj: Project) => {
    setIsLoadingProject(true);
    setSelectedProject(null);
    setChatMessages([]);
    try {
      const detail = await apiService.getProjectDetail(proj.id);
      setSelectedProject(detail);
      // Welcome message from AI mentor
      setChatMessages([{
        role: 'mentor',
        content: `Welcome to the **${detail.title}** project! I'm your AI Project Mentor.\n\n**Objective:** ${detail.objective}\n\nStart with **Milestone 1: ${detail.milestones[0]?.title || 'Getting started'}**. Let me know when you're ready, or ask me anything about this project!`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setIsLoadingProject(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    if (!selectedProject) return;
    setActiveMilestoneId(milestoneId);
    try {
      const result = await apiService.completeMilestone(selectedProject.id, milestoneId);
      setMilestoneSuccess(milestoneId);

      // Update local state
      setSelectedProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          milestones: prev.milestones.map(m =>
            m.id === milestoneId ? { ...m, completed: true } : m
          ),
          completionPercentage: result.completionPercentage,
        };
      });

      // Add mentor tip to chat
      if (result.aiMentorTip) {
        setChatMessages(prev => [...prev, {
          role: 'mentor',
          content: `✅ **Milestone completed!**\n\n${result.aiMentorTip}`,
          timestamp: new Date().toLocaleTimeString(),
        }]);
      }

      setTimeout(() => setMilestoneSuccess(null), 3000);
    } catch (err: any) {
      // Silently handle
    } finally {
      setActiveMilestoneId(null);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedProject || isChatSending) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatSending(true);

    try {
      const currentMilestone = selectedProject.milestones.find(m => !m.completed)?.id;
      const response = await apiService.sendProjectMentorChat(
        chatInput.trim(),
        selectedProject.id,
        currentMilestone,
      );

      setChatMessages(prev => [...prev, {
        role: 'mentor',
        content: response,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'mentor',
        content: "I'm having trouble connecting right now. Review the milestone requirements and try implementing step by step — you've got this!",
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setIsChatSending(false);
    }
  };

  // ── Project List View ──────────────────────────────────────────────────────
  if (!selectedProject && !isLoadingProject) {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Project-Based Learning</h1>
          <p className="text-slate-500 text-sm mt-1">Build real projects guided by your AI Mentor. Projects build portfolio evidence and accelerate career readiness.</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {isLoadingProjects ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-slate-500 text-sm">Loading your projects…</p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(proj => (
              <div
                key={proj.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                onClick={() => openProject(proj)}
              >
                {/* Status badge */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${DIFFICULTY_COLORS[proj.difficulty] || DIFFICULTY_COLORS.Intermediate}`}>
                      {proj.difficulty}
                    </div>
                    {proj.status === 'completed' && (
                      <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <Trophy className="w-3.5 h-3.5" /> Done
                      </div>
                    )}
                    {proj.status === 'in_progress' && (
                      <div className="flex items-center gap-1 text-indigo-600 text-xs font-bold">
                        <Zap className="w-3.5 h-3.5" /> In Progress
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{proj.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{proj.estimatedHours}h</div>
                    <div className="flex items-center gap-1"><Target className="w-3 h-3" />{proj.milestones?.length || 0} milestones</div>
                  </div>

                  {/* Progress bar */}
                  {(proj.completionPercentage ?? 0) > 0 && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-bold text-indigo-600">{proj.completionPercentage}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${proj.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {(proj.skillsUsed || []).slice(0, 3).map(sk => (
                      <span key={sk} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{sk}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 italic">{proj.portfolioValue?.slice(0, 50)}…</span>
                    <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Project Detail View ────────────────────────────────────────────────────
  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-500 text-sm">Loading project workspace…</p>
        </div>
      </div>
    );
  }

  const proj = selectedProject!;
  const completedCount = proj.milestones.filter(m => m.completed).length;
  const totalCount = proj.milestones.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => { setSelectedProject(null); loadProjects(); }}
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mb-2"
          >
            ← All Projects
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900">{proj.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${DIFFICULTY_COLORS[proj.difficulty]}`}>{proj.difficulty}</span>
            <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{proj.estimatedHours}h estimated</span>
          </div>
        </div>

        {/* Readiness indicator */}
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Project Completion</p>
          <p className="text-3xl font-black text-indigo-600">{completionPct}%</p>
          <p className="text-xs text-slate-400">{completedCount}/{totalCount} milestones</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700"
          style={{ width: `${completionPct}%` }}
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Left: Milestones + Info ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Objective */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Project Objective
            </p>
            <p className="text-sm text-indigo-900">{proj.objective}</p>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-500" /> Milestones
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {proj.milestones.map((m, idx) => (
                <div key={m.id} className={`flex items-start gap-3 p-4 ${m.completed ? 'bg-emerald-50/50' : ''}`}>
                  <button
                    onClick={() => !m.completed && handleCompleteMilestone(m.id)}
                    disabled={m.completed || activeMilestoneId === m.id}
                    className="mt-0.5 shrink-0 disabled:cursor-default"
                  >
                    {activeMilestoneId === m.id ? (
                      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    ) : m.completed || milestoneSuccess === m.id ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-400 transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${m.completed ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>
                      {idx + 1}. {m.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {m.estimatedHours}h
                    </p>
                  </div>
                  {!m.completed && (
                    <button
                      onClick={() => {
                        setChatMessages(prev => [...prev, {
                          role: 'user',
                          content: `I'm starting milestone ${idx + 1}: ${m.title}. Can you give me hints on how to approach it?`,
                          timestamp: new Date().toLocaleTimeString(),
                        }]);
                        handleSendChat();
                      }}
                      className="text-xs text-indigo-500 hover:underline shrink-0"
                    >
                      Get hint
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
            <p className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-purple-500" /> Evaluation Criteria
            </p>
            {proj.evaluationCriteria.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <ChevronRight className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                <span>{c}</span>
              </div>
            ))}
          </div>

          {/* Portfolio Value */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Portfolio Value
            </p>
            <p className="text-sm text-purple-900">{proj.portfolioValue}</p>
          </div>
        </div>

        {/* ── Right: AI Mentor Chat ── */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: '640px' }}>
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">AI Project Mentor</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-xs text-slate-500">Online — ready to guide you</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'mentor'
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {msg.role === 'mentor' ? <BrainCircuit className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                </div>
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`rounded-2xl p-3.5 text-sm leading-relaxed prose prose-sm max-w-none ${
                    msg.role === 'mentor'
                      ? 'bg-slate-50 border border-slate-200 rounded-tl-sm text-slate-800'
                      : 'bg-indigo-600 text-white rounded-tr-sm prose-invert'
                  }`}>
                    {msg.role === 'mentor'
                      ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                      : <p>{msg.content}</p>}
                  </div>
                  <p className="text-[10px] text-slate-400 px-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
            {isChatSending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm p-3.5">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-slate-100 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                placeholder="Ask the AI Mentor for help…"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-slate-50"
              />
              <button
                onClick={handleSendChat}
                disabled={!chatInput.trim() || isChatSending}
                className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                {isChatSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              AI Mentor gives hints and guidance — try to solve it yourself first!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
