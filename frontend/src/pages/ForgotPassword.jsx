import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Layers, Mail, Lock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // Common UI states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto clear alerts
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  // Request Link Submit handler
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await API.post('/forgot-password', { email });
      setSuccessMsg(response.data.message || 'Password recovery link logged to console.');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to request password recovery.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password submit handler
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await API.post('/reset-password', { token, password });
      setSuccessMsg(response.data.message || 'Password successfully updated!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid or expired recovery token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background visual effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[130px]"></div>
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Logo and Home header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/25">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">StockSync</span>
          </Link>
          <span className="text-[10px] font-bold text-brand-400 tracking-widest uppercase">
            {token ? 'RESET PASSWORD PORTAL' : 'RECOVERY SERVICE'}
          </span>
        </div>

        {/* Form Card */}
        <div className="glass p-8 rounded-3xl border border-slate-800/80 bg-slate-900/10 shadow-2xl relative">
          <h2 className="text-lg font-bold text-slate-100 mb-2">
            {token ? 'Set New Password' : 'Reset your password'}
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {token 
              ? 'Enter a strong, secure new password below to update your B2B account credentials.' 
              : 'Enter your email address and we will generate a dev portal link to update your credentials.'}
          </p>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-400 flex items-center gap-2.5 animate-fadeIn">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-450 flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              {successMsg}
            </div>
          )}

          {token ? (
            /* Reset Form */
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-650 hover:bg-brand-500 disabled:bg-brand-850 text-white text-xs font-bold rounded-xl transition duration-200 shadow shadow-brand-500/10 flex items-center justify-center"
              >
                {loading ? (
                  <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          ) : (
            /* Forgot Form */
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@stocksync.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-650 hover:bg-brand-500 disabled:bg-brand-850 text-white text-xs font-bold rounded-xl transition duration-200 shadow shadow-brand-500/10 flex items-center justify-center"
              >
                {loading ? (
                  <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {/* Links back */}
          <div className="mt-6 pt-6 border-t border-slate-850/50 flex items-center justify-between text-xs font-semibold">
            <Link to="/login" className="text-slate-450 hover:text-slate-200 flex items-center gap-1.5 transition">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
            <Link to="/" className="text-brand-400 hover:text-brand-350 transition">
              Visit Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
