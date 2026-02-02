import { AuthModal } from "@/components/auth/auth-modal";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

/**
 * Intercepted Login Route
 *
 * This renders when navigating to /login via client-side navigation.
 * Shows the login form in a modal over the current page.
 */
export default function LoginModal() {
  return (
    <AuthModal>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-950 font-heading mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600">Log in to your Turterra account</p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/join"
          className="font-semibold text-green-700 hover:text-green-900 transition-colors"
        >
          Join the Community
        </Link>
      </p>
    </AuthModal>
  );
}
