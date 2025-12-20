'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
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

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage('Error: ' + error.message);
      setLoading(false);
    } else {
      await supabase.auth.refreshSession(); // Critical for cookies
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
          <input
            type="password" placeholder="New Password" required minLength={6}
            className="w-full p-2 border border-slate-300 rounded-lg"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
}