'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  // Initialize Supabase
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    // 1. Log out from Supabase (clears the browser session)
    await supabase.auth.signOut();
    
    // 2. Refresh the router so server components know you are gone
    router.refresh();
    
    // 3. Redirect to the login page
    router.push('/');
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-sm transition-colors"
    >
      Sign Out
    </button>
  );
}