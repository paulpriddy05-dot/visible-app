import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = { getAll: () => [], set: () => {} }; // Mock for typing
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return request.cookies.get(name)?.value; },
          set(name: string, value: string, options: any) {
            request.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            request.cookies.delete({ name, ...options });
          },
        },
      }
    );
    
    // 1. Exchange the code for a session (Log the user in)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 2. HARDCODED REDIRECT: Always go to update password
      return NextResponse.redirect(`${origin}/update-password`);
    }
  }

  // If error, send to login
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}