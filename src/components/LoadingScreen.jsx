import { useEffect, useState, useRef } from 'react';
import styles from './LoadingScreen.module.css';

/* ─────────────────────────────────────────────────────────────────
   Timing constants (ms)
   ───────────────────────────────────────────────────────────────── */
const COUNT_DURATION = 2800;   // how long 0→100 takes
const HOLD_AFTER     =  350;   // pause at 100% before exit starts
const CURTAIN_DELAY  =  200;   // gap between the two curtain panels
const TOTAL_UNMOUNT  = 1400;   // time until component is removed

export default function LoadingScreen({ onComplete }) {
  const [count,   setCount]   = useState(0);
  const [phase,   setPhase]   = useState('enter'); // enter | hold | exit
  const rafRef  = useRef(null);

  /* ── Counter: eased from 0 → 100 ────────────────────────────── */
  useEffect(() => {
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const t       = Math.min(elapsed / COUNT_DURATION, 1);
      // Cubic ease-in-out
      const eased   = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      setCount(Math.round(eased * 100));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Counter done → short hold → trigger curtain exit
        setTimeout(() => {
          setPhase('exit');
          setTimeout(onComplete, TOTAL_UNMOUNT);
        }, HOLD_AFTER);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  const isExit = phase === 'exit';

  return (
    <div className={styles.root}>

      {/* ── Panel A – slides UP on exit ───────────────────────── */}
      <div className={`${styles.panel} ${styles.panelA} ${isExit ? styles.panelAExit : ''}`}>

        {/* Left anchor: "PRODUCTION" vertical */}
        <span className={styles.sideL}>PRODUCTION</span>

        {/* Right anchor: year */}
        <span className={styles.sideR}>2024 – 2025</span>

        {/* ── Core: lines + counter + logo ── */}
        <div className={styles.core}>

          {/* Top horizontal line — expands with progress */}
          <div className={styles.lineTop}>
            <div
              className={styles.lineInner}
              style={{ transform: `scaleX(${count / 100})` }}
            />
          </div>

          {/* Counter + logo block */}
          <div className={styles.middle}>

            {/* Large counter */}
            <div className={styles.counterWrap}>
              <span className={styles.counter}>
                {String(count).padStart(2, '0')}
              </span>
              <span className={styles.sup}>%</span>
            </div>

            {/* Logo — clips in as count rises */}
            <div className={styles.logoWrap}>
              <div
                className={styles.logoClip}
                style={{ clipPath: `inset(0 ${100 - count}% 0 0)` }}
              >
                <span className={styles.logoA}>ASSE</span>
                <span className={styles.logoB}>ZERO</span>
              </div>
            </div>

          </div>

          {/* Bottom horizontal line */}
          <div className={styles.lineBot}>
            <div
              className={styles.lineInner}
              style={{ transform: `scaleX(${count / 100})` }}
            />
          </div>

        </div>

        {/* Bottom center: services */}
        <span className={styles.services}>
          ADV · SHORT FILM · MUSIC VIDEO · SOUND DESIGN
        </span>

      </div>

      {/* ── Panel B – slides UP with slight delay (layered curtain) ── */}
      <div
        className={`${styles.panel} ${styles.panelB} ${isExit ? styles.panelBExit : ''}`}
        style={isExit ? { transitionDelay: `${CURTAIN_DELAY}ms` } : {}}
      />

    </div>
  );
}
