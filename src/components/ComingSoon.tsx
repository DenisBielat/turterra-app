'use client';

import Image from 'next/image';

export default function ComingSoon() {
  // Circle radius for text path - smaller = closer to logo
  const textRadius = 140;
  const viewBoxSize = 360;
  const center = viewBoxSize / 2;

  return (
    <div className="fixed inset-0 z-[9999] bg-green-950 flex items-center justify-center overflow-hidden">
      {/* Radial gradient: green-900 center fading to green-950 edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#00472c_0%,_#16261f_70%)]" />

      <div className="relative w-[320px] h-[320px] sm:w-[360px] sm:h-[360px]">
        {/* Rotating text circle */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin-slow"
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
            fill="#33f590"
            fontSize="22"
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
            fill="#33f590"
            fontSize="10"
            fontFamily="var(--font-outfit), system-ui, sans-serif"
          >
            <textPath href="#textCircle" startOffset="50%">
              ●
            </textPath>
          </text>
          {/* TURTERRA at bottom (centered at 75%) */}
          <text
            fill="#33f590"
            fontSize="22"
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
            fill="#33f590"
            fontSize="10"
            fontFamily="var(--font-outfit), system-ui, sans-serif"
          >
            <textPath href="#textCircle" startOffset="0%">
              ●
            </textPath>
          </text>
        </svg>

        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] relative">
            <Image
              src="/images/logomark-green-500.png"
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
