'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// ⚠️ IMPORTANT: Check this import. If you use '@supabase/ssr', import your createClient from your utils folder instead.
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function HandleAuth() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleLogin = async () => {
      // 1. Initialize Supabase
      const supabase = createClientComponentClient();

      // 2. Check if the URL has a session (handles both #hash and ?code)
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        // 3. Get the 'next' URL parameter, or default to dashboard
        const next = searchParams.get('next') || '/dashboard';
        
        // 4. Send them to the dashboard
        router.push(next);
        router.refresh(); // Ensure the layout updates with the new user data
      } else {
        // If no session found, maybe redirect to login with error
        console.error('Login failed:', error);
        // Optional: router.push('/login?error=AuthFailed');
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