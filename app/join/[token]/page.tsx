"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [status, setStatus] = useState("Checking invitation...");

  useEffect(() => {
    const handleJoin = async () => {
      // 1. Check if User is Logged In
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // 🔴 NOT LOGGED IN: Redirect to Login, but pass the return URL
        // You must update your Login page to look for ?next=/...
        router.push(`/login?next=/join/${token}`);
        return;
      }

      // 2. Verify Token & Fetch Dashboard
      const { data: dashboard, error } = await supabase
        .from('dashboards')
        .select('id, title')
        .eq('share_token', token)
        .single();

      if (error || !dashboard) {
        setStatus("Invalid or expired invitation.");
        return;
      }

      // 3. Add User to Dashboard Members
      const { error: joinError } = await supabase
        .from('dashboard_members')
        .upsert({ 
          dashboard_id: dashboard.id, 
          user_id: session.user.id,
          role: 'editor' // Default role for invited users
        }, { onConflict: 'dashboard_id,user_id' });

      if (joinError) {
        console.error(joinError);
        setStatus("Error joining dashboard.");
      } else {
        setStatus(`Success! Joining ${dashboard.title}...`);
        // 4. Redirect to the Dashboard
        setTimeout(() => router.push(`/dashboard/${dashboard.id}`), 1000);
      }
    };

    handleJoin();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-slate-800">{status}</h2>
      </div>
    </div>
  );
}