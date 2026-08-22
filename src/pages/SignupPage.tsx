import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Validation Rules
  const nameValid = name.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordValid = hasMinLen && hasUpper && hasLower && hasNumber;
  const confirmMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!nameValid) {
      setApiError('Full Name must be at least 2 characters.');
      return;
    }
    if (!emailValid) {
      setApiError('Please enter a valid email address.');
      return;
    }
    if (!passwordValid) {
      setApiError('Password must contain at least 8 characters, including uppercase, lowercase, and numbers.');
      return;
    }
    if (!confirmMatch) {
      setApiError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setApiError('You must agree to the Terms and Privacy Policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigate('/onboarding');
    } catch (err: any) {
      setApiError(err.message || 'Account registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <NavLink to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">PathFinder</span>
          </NavLink>
          <h1 className="text-lg font-bold text-slate-100">Create Account</h1>
          <p className="text-xs text-slate-400">Start your personalized adaptive career path</p>
        </div>

        {apiError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
            </div>
            {name.length > 0 && !nameValid && (
              <p className="text-[10px] text-rose-400 mt-1">Name must be at least 2 characters.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
            </div>
            {email.length > 0 && !emailValid && (
              <p className="text-[10px] text-rose-400 mt-1">Please enter a valid email format.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="Create a password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Validation Checklist */}
            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-1 pt-2 text-[10px]">
                <span className={hasMinLen ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {hasMinLen ? '✓' : '○'} Min 8 characters
                </span>
                <span className={hasUpper ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {hasUpper ? '✓' : '○'} Uppercase letter
                </span>
                <span className={hasLower ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {hasLower ? '✓' : '○'} Lowercase letter
                </span>
                <span className={hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {hasNumber ? '✓' : '○'} At least one number
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="Confirm your password"
                disabled={isSubmitting}
              />
            </div>
            {confirmPassword.length > 0 && !confirmMatch && (
              <p className="text-[10px] text-rose-400 mt-1">Passwords do not match.</p>
            )}
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400 pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <span>I agree to the Terms and Privacy Policy</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <NavLink to="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
};
