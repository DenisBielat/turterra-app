import { AuthModal } from "@/components/auth/auth-modal";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import Link from "next/link";

/**
 * Intercepted Forgot Password Route
 *
 * This renders when navigating to /forgot-password via client-side navigation.
 * Shows the forgot password form in a modal over the current page.
 */
export default function ForgotPasswordModal() {
  return (
    <AuthModal>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-950 font-heading mb-2">
          Reset Password
        </h1>
        <p className="text-gray-600">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-gray-600">
        Remember your password?{" "}
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
