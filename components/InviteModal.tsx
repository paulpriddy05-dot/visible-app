"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { sendInvite } from "@/app/actions/send-invite";

export default function InviteModal({ isOpen, onClose, dashboardTitle, shareToken, dashboardId }: any) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("viewer");
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    // Data State
    const [members, setMembers] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [trueOwnerId, setTrueOwnerId] = useState<string | null>(null);

    // UI State
    const [copyLabel, setCopyLabel] = useState("Copy Link");

    useEffect(() => {
        if (isOpen && dashboardId) {
            fetchData();
        }
    }, [isOpen, dashboardId]);

    const fetchData = async () => {
        setLoadingMembers(true);

        // 1. Get Current User
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // 2. Get Access List
        const { data: accessData } = await supabase
            .from('dashboard_access')
            .select('*')
            .eq('dashboard_id', dashboardId);

        // 3. 🟢 GET TRUE OWNER: Fetch the dashboard to see who actually owns it
        const { data: dashboardData } = await supabase
            .from('dashboards')
            .select('user_id')
            .eq('id', dashboardId)
            .single();

        setMembers(accessData || []);
        setTrueOwnerId(dashboardData?.user_id || null);
        setLoadingMembers(false);
    };

    // 🟢 4. Determine MY Role safely
    const isTrueOwner = currentUser?.id === trueOwnerId;

    // If I am not the true owner, look for my permission in the list
    const myMemberRow = members.find(m =>
        m.user_email?.toLowerCase() === currentUser?.email?.toLowerCase()
    );

    // Final Calculation: If I created it, I am Owner. Otherwise, use list. Default to viewer.
    const currentUserRole = isTrueOwner ? 'owner' : (myMemberRow?.role || 'viewer');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        // Check if user exists in list
        const { data: existing } = await supabase
            .from('dashboard_access')
            .select('id')
            .eq('dashboard_id', dashboardId)
            .eq('user_email', email)
            .maybeSingle();

        let dbError;

        if (existing) {
            // Update existing
            const { error } = await supabase
                .from('dashboard_access')
                .update({ role })
                .eq('id', existing.id);
            dbError = error;
        } else {
            // Insert new
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
            fetchData(); // Reload everything
            setTimeout(() => {
                setStatus('idle');
                setEmail("");
                setRole("viewer"); // Reset default
            }, 2000);
        } else {
            setStatus('error');
        }
    };

    const updateMemberRole = async (memberId: string, newRole: string) => {
        // Optimistic Update
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));

        const { error } = await supabase
            .from('dashboard_access')
            .update({ role: newRole })
            .eq('id', memberId);

        if (error) {
            console.error("Failed to update role", error);
            fetchData();
        }
    };

    const removeMember = async (memberEmail: string) => {
        if (!confirm(`Remove access for ${memberEmail}?`)) return;

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

                {/* Body */}
                <div className="overflow-y-auto p-6 space-y-8 custom-scroll">

                    {/* INVITE FORM */}
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
                        {status === 'error' && <p className="text-red-500 text-xs mt-2 font-medium">Error saving permission.</p>}
                    </div>

                    <div className="h-px bg-slate-100 w-full"></div>

                    {/* MEMBER LIST */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Who has access</h4>
                        <div className="space-y-3">

                            {/* 🟢 "You" Section - Uses TRUE OWNER Check */}
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
                                    <span className="text-xs text-slate-400 font-medium italic pr-2 capitalize">
                                        {/* Display logic: If true owner, force "Owner". Else show role. */}
                                        {currentUserRole === 'owner' ? 'Owner' : (currentUserRole === 'editor' ? 'Editor' : 'Viewer')}
                                    </span>
                                </div>
                            )}

                            {/* Access List */}
                            {loadingMembers ? (
                                <div className="text-center py-4 text-slate-400 text-xs italic flex items-center justify-center gap-2">
                                    <i className="fas fa-circle-notch fa-spin"></i> Loading list...
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-slate-400 text-xs italic ml-11">No other members yet.</div>
                            ) : (
                                members.map((member) => {
                                    // Filter out "Me"
                                    if (member.user_email?.toLowerCase() === currentUser?.email?.toLowerCase()) return null;
                                    // Filter out "True Owner" if they are also in the list (prevents dupes)
                                    if (member.role === 'owner' && isTrueOwner) return null;
                                    // Filter out NULLs
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
                                                        {member.role === 'editor' ? 'Editor' : 'Viewer'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Only True Owner (or Owner role) can edit others */}
                                                {currentUserRole === 'owner' ? (
                                                    <>
                                                        <select
                                                            value={member.role === 'editor' ? 'editor' : 'viewer'}
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
                    {/* Footer */}
                    <div className="h-px bg-slate-100 w-full mt-4"></div>
                    <div className="bg-slate-50 -mx-6 -mb-6 p-4 flex justify-between items-center border-t border-slate-100">
                        <button onClick={handleCopyLink} className="text-blue-600 text-sm font-bold hover:text-blue-700 flex items-center gap-2">
                            <i className={`fas ${copyLabel === 'Copied!' ? 'fa-check' : 'fa-link'}`}></i> {copyLabel}
                        </button>
                        <button onClick={onClose} className="text-slate-500 text-sm font-medium hover:text-slate-800 px-4">Done</button>
                    </div>

                </div>
            </div>
        </div>
    );
}