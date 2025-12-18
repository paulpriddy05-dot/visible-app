"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Check for a session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // 2. Check if the URL tells us where to go (e.g., ?next=/dashboard/settings)
        // If no instruction, default to "/dashboard"
        const next = searchParams.get("next") || "/dashboard";
        router.push(next);
      } else {
        // 3. Fallback listener
        supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_IN") {
            const next = searchParams.get("next") || "/dashboard";
            router.push(next);
          }
        });
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
      <i className="fas fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
      <p>Verifying and redirecting...</p>
    </div>
  );
}