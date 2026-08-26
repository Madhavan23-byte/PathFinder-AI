import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Code2,
  Sparkles,
  Send,
  HelpCircle,
  PlayCircle,
  FileText,
  Target,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { apiService } from '../services/api';

export const LearnPage: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState('mod_eval');
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'ai'; text: string }[]
  >([
    {
      sender: 'ai',
      text: 'Hello! I am your PathFinder AI learning assistant. Ask me to explain concepts differently, simplify math formulas, or provide code examples!',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const modules = [
    { id: 'mod_py', title: '1. Python Data Structures', status: 'completed' },
    { id: 'mod_sql', title: '2. SQL Window Functions', status: 'completed' },
    { id: 'mod_stats', title: '3. Hypothesis Testing & P-Values', status: 'completed' },
    { id: 'mod_eval', title: '4. Model Evaluation & Confusion Matrix', status: 'active' },
    { id: 'mod_rf', title: '5. Random Forests & Ensembles', status: 'locked' },
    { id: 'mod_dl', title: '6. Neural Network Backpropagation', status: 'locked' },
  ];

  const handleSendMessage = async (customMsg?: string) => {
    const textToSend = customMsg || inputMessage;
    if (!textToSend.trim()) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    if (!customMsg) setInputMessage('');
    setIsTyping(true);

    try {
      const response = await apiService.sendAIChat(textToSend);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: response }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-7rem)] min-h-[600px] overflow-hidden pb-4">
      {/* LEFT PANEL: Course & Module Navigation (3 cols) */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 space-y-4 overflow-y-auto flex flex-col justify-between shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Machine Learning Path</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Phase 4: Model Optimization</p>
          </div>

          <div className="space-y-1.5">
            {modules.map((m) => (
              <div
                key={m.id}
                onClick={() => m.status !== 'locked' && setActiveModuleId(m.id)}
                className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                  m.id === activeModuleId
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : m.status === 'completed'
                    ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                <span className="truncate">{m.title}</span>
                {m.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        <NavLink
          to="/practice"
          className="w-full py-3 rounded-xl bg-purple-950 text-purple-200 border border-purple-800 text-xs font-bold flex items-center justify-center gap-2 hover:bg-purple-900 transition-colors"
        >
          <Target className="w-4 h-4 text-purple-400" />
          <span>Launch Practice Session</span>
        </NavLink>
      </div>

      {/* CENTER PANEL: Structured Learning Content (6 cols) */}
      <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 overflow-y-auto shadow-sm">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-100">
            Current Module: Model Evaluation
          </span>
          <h1 className="text-xl font-bold text-slate-900">Understanding Precision, Recall & ROC-AUC</h1>
        </div>

        {/* Text Content */}
        <div className="prose prose-slate prose-sm space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            When building binary classification models for real-world scenarios (such as disease diagnosis or credit card fraud detection), evaluating raw classification accuracy is often misleading.
          </p>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Key Concept Breakdown</span>
            </h4>
            <ul className="space-y-1 text-xs text-indigo-900">
              <li>• <strong>Precision:</strong> Out of all predicted positive cases, how many were actually positive? (TP / (TP + FP))</li>
              <li>• <strong>Recall (Sensitivity):</strong> Out of all actual positive cases, how many did the model catch? (TP / (TP + FN))</li>
            </ul>
          </div>

          <h3 className="font-bold text-slate-900 text-sm pt-2">Python Implementation Example</h3>

          {/* Code Snippet Box */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" /> evaluation_metrics.py
              </span>
              <span>Python 3.10</span>
            </div>
            <pre className="text-indigo-300">
{`from sklearn.metrics import classification_report, confusion_matrix

# True targets vs Model predictions
y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0]
y_pred = [1, 0, 1, 0, 0, 1, 0, 1, 1, 0]

print("Confusion Matrix:")
print(confusion_matrix(y_true, y_pred))

print("\\nClassification Metrics Report:")
print(classification_report(y_true, y_pred))`}</pre>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => handleSendMessage('Explain Precision vs Recall using a real-world medical analogy.')}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Explain with Analogy</span>
          </button>

          <NavLink
            to="/practice"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
          >
            <span>Take Module Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </div>

      {/* RIGHT PANEL: PathFinder AI Learning Assistant (3 cols) */}
      <div className="lg:col-span-3 bg-slate-900 text-white rounded-2xl p-4 flex flex-col justify-between shadow-xl border border-slate-800 overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-white">PathFinder AI Sidekick</h3>
            <span className="text-[10px] text-purple-400">Contextual Learning Assistant</span>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="py-2 flex flex-wrap gap-1.5">
          {[
            'Explain differently',
            'Give an example',
            'Simplify',
            'Show visual explanation',
          ].map((act, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(act)}
              className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {act}
            </button>
          ))}
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2 text-xs">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl max-w-[90%] ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white ml-auto'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              <pre className="font-sans whitespace-pre-wrap">{msg.text}</pre>
            </div>
          ))}
          {isTyping && <div className="text-[10px] text-indigo-400 animate-pulse">AI is thinking...</div>}
        </div>

        {/* Input Bar */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask AI assistant..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
            <button
              onClick={() => handleSendMessage()}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
