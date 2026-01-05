"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLobby() {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🟢 1. THIS WAS MISSING: Define the state for the limit check
  const [canCreate, setCanCreate] = useState(true);

  const router = useRouter();

  const fetchDashboards = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const { data, error } = await supabase
      .from('dashboards')
      .select('*, dashboard_access!inner(role)')
      .eq('dashboard_access.user_id', user.id);

    if (error) console.error("Error fetching dashboards:", error);

    if (data) {
      setDashboards(data);

      // 🟢 LIMIT CHECK LOGIC
      // Count ONLY dashboards where this user is the OWNER
      const ownedCount = data.filter((d: any) => {
        const access = Array.isArray(d.dashboard_access) ? d.dashboard_access[0] : d.dashboard_access;
        return access.role === 'owner';
      }).length;

      // Check Plan
      const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single();
      const isFree = !profile || profile.subscription_tier === 'free';

      // Disable button if limit reached
      if (isFree && ownedCount >= 1) {
        setCanCreate(false);
      } else {
        setCanCreate(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboards();
  }, [router]);

  const handleCreate = async () => {
    const title = prompt("Name your new dashboard:");
    if (!title) return;

    setLoading(true);

    const { data: newId, error } = await supabase.rpc('create_new_dashboard', {
      title_input: title,
    });

    if (error) {
      console.error(error);
      alert("Error creating dashboard: " + error.message);
      setLoading(false);
      return;
    }

    router.push(`/dashboard/${newId}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();

    const confirmation = prompt(`WARNING: This will permanently delete "${title}" and ALL content inside it.\n\nTo confirm, type "DELETE" below:`);

    if (confirmation !== "DELETE") {
      if (confirmation !== null) {
        alert("Deletion cancelled. You didn't type DELETE correctly.");
      }
      return;
    }

    setDashboards(prev => prev.filter(d => d.id !== id));

    const { error } = await supabase.rpc('delete_complete_dashboard', { p_dashboard_id: id });

    if (error) {
      alert("Could not delete: " + error.message);
      fetchDashboards();
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Access...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="font-bold text-xl text-slate-800 flex items-center gap-2"><i className="fas fa-layer-group text-blue-600"></i> My Dashboards</div>

        <div className="flex items-center gap-4">
          <Link href="/account">
            <button
              className="h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm flex items-center justify-center"
              title="Account Settings"
            >
              <i className="fas fa-user-cog"></i>
            </button>
          </Link>
          <div className="h-6 w-px bg-slate-200"></div>
          <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} className="text-sm text-slate-500 hover:text-red-600 font-medium transition-colors">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto py-12 px-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Select a Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 🟢 NEW: INTERACTIVE DEMO CARD */}
          <div
            onClick={() => router.push('/dashboard/demo')}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer transition-all group relative overflow-hidden text-white"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <i className="fas fa-compass text-8xl"></i>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
              <div>
                <div className="flex items-center gap-2 mb-2 opacity-90">
                  <i className="fas fa-magic text-sm"></i>
                  <span className="text-xs font-bold uppercase tracking-widest">Start Here</span>
                </div>
                <h3 className="font-bold text-2xl">Interactive Demo</h3>
                <p className="text-indigo-100 text-sm mt-1">Try out features safely.</p>
              </div>

              <div className="mt-4">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                  Launch Demo &rarr;
                </span>
              </div>
            </div>
          </div>

          {dashboards.map((dash) => {
            const accessData = Array.isArray(dash.dashboard_access) ? dash.dashboard_access[0] : dash.dashboard_access;
            const isOwner = accessData?.role === 'owner';

            return (
              <div key={dash.id} onClick={() => router.push(`/dashboard/${dash.id}`)} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-400 cursor-pointer transition-all group relative min-h-[180px] flex flex-col">

                {isOwner && (
                  <button
                    onClick={(e) => handleDelete(e, dash.id, dash.title)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-1 z-10"
                    title="Delete Dashboard"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}

                <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl font-bold mb-4 transition-colors ${isOwner ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}>
                  {dash.title.substring(0, 2).toUpperCase()}
                </div>
                <h3 className="font-bold text-lg text-slate-800 truncate pr-6 mb-auto">{dash.title}</h3>

                <div className="text-xs text-slate-400 mt-4 flex items-center gap-1">
                  {isOwner ? (
                    <><i className="fas fa-crown text-amber-400"></i> Owner</>
                  ) : (
                    <><i className="fas fa-shield-alt text-purple-400"></i> Shared with me</>
                  )}
                </div>
              </div>
            );
          })}

          {/* 🟢 2. UPDATED: "Create New" Button with Limit Logic */}
          <div
            onClick={() => {
              if (canCreate) {
                handleCreate();
              } else {
                alert("You have reached the limit for the Free plan. Please upgrade to add more dashboards.");
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all min-h-[180px]
              ${canCreate
                ? "border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 cursor-pointer"
                : "border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50"
              }`}
          >
            {canCreate ? (
              <>
                <i className="fas fa-plus text-3xl mb-2"></i>
                <span className="font-medium">Create New Dashboard</span>
              </>
            ) : (
              <>
                <i className="fas fa-lock text-3xl mb-2 text-slate-300"></i>
                <span className="font-medium">Limit Reached</span>
                <span className="text-xs mt-1 text-blue-500 font-bold uppercase">Upgrade to Pro</span>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}