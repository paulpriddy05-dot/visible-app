"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying secure link...");

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Get the target destination from the URL (default to dashboard)
      const next = searchParams.get("next") || "/dashboard";
      
      // 2. FORCE check for a session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setStatus("Error verifying link. Please try again.");
        console.error("Auth error:", error);
        return;
      }

      if (session) {
        setStatus("Login confirmed! Redirecting...");
        // 🟢 CRITICAL: Small delay ensures the browser saves the cookie before we move
        setTimeout(() => {
           router.push(next);
        }, 500); 
      } else {
        // 3. If no session yet, listen for the exact moment it arrives
        setStatus("Finalizing login...");
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            setStatus("Success! Redirecting...");
            router.push(next);
          }
        });
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">
        <i className="fas fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
        <h2 className="text-xl font-bold mb-2">One moment...</h2>
        <p className="text-slate-500">{status}</p>
      </div>
    </div>
  );
}