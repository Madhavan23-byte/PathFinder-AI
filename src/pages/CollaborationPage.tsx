import React, { useState } from 'react';
import { Users, Sparkles, Target, CheckCircle2, MessageSquare, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockStudyPartners } from '../services/mockData';

export const CollaborationPage: React.FC = () => {
  const { profile } = useApp();
  const [requestedPartners, setRequestedPartners] = useState<string[]>([]);

  const handleStudyRequest = (id: string) => {
    setRequestedPartners((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recommended Study Partners</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            AI peer matchmaker finding partners with shared career goals and complementary skill strengths.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Complementary Skill Matching</span>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {mockStudyPartners.map((partner) => {
          const isRequested = requestedPartners.includes(partner.id);

          return (
            <div
              key={partner.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{partner.name}</h3>
                    <p className="text-xs text-indigo-600 font-semibold">{partner.role}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Peer Compatibility:</span>
                  <span className="text-sm font-extrabold text-indigo-600 font-mono">
                    {partner.matchPercentage}% Match
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Shared Goal:</span>
                    <span className="font-bold text-slate-900">{partner.targetCareer}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Current Focus:</span>
                    <span className="font-bold text-purple-600">{partner.currentFocus}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    Complementary Strengths:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {partner.complementarySkills.map((sk, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium"
                      >
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                {!isRequested ? (
                  <button
                    onClick={() => handleStudyRequest(partner.id)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Study Together</span>
                  </button>
                ) : (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Invitation Sent</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
