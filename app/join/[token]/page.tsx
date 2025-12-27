"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo"; 

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [status, setStatus] = useState("Checking invitation...");
  const [isError, setIsError] = useState(false); // 🟢 State to hide spinner on error

  useEffect(() => {
    const handleJoin = async () => {
      // 1. Check Login
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to Login if not authenticated, passing the destination
        router.push(`/login?next=/join/${token}`);
        return;
      }

      // 2. 🟢 CALL THE NEW SECURE FUNCTION
      // This handles both verification AND insertion in one secure step
      const { data, error } = await supabase
        .rpc('accept_invite', { token_input: token });

      if (error || (data && data.error)) {
        console.error("Invite Error:", error || data.error);
        setStatus("Invalid or expired invitation.");
        setIsError(true); // Stop spinner
        return;
      }

      // 3. Success! Redirect
      if (data && data.dashboard_id) {
        setStatus(`Success! Redirecting...`);
        router.push(`/dashboard/${data.dashboard_id}`);
      }
    };

    handleJoin();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center border border-slate-100 max-w-sm w-full">
        
        <div className="flex justify-center mb-8">
            <Logo className="h-12" />
        </div>

        {/* 🟢 HIDE SPINNER ON ERROR */}
        {!isError ? (
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-6"></div>
        ) : (
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                <i className="fas fa-exclamation-triangle"></i>
            </div>
        )}
        
        <h2 className={`text-lg font-bold mb-2 ${isError ? 'text-red-600' : 'text-slate-800'}`}>
            {status}
        </h2>
        
        {!isError && <p className="text-sm text-slate-400">Please wait while we verify your access.</p>}
        
        {/* 🟢 Back Button if stuck */}
        {isError && (
            <button onClick={() => router.push('/dashboard')} className="mt-4 text-sm font-bold text-slate-500 hover:text-slate-800 underline">
                Go to Dashboard
            </button>
        )}
      </div>
    </div>
  );
}