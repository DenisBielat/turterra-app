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
      {/* Topographic pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none bg-center"
        style={{
          backgroundImage: "url(/images/textures/topo-2-dark.png)",
          backgroundSize: "150% auto",
          backgroundPosition: "center -120%",
          transform: "scale(1) rotate(0deg)",
          transformOrigin: "center center",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
