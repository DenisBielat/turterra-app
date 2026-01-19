'use client';

import Image from 'next/image';

export default function ComingSoon() {
  // Circle radius for text path - smaller = closer to logo
  const textRadius = 140;
  const viewBoxSize = 360;
  const center = viewBoxSize / 2;

  return (
    <div className="fixed inset-0 z-[9999] bg-green-950 flex items-center justify-center overflow-hidden">
      {/* Subtle radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,71,44,0.4)_100%)]" />

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
          <text
            fill="#33f590"
            fontSize="22"
            fontFamily="var(--font-outfit), system-ui, sans-serif"
            fontWeight="600"
            letterSpacing="0.15em"
          >
            <textPath href="#textCircle" startOffset="3%">
              TURTERRA
            </textPath>
          </text>
          <text
            fill="#33f590"
            fontSize="10"
            fontFamily="var(--font-outfit), system-ui, sans-serif"
          >
            <textPath href="#textCircle" startOffset="27%">
              ●
            </textPath>
          </text>
          <text
            fill="#33f590"
            fontSize="22"
            fontFamily="var(--font-outfit), system-ui, sans-serif"
            fontWeight="600"
            letterSpacing="0.15em"
          >
            <textPath href="#textCircle" startOffset="33%">
              COMING SOON
            </textPath>
          </text>
          <text
            fill="#33f590"
            fontSize="10"
            fontFamily="var(--font-outfit), system-ui, sans-serif"
          >
            <textPath href="#textCircle" startOffset="75%">
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
