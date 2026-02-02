import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates the user's session by refreshing the auth token if needed.
 * This runs on EVERY request (via Next.js middleware).
 *
 * WHY DO WE NEED THIS?
 * Supabase auth tokens expire after a certain time. When a token is close
 * to expiring, this function automatically refreshes it. Without this,
 * users would get randomly logged out when their token expires.
 *
 * HOW IT WORKS:
 * 1. Request comes in
 * 2. We create a Supabase client that can read/write cookies
 * 3. We call getUser() which checks if the session needs refreshing
 * 4. If it does, Supabase automatically refreshes it and we save the new cookies
 * 5. Request continues to your page/API with a fresh session
 */
export async function updateSession(request: NextRequest) {
  // Start with a response that just continues to the requested page
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create a Supabase client that can read cookies from the request
  // and write cookies to the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update cookies on the request (for downstream code)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Create a new response with updated cookies
          supabaseResponse = NextResponse.next({
            request,
          });
          // Set cookies on the response (sent back to browser)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add code between createServerClient and getUser()
  // Supabase needs to check the session immediately after client creation.
  // Adding async operations here could cause race conditions.

  // This call does two things:
  // 1. Returns the current user (if logged in)
  // 2. Refreshes the session token if it's about to expire
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // OPTIONAL: Protect routes by redirecting unauthenticated users
  // Uncomment and customize this block if you want certain pages to require login
  //
  // if (
  //   !user &&
  //   !request.nextUrl.pathname.startsWith('/login') &&
  //   !request.nextUrl.pathname.startsWith('/signup') &&
  //   !request.nextUrl.pathname.startsWith('/auth') &&
  //   request.nextUrl.pathname.startsWith('/settings') // Example: protect /settings
  // ) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   return NextResponse.redirect(url)
  // }

  return supabaseResponse;
}
