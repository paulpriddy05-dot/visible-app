'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 1. Check if passwords match
    if (password !== confirmPassword) {
      setMessage('Error: Passwords do not match');
      setLoading(false);
      return;
    }

    // 2. Update password
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage('Error: ' + error.message);
      setLoading(false);
    } else {
      await supabase.auth.refreshSession(); 
      setMessage('Success! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">Set New Password</h1>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password" placeholder="Min 6 characters" required minLength={6}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password" placeholder="Re-type password" required minLength={6}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 text-sm rounded-lg text-center ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}