import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js Proxy
 *
 * This runs on EVERY request that matches the `config.matcher` pattern below.
 * Its main job is to keep the user's auth session fresh.
 *
 * WHAT IT DOES:
 * 1. Checks if the user has a valid session cookie
 * 2. Refreshes the session token if it's about to expire
 * 3. Passes the (possibly refreshed) session to your pages
 *
 * WITHOUT THIS:
 * - Users would get logged out unexpectedly when tokens expire
 * - Server Components couldn't reliably check authentication
 * - Session state would be inconsistent between client and server
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Route Matcher Configuration
 *
 * This regex tells Next.js which routes should run through the proxy.
 * We want the proxy to run on almost everything EXCEPT:
 * - Static files (_next/static)
 * - Image optimization files (_next/image)
 * - Favicon
 * - Public assets with file extensions (images, fonts, etc.)
 *
 * WHY EXCLUDE THESE?
 * Static files don't need authentication. Running the proxy on them
 * would just slow things down for no benefit.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (.svg, .png, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
