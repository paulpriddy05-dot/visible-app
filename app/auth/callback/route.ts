// app/auth/callback/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard'; // Default to dashboard if no 'next' param

  if (code) {
    const cookieStore = { getAll: () => [], set: () => {} }; // Mock for typing
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return request.cookies.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.delete({ name, ...options });
          },
        },
      }
    );
    
    // Exchange the code for a session (Logs the user in!)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Redirect to the 'next' page (e.g., /update-password)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If error, send to login
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}