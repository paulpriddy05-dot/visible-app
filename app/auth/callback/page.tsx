"use client";

// FORCE UPDATE: Adding Traffic Control Logic
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying credentials...");

  useEffect(() => {
    const handleCallback = async () => {
      const nextParam = searchParams.get("next");
      const defaultNext = "/dashboard";

      console.log("Callback loaded. Waiting for session...");

      // Listen for the specific Auth Event
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth Event Detected:", event);

        if (event === "PASSWORD_RECOVERY") {
          // 🟢 TRAFFIC CONTROL: Only for password resets
          setStatus("Password reset verified! sending you to settings...");
          setTimeout(() => {
            router.push("/dashboard/settings");
          }, 1000); // 1 second delay to ensure cookie is set
        } 
        else if (event === "SIGNED_IN") {
          // 🟡 NORMAL LOGIN
          setStatus("Login confirmed! Redirecting...");
          setTimeout(() => {
            router.push(nextParam || defaultNext);
          }, 500);
        }
      });
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">
        <i className="fas fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
        <h2 className="text-xl font-bold mb-2">Verifying credentials...</h2>
        <p className="text-slate-500">{status}</p>
      </div>
    </div>
  );
}