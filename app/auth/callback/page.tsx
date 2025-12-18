"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Supabase automatically parses the URL hash (#access_token=...)
    // 2. We verify we have a session, then redirect.
    const handleCallback = async () => {
      // Check if the URL processed correctly and we have a user
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Success! Go to dashboard
        router.push("/dashboard");
      } else {
        // If not logged in immediately, listen for the "SIGNED_IN" event
        // which triggers as Supabase finishes processing the hash.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_IN") {
            router.push("/dashboard");
          }
        });
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <i className="fas fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
        <h2 className="text-xl font-bold text-slate-800">Verifying your login...</h2>
        <p className="text-slate-500">Please wait a moment.</p>
      </div>
    </div>
  );
}