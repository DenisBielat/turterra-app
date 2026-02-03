/**
 * Onboarding Layout
 *
 * A dedicated full-screen layout for the onboarding flow.
 * No navbar or footer - just a clean, focused experience.
 * Uses bg-warm (#f2f0e7) with topographic pattern overlay.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-warm relative overflow-hidden">
      {/* Topographic pattern overlay - placeholder for user's custom asset */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='600' height='600' viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23556B2F' stroke-width='1.5'%3E%3Cellipse cx='300' cy='300' rx='280' ry='200' transform='rotate(-15 300 300)'/%3E%3Cellipse cx='300' cy='300' rx='240' ry='170' transform='rotate(-15 300 300)'/%3E%3Cellipse cx='300' cy='300' rx='200' ry='140' transform='rotate(-15 300 300)'/%3E%3Cellipse cx='300' cy='300' rx='160' ry='110' transform='rotate(-15 300 300)'/%3E%3Cellipse cx='300' cy='300' rx='120' ry='80' transform='rotate(-15 300 300)'/%3E%3Cellipse cx='300' cy='300' rx='80' ry='50' transform='rotate(-15 300 300)'/%3E%3Cellipse cx='150' cy='500' rx='180' ry='120' transform='rotate(20 150 500)'/%3E%3Cellipse cx='150' cy='500' rx='140' ry='90' transform='rotate(20 150 500)'/%3E%3Cellipse cx='150' cy='500' rx='100' ry='60' transform='rotate(20 150 500)'/%3E%3Cellipse cx='500' cy='100' rx='160' ry='100' transform='rotate(-30 500 100)'/%3E%3Cellipse cx='500' cy='100' rx='120' ry='70' transform='rotate(-30 500 100)'/%3E%3Cellipse cx='500' cy='100' rx='80' ry='40' transform='rotate(-30 500 100)'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "600px 600px",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
