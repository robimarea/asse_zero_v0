import { useEffect, useState, useRef } from 'react';
import styles from './LoadingScreen.module.css';

/* ── Timing constants (ms) ─────────────────────────────────────────────── */
const COUNT_DURATION = 2800; // 0 → 100 animation
const HOLD_AFTER     =  350; // pause at 100 % before exit
const CURTAIN_DELAY  =  200; // stagger between the two curtain panels
const TOTAL_UNMOUNT  = 1400; // time until the component removes itself

/**
 * LoadingScreen
 *
 * Shows a counter (0 → 100 %) with a clip-reveal logo, then sweeps away
 * with a two-panel curtain animation.
 *
 * `onComplete` is optional — it is called once the curtain has fully exited.
 */
export default function LoadingScreen({ onComplete }) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState('enter'); // 'enter' | 'exit'
  const rafRef = useRef(null);

  /* ── Eased counter 0 → 100 ─────────────────────────────────── */
  useEffect(() => {
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / COUNT_DURATION, 1);
      // Cubic ease-in-out
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      setCount(Math.round(eased * 100));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setPhase('exit');
          if (typeof onComplete === 'function') {
            setTimeout(onComplete, TOTAL_UNMOUNT);
          }
        }, HOLD_AFTER);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  const isExit = phase === 'exit';

  return (
    <div className={styles.root}>

      {/* Panel A — slides UP on exit */}
      <div className={`${styles.panel} ${styles.panelA} ${isExit ? styles.panelAExit : ''}`}>
        <span className={styles.sideL}>PRODUCTION</span>
        <span className={styles.sideR}>2025 – 2026</span>

        <div className={styles.core}>
          <div className={styles.lineTop}>
            <div className={styles.lineInner} style={{ transform: `scaleX(${count / 100})` }} />
          </div>

          <div className={styles.middle}>
            <div className={styles.counterWrap}>
              <span className={styles.counter}>{String(count).padStart(2, '0')}</span>
              <span className={styles.sup}>%</span>
            </div>

            {/* Logo clips in as counter rises */}
            <div className={styles.logoWrap}>
              <div className={styles.logoClip} style={{ clipPath: `inset(0 ${100 - count}% 0 0)` }}>
                <span className={styles.logoA}>ASSE</span>
                <span className={styles.logoB}>ZERO</span>
              </div>
            </div>
          </div>

          <div className={styles.lineBot}>
            <div className={styles.lineInner} style={{ transform: `scaleX(${count / 100})` }} />
          </div>
        </div>

        <span className={styles.services}>
          ADV · SHORT FILM · MUSIC VIDEO · SOUND DESIGN
        </span>
      </div>

      {/* Panel B — slides UP with a slight delay for the layered curtain effect */}
      <div
        className={`${styles.panel} ${styles.panelB} ${isExit ? styles.panelBExit : ''}`}
        style={isExit ? { transitionDelay: `${CURTAIN_DELAY}ms` } : {}}
      />

    </div>
  );
}
