/**
 * useChapterSnap.js
 * ─────────────────────────────────────────────────────────────
 * Magnetic chapter snapping: when the user stops scrolling,
 * the nearest [data-chapter] element slides into view.
 *
 * Uses a custom requestAnimationFrame for a precise "ease-out"
 * animation (starts fast, ends slow).
 */
import { useEffect, useRef } from 'react';
import { easeOutQuart } from '@utils/math';

const DEBOUNCE_MS   = 250;       // ms of no-scroll before snapping (raddoppiato)
const DEAD_ZONE     = 60;        // px — don't snap if already "close enough"
const EDGE_GUARD    = 40;        // px — skip snap near top/bottom of page
const SNAP_DURATION = 900;       // ms duration of the snap animation

export default function useChapterSnap() {
  const timer      = useRef(null);
  const isSnapping = useRef(false);
  const userActive = useRef(false);  // true while wheel/touch is active
  const animFrame  = useRef(null);   // ref for requestAnimationFrame

  useEffect(() => {
    /* ── Helpers ───────────────────────────────────────────── */
    const getChapters = () =>
      Array.from(document.querySelectorAll('[data-chapter]'));

    const nearestChapter = () => {
      const chapters = getChapters();
      if (!chapters.length) return null;

      const viewCenter = window.innerHeight / 2;
      let best = null;
      let bestDist = Infinity;

      for (const el of chapters) {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = Math.abs(elCenter - viewCenter);

        if (dist < bestDist) {
          bestDist = dist;
          best = { el, dist, rect };
        }
      }
      return best;
    };

    /* ── Custom Scroll Animation ───────────────────────────── */
    const smoothScrollTo = (targetY) => {
      const startY = window.scrollY;
      const distance = targetY - startY;
      let startTime = null;

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const rawProgress = Math.min(timeElapsed / SNAP_DURATION, 1);
        
        // Applica easing (veloce all'inizio, lento alla fine)
        const easedProgress = easeOutQuart(rawProgress);
        
        window.scrollTo(0, startY + distance * easedProgress);

        if (timeElapsed < SNAP_DURATION) {
          animFrame.current = requestAnimationFrame(animation);
        } else {
          isSnapping.current = false;
        }
      };

      isSnapping.current = true;
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
      animFrame.current = requestAnimationFrame(animation);
    };

    const snapToNearest = () => {
      if (userActive.current) return;  // don't snap while user is actively scrolling

      const target = nearestChapter();
      if (!target) return;

      // Skip if already well-centered (within dead zone)
      if (target.dist < DEAD_ZONE) return;

      // Skip near page edges
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;
      if (scrollY < EDGE_GUARD || scrollY > maxScroll - EDGE_GUARD) return;

      // Skip for very tall sections
      if (target.rect.height > window.innerHeight * 2) return;

      // Calculate where to scroll so the chapter centers in the viewport
      const elCenter = target.rect.top + target.rect.height / 2;
      const viewCenter = window.innerHeight / 2;
      const scrollTarget = window.scrollY + (elCenter - viewCenter);

      smoothScrollTo(scrollTarget);
    };

    /* ── Scroll listener ──────────────────────────────────── */
    const onScroll = () => {
      if (isSnapping.current) return;  // ignore scroll events from our own snap

      clearTimeout(timer.current);
      timer.current = setTimeout(snapToNearest, DEBOUNCE_MS);
    };

    /* ── Track user interaction ───────────────────────────── */
    const cancelSnap = () => {
      userActive.current = true;
      clearTimeout(timer.current);
      if (animFrame.current) {
        cancelAnimationFrame(animFrame.current);
        isSnapping.current = false;
      }
    };

    const onWheelStart  = () => cancelSnap();
    const onWheelEnd    = () => {
      userActive.current = false;
      clearTimeout(timer.current);
      timer.current = setTimeout(snapToNearest, DEBOUNCE_MS);
    };

    let wheelEndTimer = null;
    const onWheel = () => {
      onWheelStart();
      clearTimeout(wheelEndTimer);
      wheelEndTimer = setTimeout(onWheelEnd, 150);
    };

    const onTouchStart = () => cancelSnap();
    const onTouchEnd   = () => {
      userActive.current = false;
      clearTimeout(timer.current);
      timer.current = setTimeout(snapToNearest, DEBOUNCE_MS + 100);
    };

    /* ── Attach ───────────────────────────────────────────── */
    window.addEventListener('scroll',     onScroll,     { passive: true });
    window.addEventListener('wheel',      onWheel,      { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend',   onTouchEnd,   { passive: true });

    return () => {
      clearTimeout(timer.current);
      clearTimeout(wheelEndTimer);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
      window.removeEventListener('scroll',     onScroll);
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend',   onTouchEnd);
    };
  }, []);
}
