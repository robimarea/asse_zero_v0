import { useEffect, useRef, useState } from 'react';
import styles from './Cursor.module.css';

/**
 * Cursor
 *
 * Replaces the native cursor with two layered elements:
 *  • dot  — 6 px circle, follows the mouse instantly
 *  • ring — 36 px outline circle, lags behind with a lerp
 *
 * The cursor changes shape based on what's under the pointer:
 *  • 'hover'  — links, buttons       → dot disappears, ring expands
 *  • 'view'   — images, video cards  → larger ring + teal fill
 *  • 'drag'   — draggable containers → dashed ring
 *  • 'hidden' — cursor left the window
 *
 * Add data-cursor="view" or data-cursor="drag" to any element to
 * opt into those states.
 *
 * Only rendered on fine-pointer (mouse) devices — hidden on touch
 * via CSS media query.
 */
export default function Cursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const rafRef   = useRef(null);
  const mouse    = useRef({ x: -200, y: -200 });
  const ringPos  = useRef({ x: -200, y: -200 });
  const [type, setType] = useState('default');

  /* ── Dot: tracks mouse instantly ────────────────────────────── */
  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* ── Ring: lerp toward mouse on each frame ───────────────────── */
  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, 0.1);
      ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, 0.1);
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── Type detection from hovered element ────────────────────── */
  useEffect(() => {
    const onOver = (e) => {
      const el = e.target;
      if (el.closest('[data-cursor="view"]'))          { setType('view');    return; }
      if (el.closest('[data-cursor="drag"]'))          { setType('drag');    return; }
      if (el.closest('a, button, [role="button"]'))    { setType('hover');   return; }
      setType('default');
    };
    window.addEventListener('mouseover', onOver);
    return () => window.removeEventListener('mouseover', onOver);
  }, []);

  /* ── Hide when cursor leaves the browser window ─────────────── */
  useEffect(() => {
    const hide = () => setType('hidden');
    const show = () => setType('default');
    document.documentElement.addEventListener('mouseleave', hide);
    document.documentElement.addEventListener('mouseenter', show);
    return () => {
      document.documentElement.removeEventListener('mouseleave', hide);
      document.documentElement.removeEventListener('mouseenter', show);
    };
  }, []);

  /* ── Tell <body> to hide the native cursor ───────────────────── */
  useEffect(() => {
    document.body.classList.add('custom-cursor-active');
    return () => document.body.classList.remove('custom-cursor-active');
  }, []);

  return (
    <>
      <div ref={dotRef}  className={`${styles.dot}  ${styles[type]}`} />
      <div ref={ringRef} className={`${styles.ring} ${styles[type]}`} />
    </>
  );
}
