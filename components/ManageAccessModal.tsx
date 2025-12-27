"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ManageAccessModal({ isOpen, onClose, dashboardId, currentUserId }: any) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && dashboardId) {
      fetchMembers();
    }
  }, [isOpen, dashboardId]);

  const fetchMembers = async () => {
    setLoading(true);
    // 🟢 Call our new secure function
    const { data, error } = await supabase.rpc('get_dashboard_members', { p_dashboard_id: dashboardId });
    if (!error && data) setMembers(data);
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: string) => {
    // Optimistic UI update
    setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, role: newRole } : m));
    
    await supabase.rpc('update_member_role', { 
        p_dashboard_id: dashboardId, 
        p_user_id: userId, 
        p_new_role: newRole 
    });
  };

  const removeMember = async (userId: string) => {
    if(!confirm("Remove this user?")) return;
    
    setMembers(prev => prev.filter(m => m.user_id !== userId));
    await supabase.rpc('remove_dashboard_member', { 
        p_dashboard_id: dashboardId, 
        p_user_id: userId 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Manage Access</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
        </div>

        {/* List */}
        <div className="p-0 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading members...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-bold text-slate-700 truncate">{member.email}</div>
                      {member.user_id === currentUserId && <div className="text-[10px] text-blue-500 font-bold uppercase">It's You</div>}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {member.role === 'owner' ? (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wide">Owner</span>
                    ) : (
                      <select 
                        value={member.role}
                        onChange={(e) => e.target.value === 'remove' ? removeMember(member.user_id) : updateRole(member.user_id, e.target.value)}
                        className="bg-slate-100 border-none text-sm font-medium text-slate-600 rounded-lg py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="remove" className="text-red-600 font-bold">Remove...</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}