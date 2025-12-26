"use client";

import { useState } from "react";
import { sendInvite } from "@/app/actions/send-invite";

export default function InviteModal({ isOpen, onClose, dashboardTitle, shareToken }: any) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    const result = await sendInvite(email, dashboardTitle, shareToken);

    if (result.success) {
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setEmail("");
      }, 2000);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Invite Members</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                <i className="fas fa-check"></i>
              </div>
              <h4 className="text-lg font-bold text-slate-800">Invitation Sent!</h4>
              <p className="text-slate-500 text-sm">We've sent an email to {email}</p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
               <input 
  type="email" 
  required
  autoFocus
  placeholder="colleague@example.com"
  // 🟢 Added 'text-slate-900' and 'bg-white' to force readability
  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 bg-white placeholder:text-slate-400"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
              </div>

              {status === 'error' && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  Failed to send email. Please try again.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    navigator.clipboard.writeText(`https://usevisible.app/join/${shareToken}`);
                    alert("Link copied manually!");
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                >
                  <i className="fas fa-link mr-2"></i> Copy Link
                </button>
                <button 
                  type="submit" 
                  disabled={status === 'sending'}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md text-sm flex items-center justify-center gap-2"
                >
                  {status === 'sending' ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4"></span> : <><i className="fas fa-paper-plane"></i> Send Invite</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}