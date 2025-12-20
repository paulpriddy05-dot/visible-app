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
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      
      {/* --- LEFT SIDE: BRANDING --- */}
      <div className="hidden md:flex w-1/2 bg-slate-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-blue-600/20 z-0"></div>
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">V</div>
          <span className="font-bold text-xl tracking-tight">Visible</span>
        </div>
        
        <div className="relative z-10 max-w-md">
           <h2 className="text-4xl font-bold mb-6">Tame your digital chaos.</h2>
           <p className="text-slate-400 text-lg leading-relaxed">
             "Visible changed how our team operates. We stopped searching for links and started actually working."
           </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Visible App
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
            <div className="text-center md:text-left">
                {/* Mobile Logo Link */}
                <Link href="/" className="md:hidden flex items-center justify-center gap-2 mb-8">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
                    <span className="font-bold text-xl text-slate-900">Visible</span>
                </Link>

                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {view === 'signup' ? 'Create Account' : view === 'forgot' ? 'Reset Password' : 'Welcome back'}
                </h2>
                <p className="text-slate-500 mt-2">
                  {view === 'signup' ? 'Start organizing your workspace today.' : view === 'forgot' ? 'We’ll send you a link to reset it.' : 'Sign in to access your workspace.'}
                </p>
            </div>

            {/* Notifications */}
            {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{errorMsg}</div>}
            {message && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">{message}</div>}

            <form onSubmit={handleAuth} className="flex flex-col w-full justify-center gap-4">
                
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full rounded-lg px-4 py-2 bg-white border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="you@example.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>

                {/* Password Field (Hidden for Forgot Password) */}
                {view !== 'forgot' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input 
                      type="password" 
                      required 
                      className="w-full rounded-lg px-4 py-2 bg-white border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="••••••••"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                    />
                  </div>
                )}
                
                {/* Main Action Button */}
                <button 
                  disabled={loading} 
                  className="bg-indigo-600 mt-2 rounded-lg px-4 py-3 text-white font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : (view === 'signup' ? 'Sign Up' : view === 'forgot' ? 'Send Reset Link' : 'Sign In')}
                </button>
                
                {/* Toggles */}
                <div className="flex justify-between text-sm mt-2 text-slate-500">
                    {view === 'login' ? (
                      <>
                        <button type="button" onClick={() => { setView('signup'); setMessage(''); setErrorMsg(''); }} className="text-indigo-600 hover:underline font-medium">Create an account</button>
                        <button type="button" onClick={() => { setView('forgot'); setMessage(''); setErrorMsg(''); }} className="hover:text-slate-700">Forgot password?</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => { setView('login'); setMessage(''); setErrorMsg(''); }} className="text-indigo-600 hover:underline font-medium w-full text-center">Back to Sign In</button>
                    )}
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}