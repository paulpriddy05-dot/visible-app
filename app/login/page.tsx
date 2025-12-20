'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

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
        // This triggers the email, which redirects to /auth/callback, 
        // which then redirects to /auth/update-password
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">
          {view === 'signup' ? 'Create Account' : view === 'forgot' ? 'Reset Password' : 'Welcome Back'}
        </h1>
        
        {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{errorMsg}</div>}
        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">{message}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" required 
              className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={email} onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          {view !== 'forgot' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" required 
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={password} onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          )}

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg">
            {loading ? 'Processing...' : (view === 'signup' ? 'Sign Up' : view === 'forgot' ? 'Send Link' : 'Login')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 space-x-2">
          {view === 'login' && (
            <>
              <button onClick={() => setView('signup')} className="text-blue-600 hover:underline">Sign Up</button>
              <span>|</span>
              <button onClick={() => setView('forgot')} className="text-blue-600 hover:underline">Forgot Password?</button>
            </>
          )}
          {view !== 'login' && (
            <button onClick={() => setView('login')} className="text-blue-600 hover:underline">Back to Login</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}