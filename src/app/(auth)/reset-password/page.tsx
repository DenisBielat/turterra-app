import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Set New Password | Turterra",
  description: "Set a new password for your Turterra account",
};

export default function ResetPasswordPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-950 font-heading mb-2">
          Set New Password
        </h1>
        <p className="text-gray-600">Enter your new password below</p>
      </div>

      <ResetPasswordForm />
    </>
  );
}
