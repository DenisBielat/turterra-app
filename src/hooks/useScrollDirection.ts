import { useState, useEffect } from 'react';

type ScrollDirection = 'up' | 'down' | null;

interface UseScrollDirectionReturn {
  scrollDirection: ScrollDirection;
  isAtTop: boolean;
}

export function useScrollDirection(threshold: number = 10): UseScrollDirectionReturn {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Check if at top of page
      setIsAtTop(scrollY < threshold);

      // Determine scroll direction
      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false;
        return;
      }

      setScrollDirection(scrollY > lastScrollY ? 'down' : 'up');
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return { scrollDirection, isAtTop };
}
