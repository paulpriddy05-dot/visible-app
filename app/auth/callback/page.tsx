"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Checking session...");
  const [target, setTarget] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      // DEBUG: See where the URL wants to take us
      const next = searchParams.get("next") || "/dashboard";
      setTarget(next);

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus(`Redirecting to ${next}...`);
        // Small delay so you can read the text before it moves
        setTimeout(() => router.push(next), 1500);
      } else {
        setStatus("Waiting for Supabase...");
        supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_IN") {
             setStatus(`Signed In! Going to ${next}...`);
             router.push(next);
          }
        });
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="text-center p-8 border border-slate-700 rounded-xl bg-slate-800">
        <i className="fas fa-circle-notch fa-spin text-4xl text-blue-500 mb-4"></i>
        <h2 className="text-xl font-bold mb-2">{status}</h2>
        <p className="text-slate-400 text-sm">Target Destination: <span className="text-yellow-400 font-mono">{target || "Loading..."}</span></p>
      </div>
    </div>
  );
}