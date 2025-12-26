"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo"; 

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next"); 

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Session Listener (Kept from your original code)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(nextUrl || '/dashboard');
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push(nextUrl || '/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [nextUrl, router]);

  // 2. Email/Password Auth Handler (Kept from your original code)
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
          options: { emailRedirectTo: `${origin}/auth/callback?next=${nextUrl || '/dashboard'}` },
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
        setLoading(false); 
      } 
      else if (view === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/reset-callback`,
        });
        if (error) throw error;
        setMessage('Password reset link sent! Check your email.');
        setView('login'); 
        setLoading(false);
      } 
      else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Listener handles the redirect, so we just wait
        router.push(nextUrl || '/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  // 3. 🟢 NEW: Google OAuth Handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=${nextUrl || '/dashboard'}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
        setErrorMsg(error.message);
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
        <div className="flex justify-center mb-8 select-none">
            <Logo className="h-16" /> 
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {view === 'signup' ? 'Create Account' : view === 'forgot' ? 'Reset Password' : 'Welcome Back'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    {view === 'signup' ? 'Start organizing your workspace.' : view === 'forgot' ? 'Enter your email to receive a reset link.' : 'Sign in to access your dashboard.'}
                </p>
            </div>

            {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2"><i className="fas fa-exclamation-circle"></i> {errorMsg}</div>}
            {message && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-center gap-2"><i className="fas fa-check-circle"></i> {message}</div>}

            <div className="space-y-5">
                
                {/* 🟢 NEW: Google Button (Only shown on Login/Signup, hidden on Forgot Password) */}
                {view !== 'forgot' && (
                    <>
                        <button 
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                        >
                            {/* Google Icon SVG */}
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                            <span>Continue with Google</span>
                        </button>
                        
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">Or</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>
                    </>
                )}

                {/* ORIGINAL FORM (Email/Password) */}
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
                      type="submit"
                      disabled={loading} 
                      className="bg-indigo-600 mt-2 rounded-xl px-4 py-3.5 text-white font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                    >
                        {loading ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mx-auto"></span> : (view === 'signup' ? 'Create Account' : view === 'forgot' ? 'Send Reset Link' : 'Sign In')}
                    </button>
                </form>

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