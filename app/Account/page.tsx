"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Form States
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        setNewEmail(session.user.email || "");
        setLoading(false);
      }
    };
    getUser();
  }, [router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword.length < 6) return setMessage({ type: 'error', text: "Password must be at least 6 characters." });

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) setMessage({ type: 'error', text: error.message });
    else {
        setMessage({ type: 'success', text: "Password updated successfully!" });
        setNewPassword("");
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!newEmail || newEmail === user.email) return;

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) setMessage({ type: 'error', text: error.message });
    else setMessage({ type: 'success', text: "Confirmation link sent to both emails!" });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar Placeholder (or reuse your main Nav) */}
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors"><i className="fas fa-arrow-left"></i> Back to Dashboard</Link>
            </div>
            <div className="font-bold text-lg">Account Settings</div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
            <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {user?.email?.[0].toUpperCase()}
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Account</h1>
                <p className="text-slate-500">{user?.email}</p>
            </div>
        </div>

        {message && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {message.text}
            </div>
        )}

        {/* SECURITY SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><i className="fas fa-lock text-slate-400"></i> Security</h3>
            </div>
            <div className="p-6 space-y-8">
                
                {/* Email Update */}
                <form onSubmit={handleUpdateEmail} className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                    <div className="flex gap-3">
                        <input 
                            type="email" 
                            value={newEmail} 
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button type="submit" disabled={newEmail === user?.email} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors">
                            Update
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400">Changing this requires confirmation from both your old and new email.</p>
                </form>

                <div className="h-px bg-slate-100"></div>

                {/* Password Update */}
                <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                    <div className="flex gap-3">
                        <input 
                            type="password" 
                            placeholder="Min 6 characters"
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                            Change Password
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* DANGER ZONE */}
        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
             <div className="p-6">
                <h3 className="font-bold text-red-600 mb-2">Sign Out</h3>
                <p className="text-sm text-slate-500 mb-4">Securely end your session on this device.</p>
                <button onClick={handleSignOut} className="w-full py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 hover:text-red-600 transition-colors">
                    Log Out
                </button>
             </div>
        </div>

      </main>
    </div>
  );
}