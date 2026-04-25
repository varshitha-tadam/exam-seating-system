import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  Mail, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  UserCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password', {
        style: { background: '#ef4444', color: '#fff' }
      });
      return;
    }
    setLoading(true);
    
    // Simulate network delay for premium feel
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`, {
          icon: '👋',
          style: { background: '#10b981', color: '#fff' }
        });
        navigate('/');
      } else {
        toast.error(result.message);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-600 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-30 animate-pulse" />
          <div className="grid grid-cols-8 gap-4 p-8">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white/10 rounded-lg blur-[1px]" />
            ))}
          </div>
        </div>
        
        <div className="relative z-10 p-12 text-center text-white">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl mb-8 shadow-2xl"
          >
            <CalendarDays className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl font-extrabold tracking-tight mb-6"
          >
            Smart<span className="text-primary-200">Table</span>
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl text-primary-100 max-w-md mx-auto leading-relaxed"
          >
            The most advanced and intelligent academic scheduling and seating management system for modern institutions.
          </motion.p>
        </div>
        
        {/* Animated Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <CalendarDays className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold dark:text-white">SmartTable</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500 text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-11 pr-4 py-4 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <button type="button" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">Forgot Password?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500 text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-12 py-4 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white transition-all outline-none"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:animate-shimmer" />
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-lg">Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              New to our platform?{' '}
              <Link to="/signup" className="text-primary-600 font-bold hover:underline transition-all underline-offset-4">Create Account</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Add shimmer animation to Tailwind if needed, but since I'm using Tailwind v4 I'll rely on the theme config if I added it or just standard classes
const UsersRound = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 21a6 6 0 0 0-12 0"/><circle cx="12" cy="9" r="6"/><path d="M22 21a6 6 0 0 0-5.94-6"/><path d="M2 21a6 6 0 0 1 5.94-6"/><circle cx="18" cy="11" r="4"/><circle cx="6" cy="11" r="4"/></svg>
);

export default Login;
