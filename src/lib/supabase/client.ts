import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in Client Components (browser).
 *
 * USE THIS WHEN:
 * - You're in a component with 'use client' at the top
 * - You need to call Supabase from event handlers (onClick, onSubmit, etc.)
 * - You're using React hooks that interact with Supabase
 *
 * EXAMPLE:
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * function LoginButton() {
 *   const handleLogin = async () => {
 *     const supabase = createClient()
 *     await supabase.auth.signInWithPassword({ email, password })
 *   }
 * }
 * ```
 *
 * WHY A FUNCTION INSTEAD OF A SINGLETON?
 * The browser client is safe to create multiple times - it reuses the same
 * underlying connection. Using a function makes the pattern consistent with
 * the server client (which MUST be created fresh for each request).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  );
}
