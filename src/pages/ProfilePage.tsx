import React, { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Save, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { LearnerProfile } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [name, setName] = useState('');
  const [education, setEducation] = useState('');
  const [targetCareer, setTargetCareer] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(10);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getProfile();
      setProfile(data);
      setName(data.user?.name || user?.name || '');
      setEducation(data.user?.education || '');
      setTargetCareer(data.user?.targetCareer || '');
      setWeeklyHours(data.availability?.weeklyHours || 10);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
      await apiService.updateProfile({
        user: {
          id: user?.id || '',
          email: user?.email || '',
          name,
          education,
          targetCareer,
        },
        availability: {
          weeklyHours,
          preferredDays: profile?.availability?.preferredDays || [],
          targetCompletionDate: profile?.availability?.targetCompletionDate || '',
        },
      });
      setSavedNotice(true);
      await refreshUser();
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-600 flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Learner Profile</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage your account information and target career settings.</p>
        </div>

        {savedNotice && (
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile updated successfully.</span>
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Form Card */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=4F46E5&color=fff`}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-md"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900">{name || user?.name}</h2>
            <p className="text-xs text-indigo-600 font-semibold">{user?.email}</p>
            <span className="text-[10px] text-slate-400 font-mono">User ID: {user?.id}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/40"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Education Background</label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/40"
              disabled={isSaving}
              placeholder="e.g. B.Tech Computer Science"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Career Goal</label>
            <input
              type="text"
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/40"
              disabled={isSaving}
              placeholder="e.g. Machine Learning Engineer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Weekly Availability (Hours)</label>
            <input
              type="number"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/40"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Updates</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
