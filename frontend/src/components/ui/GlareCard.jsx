import { useRef, useState, useCallback } from 'react';
import styles from './GlareCard.module.css';

/**
 * GlareCard
 *
 * Wraps any content in a card with:
 *  - Mouse-follow tilt (rotateX / rotateY via inline style)
 *  - Radial glare overlay that tracks the cursor
 *  - Scroll-driven 3-D entrance via the `scrollTransform` prop
 *    (supplied by the `useContainerScroll` hook)
 *
 * Props:
 *  children        — card content
 *  scrollTransform — { rotateX, scale, translateY } from useContainerScroll
 *  bg              — CSS background value for the card surface (optional)
 *  color           — CSS text color (optional)
 *  className       — extra class names forwarded to the root element
 *  style           — extra inline styles forwarded to the root element
 */
export default function GlareCard({
  children,
  scrollTransform,
  bg,
  color,
  className = '',
  style = {},
}) {
  const cardRef = useRef(null);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [tilt,  setTilt]  = useState({ rx: 0, ry: 0 });

  const onMouseMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left)  / rect.width;
    const py = (e.clientY - rect.top)   / rect.height;

    setTilt({ rx: (py - 0.5) * -8, ry: (px - 0.5) * 8 });
    setGlare({ x: px * 100, y: py * 100, opacity: 0.18 });
  }, []);

  const onMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
    setGlare((g) => ({ ...g, opacity: 0 }));
  }, []);

  const transform = `
    perspective(1000px)
    rotateX(${scrollTransform.rotateX + tilt.rx}deg)
    rotateY(${tilt.ry}deg)
    scale(${scrollTransform.scale})
    translateY(${scrollTransform.translateY}px)
  `;

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${className}`}
      style={{ transform, background: bg, color, ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Radial glare overlay — follows the cursor */}
      <div
        aria-hidden="true"
        className={styles.glare}
        style={{
          background: `radial-gradient(
            circle at ${glare.x}% ${glare.y}%,
            rgba(255,255,255,${glare.opacity}) 0%,
            rgba(255,255,255,0.03) 40%,
            transparent 70%
          )`,
        }}
      />
      {children}
    </div>
  );
}
