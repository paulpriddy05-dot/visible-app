import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // If "next" is passed (like /update-password), redirect there. Otherwise default to /dashboard
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = {
        getAll: () => [],
        set: () => {},
      }; 
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.delete({
              name,
              ...options,
            });
          },
        },
      }
    );
    
    // ⚠️ This is the magic line that logs the user in
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something broke, send them to an error page or back to login
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}