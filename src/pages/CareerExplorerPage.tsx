import React, { useEffect, useState } from 'react';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { apiService } from '../services/api';
import { CareerRole } from '../types';

export const CareerExplorerPage: React.FC = () => {
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [activeRole, setActiveRole] = useState<string>('car_mle');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCareers = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getCareers();
      setCareers(data);
      if (data.length > 0) setActiveRole(data[0].id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load career comparison tracks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-3xl" />
          <div className="h-64 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 my-12">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-slate-900 font-sans">Unable to load career tracks</h2>
        <p className="text-xs text-slate-500">{errorMsg}</p>
        <button
          onClick={fetchCareers}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Career Explorer & What-If Simulator</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate switching career tracks without losing your existing verified skills or completed modules.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Non-Destructive Skill Mapping</span>
        </div>
      </div>

      {/* Career Comparison Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {careers.map((role) => {
          const isCurrentActive = role.id === activeRole;

          return (
            <div
              key={role.id}
              className={`p-6 rounded-3xl border transition-all space-y-5 flex flex-col justify-between ${
                isCurrentActive
                  ? 'bg-white border-indigo-600 shadow-xl ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-base text-slate-900">{role.title}</h3>
                  </div>

                  {isCurrentActive && (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                      Selected Target
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{role.description}</p>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Career Fit</span>
                    <span className="font-bold text-indigo-600 font-mono">{role.matchScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Readiness</span>
                    <span className="font-bold text-emerald-600 font-mono">{role.readinessScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Est. Time</span>
                    <span className="font-bold text-slate-900 font-mono">{role.estimatedMonths} mos</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Skill Match Breakdown:</span>
                  <div className="space-y-1.5 text-xs">
                    {(role.keySkills || []).slice(0, 4).map((sk, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 truncate">{sk.name}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400">Req: {sk.required}%</span>
                          <span className={sk.userProficiency >= sk.required ? 'text-emerald-600 font-bold' : 'text-amber-600 font-semibold'}>
                            You: {sk.userProficiency}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-mono">
                  {role.salaryRange} • {role.demandGrowth}
                </div>

                {!isCurrentActive ? (
                  <button
                    onClick={() => setActiveRole(role.id)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <span>Switch Target</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Selected
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
