import { AuthModal } from "@/components/auth/auth-modal";
import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";

/**
 * Intercepted Join Route
 *
 * This renders when navigating to /join via client-side navigation.
 * Shows the signup form in a modal over the current page.
 */
export default function JoinModal() {
  return (
    <AuthModal>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-950 font-heading mb-2">
          Join the Community
        </h1>
        <p className="text-gray-600">
          Create your Turterra account to get started
        </p>
      </div>

      <SignupForm />

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-green-700 hover:text-green-900 transition-colors"
        >
          Log in
        </Link>
      </p>
    </AuthModal>
  );
}
