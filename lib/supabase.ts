import { createBrowserClient } from '@supabase/ssr';

// This client automatically handles cookie storage for Next.js
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);