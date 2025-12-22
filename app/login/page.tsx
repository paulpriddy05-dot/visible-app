'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Initialize Supabase
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 🔵 NEW: Google Login Handler
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
          redirectTo: `${origin}/auth/update-password`,
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
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      
      {/* --- LEFT SIDE: BRANDING (Restored & Updated) --- */}
      <div className="hidden md:flex w-1/2 bg-slate-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-blue-600/20 z-0"></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-baseline gap-2 cursor-default select-none">
          <span className="font-serif text-3xl font-bold">V</span>
          <span className="font-bold text-xl tracking-tight opacity-90">Visible</span>
        </div>
        
        <div className="relative z-10 max-w-md">
           <h2 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">
             Tame your <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">digital chaos.</span>
           </h2>
           <p className="text-slate-400 text-lg leading-relaxed">
             "Visible changed how our team operates. We stopped searching for links and started actually working."
           </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500 uppercase tracking-widest font-bold">
          © {new Date().getFullYear()} Visible App
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative">
        {/* Mobile Header */}
        <Link href="/" className="md:hidden absolute top-8 left-8 flex items-baseline gap-1">
            <span className="font-serif text-2xl font-bold text-slate-900">V</span>
            <span className="font-bold text-lg text-slate-700">Visible</span>
        </Link>

        <div className="w-full max-w-sm space-y-8">
            <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {view === 'signup' ? 'Create Account' : view === 'forgot' ? 'Reset Password' : 'Welcome back'}
                </h2>
                <p className="text-slate-500 mt-2">
                  {view === 'signup' ? 'Start organizing your workspace today.' : view === 'forgot' ? 'We’ll send you a link to reset it.' : 'Sign in to access your workspace.'}
                </p>
            </div>

            {/* Notifications */}
            {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2"><i className="fas fa-exclamation-circle"></i> {errorMsg}</div>}
            {message && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-center gap-2"><i className="fas fa-check-circle"></i> {message}</div>}

            <div className="space-y-4">
                {/* 1. GOOGLE LOGIN BUTTON */}
                {view !== 'forgot' && (
                    <>
                        <button 
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                            <span>Continue with Google</span>
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold">Or use email</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>
                    </>
                )}

                {/* 2. EMAIL FORM */}
                <form onSubmit={handleAuth} className="flex flex-col w-full justify-center gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        className="w-full rounded-xl px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
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
                                <button type="button" onClick={() => { setView('forgot'); setMessage(''); setErrorMsg(''); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                    Forgot?
                                </button>
                            )}
                        </div>
                        <input 
                          type="password" 
                          required 
                          className="w-full rounded-xl px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
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
                        {loading ? 'Processing...' : (view === 'signup' ? 'Create Account' : view === 'forgot' ? 'Send Reset Link' : 'Sign In')}
                    </button>
                </form>
            </div>
            
            {/* Toggles */}
            <div className="text-center text-sm text-slate-500">
                {view === 'login' ? (
                  <p>Don't have an account? <button onClick={() => { setView('signup'); setMessage(''); setErrorMsg(''); }} className="text-indigo-600 hover:underline font-bold ml-1">Sign up free</button></p>
                ) : (
                  <button onClick={() => { setView('login'); setMessage(''); setErrorMsg(''); }} className="text-indigo-600 hover:underline font-bold flex items-center justify-center gap-2 w-full">
                      <i className="fas fa-arrow-left text-xs"></i> Back to Sign In
                  </button>
                )}
            </div>

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