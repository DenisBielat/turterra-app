import Link from "next/link";

/**
 * Auth Error Page
 *
 * Displayed when something goes wrong during authentication:
 * - Invalid or expired email confirmation link
 * - Failed password reset
 * - Other auth flow errors
 */
export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-warm flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-950 font-outfit mb-2">
            Authentication Error
          </h1>
          <p className="text-green-800">
            Something went wrong during sign in. This can happen if:
          </p>
        </div>

        <ul className="text-left text-green-800 mb-8 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">•</span>
            <span>The confirmation link has expired</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">•</span>
            <span>The link has already been used</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">•</span>
            <span>The link was incomplete or corrupted</span>
          </li>
        </ul>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
          >
            Go to Login
          </Link>
          <Link
            href="/"
            className="block w-full py-3 px-4 border-2 border-green-600 text-green-600 font-semibold rounded-full hover:bg-green-50 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
