"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Check if Supabase detected the hash in the URL
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // 2. Success! User is logged in. Send to Dashboard.
        router.push("/dashboard");
      } else {
        // 3. Fallback: Listen for the exact moment the session is recovered
        supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_IN") {
            router.push("/dashboard");
          }
        });
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
      <i className="fas fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
      <p>Verifying your secure link...</p>
    </div>
  );
}