"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

function LoginContent() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"login" | "signup" | "forgot">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Track if the last login attempt failed — used to conditionally show "Forgot Password?"
  const [showForgotLinkAfterError, setShowForgotLinkAfterError] = useState(false);

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
    setShowForgotLinkAfterError(false);

    const origin = typeof window !== "undefined" ? window.location.origin : "https://https://visible-app.vercel.app"; // ← Replace with your actual domain

    try {
      if (view === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/auth/callback` },
        });
        if (error) throw error;
        setSuccessMsg("Check your email for the confirmation link!");
      } 
      else if (view === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/dashboard`,
        });
        if (error) throw error;
        setSuccessMsg("If an account exists, a password reset link has been sent.");
        setView("login");
        setPassword(""); // Clear password when returning to login
      } 
      else {
        // Login attempt
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: any) {
      const message = err.message || "An error occurred.";
      setErrorMsg(message);

      // Only show "Forgot Password?" prominently after a login failure
      if (view === "login") {
        setShowForgotLinkAfterError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchToForgot = () => {
    setView("forgot");
    setErrorMsg("");
    setSuccessMsg("");
    setPassword("");
    setShowForgotLinkAfterError(false);
  };

  const switchToLogin = () => {
    setView("login");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const switchToSignup = () => {
    setView("signup");
    setErrorMsg("");
    setSuccessMsg("");
    setShowForgotLinkAfterError(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">
          {view === "signup"
            ? "Create Account"
            : view === "forgot"
            ? "Reset Password"
            : "Welcome Back"}
        </h1>
        <p className="text-center text-slate-500 mb-6">
          {view === "signup"
            ? "Start visualizing your ministry data."
            : view === "forgot"
            ? "We'll send a recovery link to your email."
            : "Login to access your dashboards."}
        </p>

        {/* Error / Success Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {errorMsg}
            {/* Show "Forgot Password?" right under error only after failed login */}
            {showForgotLinkAfterError && view === "login" && (
              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={switchToForgot}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              placeholder="you@church.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {view !== "forgot" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required={view !== "forgot"}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Fallback "Forgot Password?" link always visible in login view (below password) */}
              {view === "login" && !showForgotLinkAfterError && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={switchToForgot}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : view === "signup" ? (
              "Sign Up"
            ) : view === "forgot" ? (
              "Send Reset Link"
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Bottom Links */}
        <div className="mt-6 text-center text-sm text-slate-500">
          {view === "signup" ? (
            <>
              Already have an account?{" "}
              <button onClick={switchToLogin} className="text-blue-600 font-bold hover:underline">
                Login
              </button>
            </>
          ) : view === "forgot" ? (
            <button onClick={switchToLogin} className="text-blue-600 font-bold hover:underline">
              ← Back to Login
            </button>
          ) : (
            <>
              Don't have an account?{" "}
              <button onClick={switchToSignup} className="text-blue-600 font-bold hover:underline">
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}