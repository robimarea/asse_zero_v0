/**
 * DotField — interactive dot grid background
 * Props: dotRadius, dotSpacing, cursorRadius, cursorForce, waveAmplitude, gradientFrom, gradientTo
 */
import { useEffect, useRef, memo } from 'react';
import styles from './DotGrid.module.css';

const TWO_PI = Math.PI * 2;

function resolveCanvasColor(value) {
  if (typeof value !== 'string') return value;
  const match = value.match(/^var\((--[^),\s]+)\)$/);
  if (!match) return value;
  return getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim() || value;
}

function randomDotSize() {
  return Number((Math.random() * 8).toFixed(2));
}

/* ── COSTANTI DI CONFIGURAZIONE ────────────────────────────── */
const DOT_GRID_CONFIG = {
  dotRadius:     5,
  dotSpacing:    32,
  cursorRadius:  100,
  cursorForce:   0.08,
  waveAmplitude: 3,
  gradientFrom:  'var(--color-bordeaux-vibrant)', 
  gradientTo:    'var(--color-bordeaux-vibrant)',
};

const DotField = memo(({
  dotRadius     = DOT_GRID_CONFIG.dotRadius,
  dotSpacing    = DOT_GRID_CONFIG.dotSpacing,
  cursorRadius  = DOT_GRID_CONFIG.cursorRadius,
  cursorForce   = DOT_GRID_CONFIG.cursorForce,
  waveAmplitude = DOT_GRID_CONFIG.waveAmplitude,
  gradientFrom  = DOT_GRID_CONFIG.gradientFrom,
  gradientTo    = DOT_GRID_CONFIG.gradientTo,
}) => {
  const canvasRef   = useRef(null);
  const dotsRef     = useRef([]);
  const mouseRef    = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 });
  const rafRef      = useRef(null);
  const sizeRef     = useRef({ w: 0, h: 0, offsetX: 0, offsetY: 0 });
  const engagement  = useRef(0);
  const propsRef    = useRef({});
  const rebuildRef  = useRef(null);

  useEffect(() => {
    propsRef.current = {
      dotRadius, dotSpacing, cursorRadius, cursorForce, waveAmplitude,
      gradientFrom: resolveCanvasColor(gradientFrom),
      gradientTo: resolveCanvasColor(gradientTo),
    };
  }, [dotRadius, dotSpacing, cursorRadius, cursorForce, waveAmplitude, gradientFrom, gradientTo]);

  useEffect(() => {
    const canvas  = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let resizeTimer;

    /* ── ridimensiona ──────────────────────────────────────── */
    function resize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(doResize, 100);
    }

    function doResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h, offsetX: 0, offsetY: 0 };
      buildDots(w, h);
    }

    /* ── griglia di punti ─────────────────────────────────── */
    function buildDots(w, h) {
      const p    = propsRef.current;
      const step = p.dotRadius + p.dotSpacing;
      const cols = Math.floor(w / step);
      const rows = Math.floor(h / step);
      const padX = (w % step) / 2;
      const padY = (h % step) / 2;
      const dots = new Array(rows * cols);
      let idx = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          dots[idx++] = {
            ax,
            ay,
            sx: ax,
            sy: ay,
            vx: 0,
            vy: 0,
            x: ax,
            y: ay,
            size: randomDotSize(),
          };
        }
      }
      dotsRef.current = dots;
    }

    /* ── mouse ───────────────────────────────────────────── */
    function onMouseMove(e) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    }

    function updateMouseSpeed() {
      const m  = mouseRef.current;
      const dx = m.prevX - m.x;
      const dy = m.prevY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      m.speed += (dist - m.speed) * 0.5;
      if (m.speed < 0.001) m.speed = 0;
      m.prevX = m.x;
      m.prevY = m.y;
    }

    const speedInterval = setInterval(updateMouseSpeed, 20);
    let frameCount = 0;

    /* ── tick ─────────────────────────────────────────────── */
    function tick() {
      frameCount++;
      const dots = dotsRef.current;
      const m    = mouseRef.current;
      const { w, h } = sizeRef.current;
      const p    = propsRef.current;
      const len  = dots.length;
      const t    = frameCount * 0.05;

      /* engagement basato sulla velocità del mouse */
      const targetEngagement = Math.min(m.speed / 2, 1);
      engagement.current += (targetEngagement - engagement.current) * 0.15;
      if (engagement.current < 0.001) engagement.current = 0;
      const eng = engagement.current;

      ctx.clearRect(0, 0, w, h);

      /* gradiente lineare per tutti i dot */
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, p.gradientFrom);
      grad.addColorStop(1, p.gradientTo);
      ctx.fillStyle = grad;

      const cr   = p.cursorRadius;
      const crSq = cr * cr;
      ctx.beginPath();

      for (let i = 0; i < len; i++) {
        const d  = dots[i];
        const dx = m.x - d.ax;
        const dy = m.y - d.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < crSq && eng > 0.01) {
          const dist  = Math.sqrt(distSq);
          const angle = Math.atan2(dy, dx);
          const move  = (500 / dist) * (m.speed * p.cursorForce);
          d.vx += Math.cos(angle) * -move;
          d.vy += Math.sin(angle) * -move;
        }

        d.vx *= 0.9;
        d.vy *= 0.9;
        d.x   = d.ax + d.vx;
        d.y   = d.ay + d.vy;
        d.sx += (d.x - d.sx) * 0.1;
        d.sy += (d.y - d.sy) * 0.1;

        let drawX = d.sx;
        let drawY = d.sy;

        /* wave */
        if (p.waveAmplitude > 0) {
          drawY += Math.sin(d.ax * 0.03 + t)        * p.waveAmplitude;
          drawX += Math.cos(d.ay * 0.03 + t * 0.7)  * p.waveAmplitude * 0.5;
        }

        const rad = d.size / 2;
        ctx.moveTo(drawX + rad, drawY);
        ctx.arc(drawX, drawY, rad, 0, TWO_PI);
      }

      ctx.fill();
      rafRef.current = requestAnimationFrame(tick);
    }

    doResize();
    window.addEventListener('resize',     resize);
    window.addEventListener('mousemove',  onMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    rebuildRef.current = () => {
      const { w, h } = sizeRef.current;
      if (w > 0 && h > 0) buildDots(w, h);
    };

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearInterval(speedInterval);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize',    resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rebuildRef.current?.();
  }, [dotRadius, dotSpacing]);

  return (
    <div className={styles.dotGrid} aria-hidden="true">
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
});

DotField.displayName = 'DotField';

export default function DotGrid() {
  return (
    <DotField
      dotRadius={DOT_GRID_CONFIG.dotRadius}
      dotSpacing={DOT_GRID_CONFIG.dotSpacing}
      waveAmplitude={DOT_GRID_CONFIG.waveAmplitude}
      cursorRadius={DOT_GRID_CONFIG.cursorRadius}
      cursorForce={DOT_GRID_CONFIG.cursorForce}
      gradientFrom={DOT_GRID_CONFIG.gradientFrom}
      gradientTo={DOT_GRID_CONFIG.gradientTo}
    />
  );
}
