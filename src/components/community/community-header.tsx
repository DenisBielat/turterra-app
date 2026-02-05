import Image from 'next/image';

/**
 * Community Header Component
 *
 * Hero section with Turterra logomark, title, description, and
 * decorative dark green background with curved line patterns.
 */
export function CommunityHeader() {
  return (
    <div className="relative overflow-hidden rounded-t-2xl">
      {/* Background: warm left side, dark green right side */}
      <div className="relative flex">
        {/* Left content area */}
        <div className="relative z-10 w-full md:w-1/2 bg-warm px-8 py-10 md:py-14">
          <Image
            src="/images/logomark-dark.png"
            alt=""
            width={80}
            height={80}
            className="mb-4"
          />
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-green-950 mb-3">
            Community
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-lg leading-relaxed">
            Connect with fellow turtle enthusiasts, share your experiences,
            and learn from the community. Join discussions, ask questions,
            and help others on their turtle journey.
          </p>
        </div>

        {/* Right decorative area */}
        <div className="hidden md:block w-1/2 bg-green-900 relative">
          {/* Decorative curved lines */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 600 400"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Concentric curved arcs */}
            <path
              d="M300 500 A300 300 0 0 1 600 200"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="60"
              fill="none"
            />
            <path
              d="M200 550 A400 400 0 0 1 650 100"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="60"
              fill="none"
            />
            <path
              d="M100 600 A500 500 0 0 1 700 0"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="60"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
