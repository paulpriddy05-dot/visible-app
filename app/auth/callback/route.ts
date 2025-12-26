import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // ✅ Preserved: Your logic to default to dashboard if no 'next' param exists
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // ✅ Preserved: Redirects to the 'next' page (Dashboard or Update Password)
      // The `cookieStore` logic above ensures the session sticks this time!
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // ✅ Preserved: Your specific error redirect preference
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}