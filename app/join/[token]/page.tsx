"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // adjust path if needed
import { useRouter, useParams } from "next/navigation";

export default function JoinPage() {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("Verifying Invite...");

  useEffect(() => {
    const joinTeam = async () => {
      // 1. Check Login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // If not logged in, redirect to login, then come back here
        const returnUrl = encodeURIComponent(window.location.href); // Save this page
        window.location.href = `/?redirect=${returnUrl}`; // Send to login
        return;
      }

      // 2. Attempt to Join
      try {
        const { data: dashboardId, error } = await supabase.rpc('join_dashboard_by_token', {
          token_input: token
        });

        if (error) throw error;

        setStatus("Success! Redirecting...");
        router.push(`/dashboard/${dashboardId}`);
        
      } catch (err: any) {
        setStatus("Error: " + err.message);
      }
    };

    if(token) joinTeam();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="text-center">
        <div className="text-2xl font-bold mb-2">{status}</div>
        <div className="text-slate-400 text-sm">Please wait while we set up your access.</div>
      </div>
    </div>
  );
}