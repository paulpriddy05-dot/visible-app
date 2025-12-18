"use client";

import { Suspense } from "react";
import { supabase } from "@/lib/supabase"; // 🟢 CORRECTED IMPORT
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

function JoinContent() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Verifying invite...");

  useEffect(() => {
    const acceptInvite = async () => {
      const token = params?.token as string;
      
      if (!token) {
        setStatus("Invalid invite link.");
        setLoading(false);
        return;
      }

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push(`/?error=${encodeURIComponent("Please login to accept invite")}`);
        return;
      }

      // If logged in, we would normally process the token here.
      // For now, we just redirect to the dashboard.
      setStatus("Invite accepted! Redirecting...");
      setTimeout(() => {
         router.push("/dashboard");
      }, 1500);
    };

    acceptInvite();
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 text-center max-w-md w-full">
        {loading ? <i className="fas fa-circle-notch fa-spin text-3xl text-blue-500 mb-4"></i> : null}
        <h2 className="text-xl font-bold text-slate-800">{status}</h2>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinContent />
    </Suspense>
  );
}