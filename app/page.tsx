"use client";

// Force dynamic rendering to avoid static prerendering issues
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

function LoginContent() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  // Three modes: 'login', 'signup', 'forgot'
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      setErrorMsg(decodeURIComponent(error));
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const origin = typeof window !== "undefined" ? window.location.origin : "";

    try {
      if (view === 'signup') {
        // --- SIGN UP ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/auth/callback` },
        });
        if (error) throw error;
        setSuccessMsg("Check your email for the confirmation link!");
      } 
      else if (view === 'forgot') {
        // --- FORGOT PASSWORD ---
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/dashboard`, // Redirect to dashboard after clicking link
        });
        if (error) throw error;
        setSuccessMsg("If an account exists, we sent a password reset link to it.");
        setView('login'); // Send them back to login screen
      } 
      else {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        
        {/* HEADER TEXT */}
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">
          {view === 'signup' ? "Create Account" : view === 'forgot' ? "Reset Password" : "Welcome Back"}
        </h1>
        <p className="text-center text-slate-500 mb-6">
          {view === 'signup' ? "Start visualizing your ministry data." 
           : view === 'forgot' ? "Enter your email to receive a recovery link." 
           : "Login to access your dashboards."}
        </p>

        {/* MESSAGES */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
            {successMsg}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              placeholder="you@church.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password field is hidden during 'forgot password' flow */}
          {view !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                {view === 'login' && (
                  <button 
                    type="button"
                    onClick={() => { setView('forgot'); setErrorMsg(""); setSuccessMsg(""); }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : (
              view === 'signup' ? "Sign Up" : view === 'forgot' ? "Send Reset Link" : "Login"
            )}
          </button>
        </form>

        {/* FOOTER SWITCHERS */}
        <div className="mt-6 text-center text-sm text-slate-500">
          {view === 'signup' ? (
            <>
              Already have an account?{" "}
              <button onClick={() => setView('login')} className="text-blue-600 font-bold hover:underline">
                Login
              </button>
            </>
          ) : view === 'forgot' ? (
            <button onClick={() => setView('login')} className="text-blue-600 font-bold hover:underline">
              Back to Login
            </button>
          ) : (
            <>
              Don't have an account?{" "}
              <button onClick={() => setView('signup')} className="text-blue-600 font-bold hover:underline">
                Sign Up
              </button>
            </>
          )}
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