"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo"; // 🟢 Import the Logo so it doesn't crash

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [status, setStatus] = useState("Checking invitation...");

  useEffect(() => {
    const handleJoin = async () => {
      // 1. Check Login
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to Login if not authenticated
        router.push(`/login?next=/join/${token}`);
        return;
      }

      // 2. 🟢 SECURE CHECK: Use the SQL function to bypass RLS
      const { data: dashboard, error } = await supabase
        .rpc('verify_invite_token', { token_input: token })
        .single();

      if (error || !dashboard) {
        console.error("Invite Error:", error);
        setStatus("Invalid or expired invitation.");
        return;
      }

      // 3. Add to Access List
      const { error: joinError } = await supabase
        .from('dashboard_access')
        .upsert({ 
          dashboard_id: dashboard.id, 
          user_id: session.user.id,
          role: 'viewer' // Default role
        }, { onConflict: 'dashboard_id,user_id' });

      if (joinError) {
        console.error(joinError);
        setStatus("Error joining dashboard.");
      } else {
        setStatus(`Success! Joining ${dashboard.title}...`);
        router.push(`/dashboard/${dashboard.id}`);
      }
    };

    handleJoin();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center border border-slate-100 max-w-sm w-full">
        
        {/* 🟢 NEW LOGO HERE */}
        <div className="flex justify-center mb-8">
            <Logo className="h-12" />
        </div>

        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-6"></div>
        
        <h2 className="text-lg font-bold text-slate-800 mb-2">{status}</h2>
        <p className="text-sm text-slate-400">Please wait while we verify your access.</p>
      </div>
    </div>
  );
}