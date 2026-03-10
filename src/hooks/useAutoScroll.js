import { useEffect, useRef } from 'react';

/**
 * Starts an rAF loop that auto-scrolls a container back and forth.
 * axis:  'x' | 'y'
 * speed: px per frame
 * Pauses when the user grabs the container (mousedown / touchstart).
 */
export default function useAutoScroll(containerRef, axis = 'x', speed = 0.6) {
  const pausedRef    = useRef(false);
  const directionRef = useRef(1);
  const rafRef       = useRef(null);
  const resumeTimer  = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getScroll    = () => axis === 'x' ? el.scrollLeft  : el.scrollTop;
    const setScroll    = (v) => { if (axis === 'x') el.scrollLeft = v; else el.scrollTop = v; };
    const getMaxScroll = () =>
      axis === 'x'
        ? el.scrollWidth  - el.clientWidth
        : el.scrollHeight - el.clientHeight;

    const tick = () => {
      if (!pausedRef.current) {
        const max = getMaxScroll();
        if (getScroll() >= max) directionRef.current = -1;
        else if (getScroll() <= 0) directionRef.current = 1;
        setScroll(getScroll() + speed * directionRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    // Wait for images to load before starting
    const images  = Array.from(el.querySelectorAll('img'));
    const pending = images.filter((img) => !img.complete);
    if (pending.length === 0) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      let loaded = 0;
      const onLoad = () => {
        loaded++;
        if (loaded >= pending.length) rafRef.current = requestAnimationFrame(tick);
      };
      pending.forEach((img) => {
        img.addEventListener('load',  onLoad, { once: true });
        img.addEventListener('error', onLoad, { once: true });
      });
    }

    const pause  = () => { pausedRef.current = true; };
    const resume = () => {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(() => { pausedRef.current = false; }, 1200);
    };

    el.addEventListener('mousedown',  pause);
    el.addEventListener('mouseup',    resume);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause,  { passive: true });
    el.addEventListener('touchend',   resume, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resumeTimer.current);
      el.removeEventListener('mousedown',  pause);
      el.removeEventListener('mouseup',    resume);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend',   resume);
    };
  }, [containerRef, axis, speed]);
}
