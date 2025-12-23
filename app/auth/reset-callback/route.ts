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
    
    // 1. Log the user in
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 🟢 THE FIX: Force the redirect to /update-password
      // Do not use 'next' param. Do not use '/dashboard'.
      return NextResponse.redirect(`${origin}/update-password`);
    }
  }

  // If the code exchange failed, send them back to login
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}