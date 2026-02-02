import { AuthModal } from "@/components/auth/auth-modal";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

/**
 * Intercepted Reset Password Route
 *
 * This renders when navigating to /reset-password via client-side navigation.
 * Shows the reset password form in a modal over the current page.
 */
export default function ResetPasswordModal() {
  return (
    <AuthModal>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-950 font-heading mb-2">
          Set New Password
        </h1>
        <p className="text-gray-600">Enter your new password below</p>
      </div>

      <ResetPasswordForm />
    </AuthModal>
  );
}
