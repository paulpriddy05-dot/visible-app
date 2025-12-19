'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function HandleAuth() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleLogin = async () => {
      // 1. Initialize Supabase (New SDK Syntax)
      // We pass the env vars directly here to create the client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 2. Check session (works for both Implicit #hash and PKCE ?code)
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        // 3. Redirect to dashboard
        const next = searchParams.get('next') || '/dashboard';
        router.push(next);
        router.refresh(); 
      } else {
        console.error('Login failed:', error);
      }
    };

    handleLogin();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Processing login...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HandleAuth />
    </Suspense>
  );
}