import TurtleProfileHero from "@/components/turtle-profile/hero-slider/turtle-profile-hero";

type Props = {
  params: {
    slug: string
  }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function Page({ params }: Props) {
  return (
    <main>
      {/* Other components or sections */}
      <TurtleProfileHero slug={params.slug} />
      {/* Add more components or sections as needed */}
    </main>
  );
}