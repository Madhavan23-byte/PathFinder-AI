import React, { useEffect, useState } from 'react';
import { Users, Sparkles, MessageSquare, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import { StudyPartner } from '../types';

export const CollaborationPage: React.FC = () => {
  const [partners, setPartners] = useState<StudyPartner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [requestedPartners, setRequestedPartners] = useState<string[]>([]);

  const fetchPartners = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getPartners();
      setPartners(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load study partner suggestions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleStudyRequest = (id: string) => {
    setRequestedPartners((prev) => [...prev, id]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Unable to load study partners</h2>
        <p className="text-xs text-slate-500">{errorMsg}</p>
        <button
          onClick={fetchPartners}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-slate-900">No study partners matched yet</h2>
          <p className="text-xs text-slate-500">
            We'll suggest potential collaborators as your learning profile develops.
          </p>
        </div>
      </div>
    );
  }

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
        {partners.map((partner) => {
          const isRequested = requestedPartners.includes(partner.id);

          return (
            <div
              key={partner.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=4F46E5&color=fff`}
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
                    {(partner.complementarySkills || []).map((sk, i) => (
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
