"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardLobby() {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboards = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }

      // 🟢 1. FETCH ONLY DASHBOARDS THIS USER HAS ACCESS TO
      const { data } = await supabase
        .from('dashboards')
        .select('*, dashboard_access!inner(user_id)') // !inner filters by the join
        .eq('dashboard_access.user_id', user.id);

      if (data) setDashboards(data);
      setLoading(false);
    };
    fetchDashboards();
  }, [router]);

  // 🟢 REPLACED: New "One-Click" Creation Logic
  const handleCreate = async () => {
    const title = prompt("Name your new dashboard:");
    if (!title) return;

    setLoading(true);

    // Call the new RPC function we just made
    const { data: newId, error } = await supabase.rpc('create_new_dashboard', {
      title_input: title,
    });

    if (error) {
      console.error(error);
      alert("Error creating dashboard: " + error.message);
      setLoading(false);
      return;
    }

    // Success! Go there.
    router.push(`/dashboard/${newId}`);
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Access...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div className="font-bold text-xl text-slate-800 flex items-center gap-2"><i className="fas fa-layer-group text-blue-600"></i> My Dashboards</div>
        <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} className="text-sm text-slate-500 hover:text-red-500 font-medium">Sign Out</button>
      </nav>

      <div className="max-w-5xl mx-auto py-12 px-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Select a Workspace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dash) => (
                <div key={dash.id} onClick={() => router.push(`/dashboard/${dash.id}`)} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-400 cursor-pointer transition-all group">
                    <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">{dash.title.substring(0, 2).toUpperCase()}</div>
                    <h3 className="font-bold text-lg text-slate-800">{dash.title}</h3>
                    <div className="text-xs text-slate-400 mt-2 flex items-center gap-1"><i className="fas fa-shield-alt"></i> Member Access</div>
                </div>
            ))}

            {/* 🟢 3. CONNECTED  */}
            <div onClick={handleCreate} className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 cursor-pointer transition-all">
                <i className="fas fa-plus text-3xl mb-2"></i>
                <span className="font-medium">Create New Dashboard</span>
            </div>
        </div>
      </div>
    </div>
  );
}//coment//