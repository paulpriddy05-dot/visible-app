"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase"; // Using your singleton client
import { useRouter } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Google Login Handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) {
        setErrorMsg("Google Login Error: " + error.message);
        setLoading(false);
    }
  };

  // 2. Email/Password Handler (Sign Up, Sign In, Reset)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMsg('');

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    try {
      if (view === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } 
      else if (view === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          // 🔴 WRONG (Skips login): 
          // redirectTo: `${origin}/auth/update-password`,
          
          // 🟢 CORRECT (Logs in -> Redirects):
          redirectTo: `${origin}/auth/callback?next=/update-password`, 
        });
        if (error) throw error;
        setMessage('Password reset link sent! Check your email.');
        setView('login'); 
      }
      else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="z-10 w-full max-w-md px-6">
        
        {/* LOGO */}
        <div className="flex items-baseline justify-center gap-2 mb-8 select-none">
            <span className="font-serif text-5xl font-bold text-slate-900 leading-none">V</span>
            <span className="text-2xl font-bold text-slate-700 tracking-tight">Visible</span>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 relative overflow-hidden">
            {/* Top Border Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {view === 'signup' ? 'Create Account' : view === 'forgot' ? 'Reset Password' : 'Welcome Back'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    {view === 'signup' ? 'Start organizing your workspace.' : view === 'forgot' ? 'Enter your email to receive a reset link.' : 'Sign in to access your dashboard.'}
                </p>
            </div>

            {/* Alerts */}
            {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2"><i className="fas fa-exclamation-circle"></i> {errorMsg}</div>}
            {message && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-center gap-2"><i className="fas fa-check-circle"></i> {message}</div>}

            <div className="space-y-5">
                
                {/* 1. GOOGLE LOGIN (Only show on Login/Signup views) */}
                {view !== 'forgot' && (
                    <>
                        <button 
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group disabled:opacity-50"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                            <span>Continue with Google</span>
                        </button>

                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-slate-100"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-300 text-[10px] uppercase font-bold tracking-wider">Or continue with email</span>
                            <div className="flex-grow border-t border-slate-100"></div>
                        </div>
                    </>
                )}

                {/* 2. EMAIL FORM */}
                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
                        <input 
                            type="email" 
                            required 
                            className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
                            placeholder="you@example.com"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>

                    {view !== 'forgot' && (
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
                            {view === 'login' && (
                                <button type="button" onClick={() => { setView('forgot'); setMessage(''); setErrorMsg(''); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
                                    Forgot?
                                </button>
                            )}
                        </div>
                        <input 
                          type="password" 
                          required 
                          className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
                          placeholder="••••••••"
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                        />
                      </div>
                    )}
                    
                    <button 
                      disabled={loading} 
                      className="bg-indigo-600 mt-2 rounded-xl px-4 py-3.5 text-white font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                    >
                        {loading ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mx-auto"></span> : (view === 'signup' ? 'Create Account' : view === 'forgot' ? 'Send Reset Link' : 'Sign In')}
                    </button>
                </form>

                {/* Toggles */}
                <div className="text-center text-sm text-slate-500 pt-2">
                    {view === 'login' ? (
                        <p>Don't have an account? <button onClick={() => { setView('signup'); setMessage(''); setErrorMsg(''); }} className="text-indigo-600 hover:text-indigo-800 font-bold ml-1 hover:underline">Sign up</button></p>
                    ) : (
                        <button onClick={() => { setView('login'); setMessage(''); setErrorMsg(''); }} className="text-slate-400 hover:text-slate-600 font-bold flex items-center justify-center gap-2 w-full transition-colors">
                            <i className="fas fa-arrow-left text-xs"></i> Back to Sign In
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Home Link */}
        <div className="text-center mt-8">
            <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
                Back to Home
            </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}