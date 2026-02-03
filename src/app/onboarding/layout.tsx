/**
 * Onboarding Layout
 *
 * A dedicated full-screen layout for the onboarding flow.
 * No navbar or footer - just a clean, focused experience.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-amber-50">
      {children}
    </div>
  );
}
