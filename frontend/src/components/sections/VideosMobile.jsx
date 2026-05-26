import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { VIDEOS as staticVideos } from '@data/constants';
import styles from './VideosMobile.module.css';

/* ── Sub-component for individual 3D Slide performance ─────────── */
function MobileSlide({ vid, index, scrollPos, isActive, slideCount }) {
  const rawOffset = useTransform(scrollPos, (s) => index - s);
  const absOffset = useTransform(rawOffset, (o) => Math.abs(o));
  
  // RUOTA 3D calculations - Fixed geometry for buttery tracking
  const y = useTransform(rawOffset, (o) => o * (window.innerHeight * 0.25));
  const rotateX = useTransform(rawOffset, (o) => o * 28); 
  const z = useTransform(absOffset, (a) => a * -500); 
  
  // "Evanescence" - Exponential smooth fading
  const opacity = useTransform(absOffset, (a) => Math.exp(-a * a * 1.5));
  const scale = useTransform(absOffset, (a) => Math.max(0.6, 1 - (a * 0.2)));
  const zIndex = useTransform(absOffset, (a) => Math.round((slideCount - a) * 10));

  const placeholderIdx = ((index + 2) % 5) + 1;
  const imgSrc = `/photos/${placeholderIdx}.webp`;

  return (
    <motion.div
      className={`${styles.slide} ${isActive ? styles.activeSlide : ''}`}
      style={{
        transform: useTransform([y, z, rotateX, scale], ([yV, zV, rxV, sV]) => 
          `translate3d(0, ${yV}px, ${zV}px) rotateX(${rxV}deg) scale(${sV})`
        ),
        opacity,
        zIndex,
        rotate: 0,
        willChange: "transform, opacity"
      }}
    >
      <div className={styles.playerWrapper}>
        <a 
          href={vid.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.displayArea}
        >
          <img 
            src={imgSrc} 
            alt={vid.label} 
            loading="lazy"
            decoding="async"
          />
          <div className={styles.playBtnBig}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </div>
        </a>
      </div>

      <div className={styles.infoWrapper}>
        <span className={styles.label}>PROGETTO SELEZIONATO</span>
        <h3 className={styles.title}>{vid.label}</h3>
        <p className={styles.description}>{vid.desc}</p>
        <span className={styles.date}>{vid.date}</span>
      </div>
    </motion.div>
  );
}

export default function VideosMobile({ videos = staticVideos }) {
  const n = videos.length;
  const scrollMax = Math.max(0, n - 1);

  const sectionRef   = useRef(null);
  const targetScroll = useRef(0);
  const animFrame    = useRef(null);
  const lastIndex    = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Optimized Scroll Tracking: Use MotionValue
  const scrollPos = useMotionValue(0);

  // 1. Sync Section Scroll to Gallery Progress
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const { top, height } = sectionRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const maxTravel = height - viewportH;
      if (maxTravel <= 0) return;

      const progress = Math.max(0, Math.min(1, -top / maxTravel));
      targetScroll.current = progress * scrollMax;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [scrollMax]);

  // 2. High-Performance Loop: 0.18 LERP factor for jitter-free tracking
  useEffect(() => {
    const animate = () => {
      const current = scrollPos.get();
      const diff = targetScroll.current - current;
      
      // Extremely tight landing threshold to prevent "pixel snapping" jitter
      if (Math.abs(diff) < 0.0001) {
        scrollPos.set(targetScroll.current);
        animFrame.current = null;
        return;
      }
      
      // Increased LERP speed (0.18) to move in lock-step with magnetic snapping
      const next = current + diff * 0.18;
      scrollPos.set(next);

      const nextIdx = Math.max(0, Math.min(n - 1, Math.round(next)));
      if (nextIdx !== lastIndex.current) {
        lastIndex.current = nextIdx;
        setActiveIndex(nextIdx);
      }

      animFrame.current = requestAnimationFrame(animate);
    };

    const runLoop = () => {
      if (!animFrame.current) animFrame.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', runLoop, { passive: true });
    animFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', runLoop);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [n]);

  // 3. Optimize rendering: don't re-create list on index change
  const slides = useMemo(() => (
    videos.map((vid, i) => (
      <MobileSlide 
        key={vid.id}
        vid={vid}
        index={i}
        scrollPos={scrollPos}
        isActive={i === activeIndex}
        slideCount={n}
      />
    ))
  ), [videos, activeIndex, n]);

  if (n === 0) return null;

  return (
    <section 
      ref={sectionRef} 
      className={styles.mobileSection}
      style={{ height: `calc(var(--viewport-height) + ${n * 60}vh)` }} 
    >
      <div className={styles.snapStrip}>
        {videos.map((_, i) => (
          <div 
            key={`snap-${i}`} 
            className={styles.snapPoint} 
          />
        ))}
      </div>

      <div className={styles.stickyWrapper}>
        <motion.div 
          className={styles.header}
          style={{ 
            opacity: useTransform(scrollPos, s => Math.max(0, 1 - s * 8)), 
            y: useTransform(scrollPos, s => s * -40),
            pointerEvents: useTransform(scrollPos, s => s > 0.1 ? 'none' : 'auto')
          }}
        >
          <h2 className="section-title">PORTFOLIO VIDEO</h2>
        </motion.div>

        <div className={styles.stage}>
          {slides}
        </div>
      </div>
    </section>
  );
}
