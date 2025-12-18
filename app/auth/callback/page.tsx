'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function HandleAuth() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Create the browser/client Supabase instance
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Supabase automatically processes the #access_token hash from the callback URL
      // We just need to wait for the auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const next = searchParams.get('next') || '/dashboard';
          router.push(next);
          router.refresh(); // Ensures layout/components re-render with new session
        }
      });

      // Also check current session in case hash was already processed (e.g., page refresh)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const next = searchParams.get('next') || '/dashboard';
        router.push(next);
        router.refresh();
      }

      // Cleanup subscription
      return () => subscription.unsubscribe();
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <i className="fas fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
        <p className="text-lg text-slate-600">Processing authentication...</p>
        <p className="text-sm text-slate-500 mt-2">You will be redirected shortly.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HandleAuth />
    </Suspense>
  );
}