import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use in Server Components, Route Handlers,
 * and Server Actions.
 *
 * USE THIS WHEN:
 * - You're in a Server Component (no 'use client' directive)
 * - You're in an API route handler (app/api/.../route.ts)
 * - You're in a Server Action (functions with 'use server')
 *
 * EXAMPLE - Server Component:
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function ProfilePage() {
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   // ...
 * }
 * ```
 *
 * WHY IS THIS ASYNC?
 * In Next.js 15, the cookies() function is async. We need to await it
 * before creating the client.
 *
 * WHY CREATE A NEW CLIENT EACH TIME?
 * Server-side code handles multiple users simultaneously. Each request
 * needs its own client with its own cookies to identify the correct user.
 * Reusing a client could leak one user's session to another!
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
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
            // This can be ignored if you have middleware refreshing sessions.
            // The middleware (which we'll create next) handles session refresh.
          }
        },
      },
    }
  );
}
