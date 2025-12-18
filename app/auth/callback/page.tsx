'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // This was likely already there

// 1. Move your existing logic into a new component (e.g., HandleAuth)
function HandleAuth() {
  const searchParams = useSearchParams();
  // ... rest of your existing logic (useEffect, router.push, etc.)
  
  return (
    <div>Processing login...</div> // Or return null
  );
}

// 2. Export the main page component wrapped in Suspense
export default function AuthCallbackPage() {
  return (
    // The fallback UI is shown while Next.js waits for searchParams
    <Suspense fallback={<div>Loading...</div>}>
      <HandleAuth />
    </Suspense>
  );
}