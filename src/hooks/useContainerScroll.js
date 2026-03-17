import { useState, useCallback, useEffect } from 'react';

/**
 * Tracks how far a container has scrolled into the viewport and returns
 * a CSS-ready transform object (rotateX, scale, translateY).
 *
 * Used by Services and Contact to give cards a "flip-into-place" entrance.
 */
export default function useContainerScroll(wrapperRef) {
  const [transform, setTransform] = useState({
    rotateX:   18,
    scale:     0.88,
    translateY: 0,
  });

  const onScroll = useCallback(() => {
    if (!wrapperRef.current) return;

    const { top } = wrapperRef.current.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, 1 - top / (window.innerHeight * 0.8)));

    setTransform({
      rotateX:    18 * (1 - progress),
      scale:      0.88 + 0.12 * progress,
      translateY: -40 * (1 - progress),
    });
  }, [wrapperRef]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return transform;
}
