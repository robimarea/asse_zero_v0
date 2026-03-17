import { createContext, useContext, useRef, useCallback } from 'react';
import { gsap } from 'gsap';

/**
 * TransitionContext
 *
 * Provides a `transit(callback)` function that:
 *  1. Sweeps a full-screen panel IN from the left (0.55 s)
 *  2. Fires `callback` (typically navigate(to))
 *  3. Sweeps the panel OUT to the right (0.55 s)
 *
 * The panel is a sibling of the app tree, rendered here so it sits
 * above everything (z-index 9998) without interfering with layout.
 *
 * Usage:
 *   const transit = usePageTransition();
 *   transit(() => navigate('/work'));
 */
const TransitionCtx = createContext(null);

export const usePageTransition = () => useContext(TransitionCtx);

export function TransitionProvider({ children }) {
  const panelRef = useRef(null);

  const transit = useCallback((callback) => {
    const panel = panelRef.current;
    if (!panel) { callback?.(); return; }

    gsap.timeline()
      /* Reset & make visible */
      .set(panel, {
        visibility:      'visible',
        scaleX:          0,
        transformOrigin: 'left center',
      })
      /* Sweep IN */
      .to(panel, { scaleX: 1, duration: 0.55, ease: 'expo.inOut' })
      /* Fire the navigation callback (new route renders behind the panel) */
      .call(() => callback?.())
      /* Brief hold so the new page has time to paint */
      .to({}, { duration: 0.08 })
      /* Sweep OUT — pivot flips to the right edge */
      .set(panel, { transformOrigin: 'right center' })
      .to(panel, { scaleX: 0, duration: 0.55, ease: 'expo.inOut' })
      .set(panel, { visibility: 'hidden' });
  }, []);

  return (
    <TransitionCtx.Provider value={transit}>
      {children}

      {/* Full-screen transition panel — lives above all content */}
      <div
        ref={panelRef}
        aria-hidden="true"
        style={{
          position:       'fixed',
          inset:          0,
          background:     'var(--teal-600)',
          zIndex:         9998,
          visibility:     'hidden',
          pointerEvents:  'none',
          transformOrigin:'left center',
        }}
      />
    </TransitionCtx.Provider>
  );
}
