/**
 * src/utils/math.js
 * ─────────────────────────────────────────────────────────────
 * Pure utility functions for positioning, math curves, and
 * cinematic UI animations. Centralizing these keeps React
 * components clean and concise.
 */

/**
 * Custom Quartic Ease-Out curve.
 * Starts extremely fast and decelerates into a buttery stop.
 * Used for buttery magnetic scrolling or cinematic entry.
 */
export const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

/**
 * Standard Bell Curve (Gaussian-ish) centered at 0.
 * Used for proximity-based scaling / opacity.
 * @param {number} x - Distance from center
 * @param {number} spread - Multiplier to control the width of the bell (higher = sharper, narrower bell)
 */
export const bellCurve = (x, spread = 3.5) => {
  return Math.exp(-x * x * spread);
};

/**
 * Vertical Path: Maps progress t (0 to 1) to a straight centered line.
 * Used for simple vertical gallery positioning.
 */
export const verticalPath = (t) => {
  return {
    x: 50,         // Always centered horizontally
    y: t * 100,    // Linear mapping vertically mapping 0->1 to 0->100%
  };
};

/**
 * Pronounced S-Curve using a Cubic Bézier.
 * Maps progress t (0 to 1) to an x/y coordinate on the curve.
 * Top-left → hard swoop downwards → pull back → bottom right.
 */
export const bezierPoint = (t) => {
  const P0 = { x: 3,  y: 8  };   // start top-left
  const P1 = { x: 5,  y: 55 };   // control 1: pulls hard downward early
  const P2 = { x: 55, y: 30 };   // control 2: pulls back up, creating the S-swoop
  const P3 = { x: 88, y: 82 };   // end bottom-right

  const mt = 1 - t;
  return {
    x: mt*mt*mt*P0.x + 3*mt*mt*t*P1.x + 3*mt*t*t*P2.x + t*t*t*P3.x,
    y: mt*mt*mt*P0.y + 3*mt*mt*t*P1.y + 3*mt*t*t*P2.y + t*t*t*P3.y,
  };
};
