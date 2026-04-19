import { useEffect } from 'react';

function getViewportSize() {
  const vv = window.visualViewport;
  return {
    width: Math.round(vv?.width ?? window.innerWidth),
    height: Math.round(vv?.height ?? window.innerHeight),
  };
}

function getRootPxVar(root, name, fallback) {
  const raw = getComputedStyle(root).getPropertyValue(name).trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function useViewportSystem() {
  useEffect(() => {
    const root = document.documentElement;
    const coarseQuery = window.matchMedia('(pointer: coarse)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let rafId = null;

    const sync = () => {
      const { width, height } = getViewportSize();
      const isMobile = width < 900;
      const isDesktopLike = !isMobile;
      const isReducedMotion = motionQuery.matches;
      const isCoarsePointer = coarseQuery.matches;

      const stickyTop = Number.parseFloat(getComputedStyle(root).getPropertyValue('--viewport-sticky-top')) || 0;
      const usableTop = isMobile ? 0 : stickyTop;
      const usableHeight = Math.max(height - usableTop, height * 0.72);

      root.style.setProperty('--viewport-width', `${width}px`);
      root.style.setProperty('--viewport-height', `${height}px`);
      root.style.setProperty('--viewport-sticky-top-resolved', `${Math.round(usableTop)}px`);
      root.style.setProperty('--viewport-usable-height', `${Math.round(usableHeight)}px`);
      root.dataset.pointer = isCoarsePointer ? 'coarse' : 'fine';
      root.dataset.motion = isReducedMotion ? 'reduce' : 'full';
      root.dataset.viewport = isDesktopLike ? 'desktop' : 'mobile';
    };

    const scheduleSync = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        sync();
      });
    };

    sync();

    const vv = window.visualViewport;
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('orientationchange', scheduleSync);
    vv?.addEventListener('resize', scheduleSync);
    vv?.addEventListener('scroll', scheduleSync);
    coarseQuery.addEventListener?.('change', scheduleSync);
    motionQuery.addEventListener?.('change', scheduleSync);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('orientationchange', scheduleSync);
      vv?.removeEventListener('resize', scheduleSync);
      vv?.removeEventListener('scroll', scheduleSync);
      coarseQuery.removeEventListener?.('change', scheduleSync);
      motionQuery.removeEventListener?.('change', scheduleSync);
    };
  }, []);
}
