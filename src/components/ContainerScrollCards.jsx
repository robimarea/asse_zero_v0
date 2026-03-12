/**
 * ContainerScrollCards
 *
 * Replicates the Aceternity "ContainerScroll" mechanic for a grid of cards.
 * As the section enters the viewport the grid starts rotated back on the X-axis
 * (as if you're looking at it from slightly above/behind) and gradually flattens
 * to fully upright — giving the cinematic "flip into place" feel.
 *
 * How it works:
 *  1. A ref is attached to the outer wrapper.
 *  2. Framer Motion's useScroll() tracks how far through that element we've scrolled,
 *     returning a 0→1 progress value (scrollYProgress).
 *  3. useTransform() maps that progress to CSS values:
 *       - rotateX  : 28° (tilted back) → 0° (flat, facing viewer)
 *       - scale    : 0.82 → 1          (grows as it flattens)
 *       - opacity  : 0   → 1          (fades in while tilting)
 *       - translateY: 60px → 0px      (rises slightly)
 *  4. A wrapper with `perspective` provides the 3-D context for rotateX to look real.
 *
 * The `offset` option ["start 0.85", "start 0.2"] means:
 *   – animation begins when the top of the section is 85% from the viewport top (just entering)
 *   – animation finishes when the top of the section is 20% from the top (well in view)
 */

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';

export default function ContainerScrollCards({ children, style, className }) {
  const ref = useRef(null);

  /* Track scroll progress relative to this element's position in the page */
  const { scrollYProgress } = useScroll({
    target: ref,
    /* Start: element top hits 90% down the viewport (just barely visible)
       End  : element top hits 10% down the viewport (comfortably in view)  */
    offset: ['start 0.9', 'start 0.1'],
  });

  /* Smooth out any jitter with a gentle spring — makes it feel more organic */
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  /* ── Transform mappings ────────────────────────────────────────────────── */
  const rotateX = useTransform(smoothProgress, [0, 1], [28, 0]);
  const scale   = useTransform(smoothProgress, [0, 1], [0.82, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.25], [0, 1]);
  const translateY = useTransform(smoothProgress, [0, 1], [60, 0]);

  return (
    /*
     * The outer div is the scroll target and also provides the 3-D perspective
     * context. `perspective` must be on a parent of the element that has
     * `rotateX` — otherwise rotateX has no visible 3-D effect.
     */
    <div
      ref={ref}
      className={className}
      style={{
        perspective: '1100px',
        perspectiveOrigin: '50% 40%',
        ...style,
      }}
    >
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          translateY,
          /*
           * transformStyle: 'preserve-3d' keeps any children in the same 3-D space,
           * and will-change hints the browser to promote this layer to GPU compositing
           * so the animation stays silky-smooth.
           */
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
