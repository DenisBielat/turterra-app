import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth Callback Route Handler
 *
 * This route handles redirects from Supabase auth:
 * - Email confirmation (after signup)
 * - Password reset
 * - OAuth sign-in (Google)
 * - Account linking (connecting Google to an existing account)
 *
 * HOW IT WORKS:
 * 1. User completes an auth action (email link, Google OAuth, etc.)
 * 2. Supabase redirects to: /auth/callback?code=XXXXX&next=/...
 * 3. This route exchanges the code for a session
 * 4. User is redirected to their destination
 *
 * THE CODE PARAMETER:
 * The `code` is a one-time token from the PKCE flow.
 * We exchange it for a full session (access token + refresh token).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const isLinking = searchParams.get("linking") === "true";

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If this was an account linking flow, go straight back to settings
      if (isLinking) {
        return NextResponse.redirect(`${origin}/settings`);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // New user without a profile — send to onboarding
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
