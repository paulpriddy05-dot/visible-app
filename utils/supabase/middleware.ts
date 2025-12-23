import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          
          supabaseResponse = NextResponse.next({
            request,
          });
          
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. PROTECTED ROUTES
  // If user is NOT logged in and tries to access dashboard, kick them to login
  if (path.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login"; // or "/"
    return NextResponse.redirect(url);
  }

  // 2. AUTH ROUTES (Login/Signup/Home)
  // If user IS logged in, we usually want to send them to Dashboard...
  if ((path === "/" || path === "/login") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  
  // ⚠️ CRITICAL: We do NOT redirect /update-password.
  // We want logged-in users to see that page so they can change their password.
  // This function simply returns 'supabaseResponse' below, allowing the request to pass.

  return supabaseResponse;
}