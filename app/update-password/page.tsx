"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  // Your original client logic
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMsg("");

    // 1. Check if passwords match
    if (password !== confirmPassword) {
      setErrorMsg("Error: Passwords do not match");
      setLoading(false);
      return;
    }

    // 2. Update password
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg("Error: " + error.message);
      setLoading(false);
    } else {
      await supabase.auth.refreshSession();
      setMessage("Success! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans relative overflow-hidden px-4">
      
      {/* Background Decoration (Matches Login) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="z-10 w-full max-w-md">
        
        {/* LOGO */}
        <div className="flex items-baseline justify-center gap-2 mb-8 select-none">
            <span className="font-serif text-5xl font-bold text-slate-900 leading-none">V</span>
            <span className="text-2xl font-bold text-slate-700 tracking-tight">Visible</span>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 relative overflow-hidden">
            {/* Top Border Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Set New Password</h2>
                <p className="text-slate-500 text-sm mt-1">
                    Secure your account with a new password.
                </p>
            </div>

            {/* Notifications */}
            {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2"><i className="fas fa-exclamation-circle"></i> {errorMsg}</div>}
            {message && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-center gap-2"><i className="fas fa-check-circle"></i> {message}</div>}

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">New Password</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Min 6 characters"
                        className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Re-type password"
                        className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <button
                    disabled={loading}
                    className="bg-indigo-600 mt-2 rounded-xl px-4 py-3.5 text-white font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>

            {/* Back Link */}
            <div className="text-center mt-6">
                <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
                    Back to Login
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}