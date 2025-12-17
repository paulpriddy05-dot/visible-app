"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect"); // 🟢 Capture the return link

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // If there is a redirect link (like an invite), go there. Otherwise, go to dashboard.
        redirectTo: redirectUrl ? redirectUrl : `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      alert("Error logging in: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <div className="inline-flex h-16 w-16 bg-white/20 rounded-2xl items-center justify-center mb-4 backdrop-blur-sm">
            <i className="fas fa-church text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Visible</h1>
          <p className="text-blue-100 mt-2">Visible</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center text-slate-500 text-sm">
            Sign in to access your team dashboards.
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 p-4 rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all group"
          >
            {loading ? (
              <span className="animate-spin"><i className="fas fa-circle-notch"></i></span>
            ) : (
              <>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}