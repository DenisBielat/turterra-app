import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth Callback Route Handler
 *
 * This route handles redirects from Supabase auth emails:
 * - Email confirmation (after signup)
 * - Password reset
 * - Magic link login (if enabled)
 *
 * HOW IT WORKS:
 * 1. User clicks link in email (e.g., "Confirm your email")
 * 2. Link goes to Supabase, which validates it
 * 3. Supabase redirects to: /auth/callback?code=XXXXX&next=/onboarding
 * 4. This route exchanges the code for a session
 * 5. User is now logged in and redirected to their destination
 *
 * THE CODE PARAMETER:
 * The `code` is a one-time token that proves the user clicked a valid email link.
 * We exchange it for a full session (access token + refresh token).
 * This is the PKCE (Proof Key for Code Exchange) flow - more secure than
 * putting tokens directly in the URL.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // Get the auth code from the URL
  const code = searchParams.get("code");

  // Get where to redirect after auth (defaults to home page)
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successfully authenticated!
      // Check if this user has completed their profile setup
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user has a profile (username set)
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // New user without a profile - send to onboarding
          // This happens after email confirmation for new signups
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      // Existing user with profile - send to requested destination
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong:
  // - No code provided
  // - Code was invalid or expired
  // - Exchange failed
  return NextResponse.redirect(`${origin}/auth/error`);
}
