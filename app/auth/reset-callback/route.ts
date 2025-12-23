import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    // 1. Prepare the Redirect Response immediately
    // We will attach cookies to this response object before returning it
    let response = NextResponse.redirect(`${origin}/update-password`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // This is the Magic Step:
            // Iterate over the new session cookies and stamp them onto our response
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value); // Update request (server-side)
              response.cookies.set(name, value, options); // Update response (browser-side)
            });
          },
        },
      }
    );

    // 2. Exchange the Code (This triggers 'setAll' above)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 3. Return the response carrying the cookies
      return response;
    }
  }

  // If code exchange fails, send to login with error
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}