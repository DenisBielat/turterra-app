import TurtleProfileHero from "@/components/turtle-profile/hero-slider/turtle-profile-hero";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <main>
      {/* Other components or sections */}
      <TurtleProfileHero slug={params.slug} />
      {/* Add more components or sections as needed */}
    </main>
  );
}