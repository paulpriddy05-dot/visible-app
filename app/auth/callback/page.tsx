"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Supabase auth callback includes tokens in the URL hash (#access_token=...)
    // We need to capture the auth event that processes those hash params
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Determine where to redirect
        const next = searchParams.get("next") || "/dashboard";

        // Small delay to ensure session is fully propagated (helps with RLS)
        setTimeout(() => {
          router.push(next);
        }, 100);
      }

      // Optional: Handle password recovery specifically
      // If the link type is recovery, redirect to update-password page
      // (Supabase adds ?type=recovery to the callback URL)
      if (event === "PASSWORD_RECOVERY") {
        router.push("/auth/update-password");
      }
    });

    // Important: Trigger initial session check in case the hash was already processed
    // (e.g., page refresh during callback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const next = searchParams.get("next") || "/dashboard";
        router.push(next);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
      <i className="fas fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
      <p className="text-lg">Completing authentication...</p>
      <p className="text-sm mt-2">You will be redirected shortly.</p>
    </div>
  );
}