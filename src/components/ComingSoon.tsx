'use client';

import Image from 'next/image';

export default function ComingSoon() {
  // Circle radius for text path - smaller = closer to logo
  const textRadius = 105;
  const viewBoxSize = 270;
  const center = viewBoxSize / 2;

  return (
    <div className="fixed inset-0 z-[9999] bg-warm flex items-center justify-center overflow-hidden">
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_transparent_50%,_rgba(0,0,0,0.03)_100%)]" />

      <div className="relative w-[240px] h-[240px] sm:w-[270px] sm:h-[270px] drop-shadow-lg">
        {/* Rotating text circle */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin-slow drop-shadow-md"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        >
          <defs>
            <path
              id="textCircle"
              d={`M ${center}, ${center} m -${textRadius}, 0 a ${textRadius},${textRadius} 0 1,1 ${textRadius * 2},0 a ${textRadius},${textRadius} 0 1,1 -${textRadius * 2},0`}
              fill="none"
            />
          </defs>
          {/* COMING SOON at top (centered at 25%) */}
          <text
            fill="#00472c"
            fontSize="16"
            fontFamily="var(--font-outfit), system-ui, sans-serif"
            fontWeight="600"
            letterSpacing="0.15em"
          >
            <textPath href="#textCircle" startOffset="14%">
              COMING SOON
            </textPath>
          </text>
          {/* Dot at right (50%) */}
          <text
            fill="#00472c"
            fontSize="8"
            fontFamily="var(--font-outfit), system-ui, sans-serif"
          >
            <textPath href="#textCircle" startOffset="50%">
              ●
            </textPath>
          </text>
          {/* TURTERRA at bottom (centered at 75%) */}
          <text
            fill="#00472c"
            fontSize="16"
            fontFamily="var(--font-outfit), system-ui, sans-serif"
            fontWeight="600"
            letterSpacing="0.15em"
          >
            <textPath href="#textCircle" startOffset="66%">
              TURTERRA
            </textPath>
          </text>
          {/* Dot at left (0%) */}
          <text
            fill="#00472c"
            fontSize="8"
            fontFamily="var(--font-outfit), system-ui, sans-serif"
          >
            <textPath href="#textCircle" startOffset="0%">
              ●
            </textPath>
          </text>
        </svg>

        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[105px] h-[105px] sm:w-[120px] sm:h-[120px] relative drop-shadow-sm">
            <Image
              src="/images/logomark-dark.png"
              alt="Turterra Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
