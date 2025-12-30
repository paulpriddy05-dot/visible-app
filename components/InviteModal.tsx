"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { sendInvite } from "@/app/actions/send-invite";

export default function InviteModal({ isOpen, onClose, dashboardTitle, shareToken, dashboardId }: any) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("viewer");
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    // Member Data
    const [members, setMembers] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // UI States
    const [copyLabel, setCopyLabel] = useState("Copy Link");

    // 1. Fetch Members & Current User when modal opens
    useEffect(() => {
        if (isOpen && dashboardId) {
            fetchCurrentUser();
            fetchMembers();
        }
    }, [isOpen, dashboardId]);

    const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };

    const fetchMembers = async () => {
        setLoadingMembers(true);
        // Fetch permissions from dashboard_access
        const { data, error } = await supabase
            .from('dashboard_access')
            .select('*')
            .eq('dashboard_id', dashboardId);

        if (data) setMembers(data);
        setLoadingMembers(false);
    };

    // 🟢 2. Determine MY current role dynamically
    // We find the row that matches the logged-in user's email
    const myMemberRow = members.find(m =>
        m.user_email?.toLowerCase() === currentUser?.email?.toLowerCase()
    );
    // If found, use that role. If not found, default to viewer (or owner if I created it logic elsewhere)
    const currentUserRole = myMemberRow?.role || 'viewer';

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        // Check if they exist first
        const { data: existing } = await supabase
            .from('dashboard_access')
            .select('id')
            .eq('dashboard_id', dashboardId)
            .eq('user_email', email)
            .maybeSingle();

        let dbError;

        if (existing) {
            // A. Update existing user
            const { error } = await supabase
                .from('dashboard_access')
                .update({ role })
                .eq('id', existing.id);
            dbError = error;
        } else {
            // B. Add new user
            const { error } = await supabase
                .from('dashboard_access')
                .insert({
                    dashboard_id: dashboardId,
                    user_email: email,
                    role
                });
            dbError = error;
        }

        if (dbError) {
            console.error("Permission Save Error:", dbError);
            setStatus('error');
            return;
        }

        // Send Email
        const result = await sendInvite(email, dashboardTitle, shareToken, role);

        if (result.success) {
            setStatus('success');
            fetchMembers(); // Refresh the list
            setTimeout(() => {
                setStatus('idle');
                setEmail("");
                setRole("view");
            }, 2000);
        } else {
            setStatus('error');
        }
    };

    // Update Role for existing member
    const updateMemberRole = async (memberId: string, newRole: string) => {
        // Optimistic Update
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));

        // DB Update
        const { error } = await supabase
            .from('dashboard_access')
            .update({ role: newRole })
            .eq('id', memberId);

        if (error) {
            console.error("Failed to update role", error);
            fetchMembers(); // Revert
        }
    };

    const removeMember = async (memberEmail: string) => {
        if (!confirm(`Remove access for ${memberEmail}?`)) return;

        // Optimistic Update
        setMembers(prev => prev.filter(m => m.user_email !== memberEmail));

        await supabase
            .from('dashboard_access')
            .delete()
            .eq('dashboard_id', dashboardId)
            .eq('user_email', memberEmail);
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/join/${shareToken}`;
        navigator.clipboard.writeText(link);
        setCopyLabel("Copied!");
        setTimeout(() => setCopyLabel("Copy Link"), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Share "{dashboardTitle}"</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1 hover:bg-slate-200">
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="overflow-y-auto p-6 space-y-8 custom-scroll">

                    {/* SECTION 1: INVITE FORM */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Add People</h4>
                        {status === 'success' ? (
                            <div className="bg-green-50 text-green-700 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <i className="fas fa-check-circle text-xl"></i>
                                <div>
                                    <span className="font-bold block text-sm">Invited!</span>
                                    <span className="text-xs">Access granted to {email}</span>
                                </div>
                                <button onClick={() => setStatus('idle')} className="ml-auto text-xs font-bold underline hover:text-green-800">Invite another</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSend} className="flex gap-2">
                                <div className="flex-1 relative">
                                    <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter email address..."
                                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                {/* Permission Selector */}
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="editor">Editor</option>
                                </select>

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'sending' ? <i className="fas fa-spinner fa-spin"></i> : "Invite"}
                                </button>
                            </form>
                        )}
                        {status === 'error' && <p className="text-red-500 text-xs mt-2 font-medium">Error saving permission. Check console.</p>}
                    </div>

                    <div className="h-px bg-slate-100 w-full"></div>

                    {/* SECTION 2: WHO HAS ACCESS */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Who has access</h4>

                        <div className="space-y-3">
                            {/* Current User (You) - 🟢 Updated to show DYNAMIC role */}
                            {currentUser && (
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
                                            {currentUser.email?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-700">You</div>
                                            <div className="text-[10px] text-slate-400">{currentUser.email}</div>
                                        </div>
                                    </div>
                                    {/* 🟢 Fix: Display actual role, not hardcoded 'Owner' */}
                                    <span className="text-xs text-slate-400 font-medium italic pr-2 capitalize">
                                        {currentUserRole === 'edit' ? 'Editor' : currentUserRole}
                                    </span>
                                </div>
                            )}

                            {/* List of Fetched Members */}
                            {loadingMembers ? (
                                <div className="text-center py-4 text-slate-400 text-xs italic flex items-center justify-center gap-2">
                                    <i className="fas fa-circle-notch fa-spin"></i> Loading list...
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-slate-400 text-xs italic ml-11">No other members yet.</div>
                            ) : (
                                members.map((member) => {
                                    // 🟢 Fix: Robust filter for "Me"
                                    if (member.user_email?.toLowerCase() === currentUser?.email?.toLowerCase()) return null;

                                    // 🟢 Fix: Hide NULL rows (prevents the "NULL" user bug)
                                    if (!member.user_email || member.user_email === 'NULL') return null;

                                    return (
                                        <div key={member.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs uppercase border border-slate-200">
                                                    {member.user_email.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-700">{member.user_email}</div>
                                                    <div className="text-[10px] text-slate-400 capitalize">
                                                        {['editor', 'edit', 'owner'].includes(member.role) ? 'Editor' : 'Viewer'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 🟢 Fix: Only OWNERS see edit controls. Others see text. */}
                                            <div className="flex items-center gap-2">
                                                {currentUserRole === 'owner' ? (
                                                    <>
                                                        <select
                                                            value={['editor', 'edit', 'owner'].includes(member.role) ? 'editor' : 'viewer'}
                                                            onChange={(e) => updateMemberRole(member.id, e.target.value)}
                                                            className="text-xs font-bold uppercase bg-transparent border-none text-right cursor-pointer text-slate-500 hover:text-blue-600 focus:ring-0 outline-none py-1 pr-1"
                                                        >
                                                            <option value="viewer">Viewer</option>
                                                            <option value="editor">Editor</option>
                                                        </select>

                                                        <button
                                                            onClick={() => removeMember(member.user_email)}
                                                            className="text-slate-300 hover:text-red-500 transition-colors px-2 py-1"
                                                            title="Remove Access"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </>
                                                ) : (
                                                    // Non-owners just see the label
                                                    <span className="text-xs text-slate-400 font-bold uppercase px-2">
                                                        {member.role === 'owner' ? 'Owner' : member.role}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full"></div>

                    {/* Footer Actions */}
                    <div className="bg-slate-50 -mx-6 -mb-6 p-4 flex justify-between items-center border-t border-slate-100">
                        <button
                            onClick={handleCopyLink}
                            className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors flex items-center gap-2 active:scale-95 transform"
                        >
                            <i className={`fas ${copyLabel === 'Copied!' ? 'fa-check' : 'fa-link'}`}></i> {copyLabel}
                        </button>
                        <button onClick={onClose} className="text-slate-500 text-sm hover:text-slate-800 font-medium px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors">
                            Done
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}