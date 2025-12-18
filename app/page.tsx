"use client";

// We keep this to be safe, but we are removing the hook that causes the crash
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation"; // 🟢 REMOVED useSearchParams
import { useState, useEffect } from "react";

function LoginContent() {
  const router = useRouter();
  // 🟢 REMOVED: const searchParams = useSearchParams(); 
  
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // 🟢 NEW STRATEGY: Read the URL manually using standard Browser JS
    // The build server doesn't have 'window', so it skips this line and doesn't crash.
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

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setErrorMsg(error.message);
      else alert("Check your email for the confirmation link!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setErrorMsg(error.message);
      else router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-center text-slate-500 mb-6">
          {isSignUp ? "Start visualizing your ministry data." : "Login to access your dashboards."}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : (isSignUp ? "Sign Up" : "Login")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 font-bold hover:underline"
          >
            {isSignUp ? "Login" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

// We keep the wrapper just to be polite to Next.js, but the trigger is gone.
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}