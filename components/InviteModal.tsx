"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Ensure this path matches your project
import { sendInvite } from "@/app/actions/send-invite";

export default function InviteModal({ isOpen, onClose, dashboardTitle, shareToken, dashboardId }: any) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("view"); // Default to 'view'
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [members, setMembers] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    // 1. Fetch Members when modal opens
    useEffect(() => {
        if (isOpen && dashboardId) {
            fetchMembers();
        }
    }, [isOpen, dashboardId]);

    const fetchMembers = async () => {
        setLoadingMembers(true);
        // 🟢 Assumption: You have a table 'dashboard_permissions' linking users to dashboards
        const { data, error } = await supabase
            .from('dashboard_permissions')
            .select('*')
            .eq('dashboard_id', dashboardId);

        if (data) setMembers(data);
        setLoadingMembers(false);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        // 1. Save Permission to Database (Grant Access)
        const { error: dbError } = await supabase
            .from('dashboard_permissions')
            .upsert({
                dashboard_id: dashboardId,
                user_email: email,
                role: role
            }, { onConflict: 'dashboard_id, user_email' });

        if (dbError) {
            console.error("Permission Save Error:", dbError);
            setStatus('error');
            return;
        }

        // 2. Send the Email Notification
        // Note: We pass the 'role' so the email can say "You've been invited as an Editor"
        // You might need to update your sendInvite action to accept this 4th arg, or it will just ignore it for now.
        const result = await sendInvite(email, dashboardTitle, shareToken, role);

        if (result.success) {
            setStatus('success');
            fetchMembers(); // Refresh the list immediately
            setTimeout(() => {
                setStatus('idle');
                setEmail("");
                setRole("view");
                // Don't auto-close immediately so they can see the list update
            }, 2000);
        } else {
            setStatus('error');
        }
    };

    const removeMember = async (memberEmail: string) => {
        if (!confirm(`Remove access for ${memberEmail}?`)) return;

        await supabase
            .from('dashboard_permissions')
            .delete()
            .eq('dashboard_id', dashboardId)
            .eq('user_email', memberEmail);

        fetchMembers();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Share "{dashboardTitle}"</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1 hover:bg-slate-200">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="overflow-y-auto p-6 space-y-8">

                    {/* SECTION 1: INVITE FORM */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Add People</h4>
                        {status === 'success' ? (
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
                                <i className="fas fa-check-circle text-xl"></i>
                                <div>
                                    <span className="font-bold block">Invited!</span>
                                    <span className="text-xs">Access granted to {email}</span>
                                </div>
                                <button onClick={() => setStatus('idle')} className="ml-auto text-sm font-bold underline">Invite another</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSend} className="flex gap-2">
                                <div className="flex-1 relative">
                                    <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter email address..."
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                {/* 🟢 PERMISSION SELECTOR */}
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="view">Viewer</option>
                                    <option value="edit">Editor</option>
                                </select>

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm"
                                >
                                    {status === 'sending' ? <i className="fas fa-spinner fa-spin"></i> : "Invite"}
                                </button>
                            </form>
                        )}
                        {status === 'error' && <p className="text-red-500 text-xs mt-2">Error sending invite.</p>}
                    </div>

                    <div className="h-px bg-slate-100 w-full"></div>

                    {/* SECTION 2: WHO HAS ACCESS */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Who has access</h4>

                        <div className="space-y-3">
                            {/* Current User (You) - Mocked for visual completeness */}
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">YO</div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-700">You</div>
                                        <div className="text-[10px] text-slate-400">Owner</div>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400">Owner</span>
                            </div>

                            {/* List of Fetched Members */}
                            {loadingMembers ? (
                                <div className="text-center py-4 text-slate-400 text-xs italic">Loading access list...</div>
                            ) : members.length === 0 ? (
                                <div className="text-slate-400 text-xs italic ml-11">No other members yet.</div>
                            ) : (
                                members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs uppercase">
                                                {member.user_email?.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-700">{member.user_email}</div>
                                                <div className="text-[10px] text-slate-400">{member.role === 'edit' ? 'Can Edit' : 'Can View'}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Role Badge */}
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${member.role === 'edit' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                {member.role}
                                            </span>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeMember(member.user_email)}
                                                className="text-slate-300 hover:text-red-500 transition-colors px-2"
                                                title="Remove Access"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full"></div>

                    {/* Footer Actions */}
                    <div className="bg-slate-50 -mx-6 -mb-6 p-4 flex justify-between items-center">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`https://usevisible.app/join/${shareToken}`);
                                alert("Link copied!");
                            }}
                            className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-2"
                        >
                            <i className="fas fa-link"></i> Copy Link
                        </button>
                        <button onClick={onClose} className="text-slate-500 text-sm hover:text-slate-800 font-medium">
                            Done
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}