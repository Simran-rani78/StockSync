import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const path = user.role === 'Admin' ? '/dashboard' : (user.role === 'Staff' ? '/inventory' : '/portal/customer');
      navigate(path);
    }
  }, [user, navigate]);

  // Check if redirected because session expired
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setError('Your session has expired. Please log in again.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const from = location.state?.from?.pathname;
      const storedUser = JSON.parse(localStorage.getItem('stocksync_user'));
      const role = storedUser?.role;
      const target = (from && from !== '/') 
        ? from 
        : (role === 'Admin' 
          ? '/dashboard' 
          : (role === 'Staff' ? '/inventory' : '/portal/customer'));
      navigate(target, { replace: true });
    } else {
      setError(result.error);
    }
  };


  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-950 px-4">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[25%] h-[350px] w-[350px] rounded-full bg-brand-500/10 blur-[80px]"></div>
        <div className="absolute bottom-[20%] right-[25%] h-[350px] w-[350px] rounded-full bg-teal-500/5 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="glass p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-800/80 bg-slate-900/40">
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 shadow-lg shadow-brand-500/20 mb-3">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Welcome Back</h1>
            <p className="text-sm text-slate-450 mt-1">Sign in to manage your B2B enterprise portal</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3.5 mb-5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stocksync.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/70 border border-slate-800 hover:border-slate-700 focus:border-brand-500 rounded-xl text-sm text-slate-200 outline-none transition duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/70 border border-slate-800 hover:border-slate-700 focus:border-brand-500 rounded-xl text-sm text-slate-200 outline-none transition duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white font-semibold text-sm rounded-xl transition duration-200 shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>


          <div className="mt-6 text-center">
            <span className="text-xs text-slate-450">Don't have an enterprise account? </span>
            <Link to="/register" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
