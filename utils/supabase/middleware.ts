import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Create an initial response
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

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. PROTECTED ROUTES
  // If user is NOT logged in and tries to access dashboard, kick them to login
  if (path.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login"; 
    return NextResponse.redirect(url);
  }

  // 2. AUTH ROUTES (Login/Signup/Home)
  // If user IS logged in, send them to Dashboard
  if ((path === "/" || path === "/login") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  
  // Note: We implicitly allow /update-password to pass through here 
  // because it matches neither condition above.

  return supabaseResponse;
}

// 🟢 NEW: Configuration to prevent middleware from running on static files & AUTH API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (Protect the auth callback routes from middleware interference!)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};