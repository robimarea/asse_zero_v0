import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { PHOTOS as photosData } from '@data/constants';
import { bezierPoint, bellCurve } from '@utils/math';
import styles from './Photos.module.css';

const N = photosData.length;

/* ── Sub-component for individual card performance ──────────────── */
function CurveCard({ photo, index, scrollPos, onLightbox, onScrollTo, isActive }) {
  // We use useTransform to calculate all positions/effects based on the motion value
  // This runs on the animation thread, not the React render cycle!
  
  const rawOffset = useTransform(scrollPos, (s) => index - s);
  
  const CENTER_T = 0.42;
  const SPREAD   = 0.11;
  const t = useTransform(rawOffset, (o) => CENTER_T + o * SPREAD);
  
  const clampedT = useTransform(t, (v) => Math.max(0, Math.min(1, v)));
  const pos = useTransform(clampedT, (v) => bezierPoint(v));
  
  const proximity = useTransform(rawOffset, (o) => bellCurve(o, 3.5));
  
  const scale = useTransform(proximity, (p) => 0.35 + p * 0.65);
  // Sharper opacity falloff to prevent bunching at curve ends
  const opacity = useTransform(rawOffset, [-4.5, -2, 0, 2, 4.5], [0, 0.4, 1, 0.4, 0]);
  const zIndex = useTransform(proximity, (p) => Math.round(p * 100));
  const rotation = useTransform(rawOffset, (o) => o * -4);
  
  const left = useTransform(pos, (p) => `${p.x}%`);
  const top = useTransform(pos, (p) => `${p.y}%`);

  return (
    <motion.div
      className={`${styles.curveCard} ${isActive ? styles.curveCardActive : ''}`}
      style={{
        left,
        top,
        x: "-50%",
        y: "-50%", 
        scale,
        rotate: rotation,
        opacity,
        zIndex,
        willChange: "transform, opacity"
      }}
      onClick={() => {
        // If it's near center, open lightbox, else scroll to it
        if (Math.abs(index - scrollPos.get()) < 0.4) onLightbox(photo);
        else onScrollTo(index);
      }}
      data-cursor="view"
    >
      <img
        src={photo.src}
        alt={photo.title}
        className={styles.curveCardImg}
        loading="lazy"
        decoding="async"
      />
      {isActive && <div className={styles.activeGlow} />}
    </motion.div>
  );
}

export default function Photos() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const sectionRef   = useRef(null);
  const targetScroll = useRef(0);
  const animFrame    = useRef(null);

  // Optimized Scroll Tracking: Use MotionValue
  const scrollPos = useMotionValue(0);

  // Sync section scroll to target progress
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const { top, height } = sectionRef.current.getBoundingClientRect();
      const maxTravel = height - window.innerHeight;
      if (maxTravel <= 0) return;

      const progress = Math.max(0, Math.min(1, -top / maxTravel));
      targetScroll.current = progress * (N - 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Smother Lerp via useMotionValue
  useEffect(() => {
    const animate = () => {
      const current = scrollPos.get();
      const diff = targetScroll.current - current;
      
      if (Math.abs(diff) < 0.0005) {
        scrollPos.set(targetScroll.current);
        animFrame.current = null;
        return;
      }
      
      const next = current + diff * 0.12;
      scrollPos.set(next);
      
      // Update active index for info panel (React State)
      const nextIdx = Math.max(0, Math.min(N - 1, Math.round(next)));
      if (nextIdx !== activeIndex) {
        setActiveIndex(nextIdx);
      }

      animFrame.current = requestAnimationFrame(animate);
    };

    const runLoop = () => {
      if (!animFrame.current) {
        animFrame.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('scroll', runLoop, { passive: true });
    animFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', runLoop);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [activeIndex]);

  const scrollToTargetIndex = useCallback((idx) => {
    if (!sectionRef.current) return;
    const clampedIdx = Math.max(0, Math.min(N - 1, idx));
    const progress   = clampedIdx / (N - 1);
    const parentRect = sectionRef.current.getBoundingClientRect();
    const maxTravel  = parentRect.height - window.innerHeight;
    const targetY    = window.scrollY + parentRect.top + (progress * maxTravel);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetScroll.current = Math.min(N - 1, targetScroll.current + 1);
      }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp') {
        targetScroll.current = Math.max(0, targetScroll.current - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const activePhoto = photosData[activeIndex];

  const svgPath = (() => {
    const P0 = { x: 3, y: 8 };
    const P1 = { x: 5, y: 55 };
    const P2 = { x: 55, y: 30 };
    const P3 = { x: 88, y: 82 };
    return `M${P0.x},${P0.y} C${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`;
  })();

  return (
    <section 
      id="photos" 
      className={styles.section} 
      ref={sectionRef}
      style={{ height: `calc(var(--viewport-height) + ${N * 50}vh)` }}
    >
      {/* Invisible Snap Points for Desktop Granular Magnetism */}
      <div className={styles.snapStrip}>
        {photosData.map((_, i) => (
          <div 
            key={`snap-${i}`} 
            className={styles.snapPoint} 
            style={{ height: '50vh' }}
          >
            <span className={styles.snapTarget} aria-hidden="true" />
          </div>
        ))}
      </div>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">PORTFOLIO FOTOGRAFICO</h2>
          <p className={styles.subtitle}>
            Scatti dal set tra advertising, cortometraggi e videoclip
          </p>
        </motion.div>
      </div>

      <div className={styles.stickyWrapper}>
        <div className={styles.stage}>

          <svg className={styles.curveSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={svgPath}
              stroke="rgb(var(--accent-rgb) / 0.1)"
              strokeWidth="0.15"
              fill="none"
              strokeDasharray="1, 4"
            />
          </svg>

          {photosData.map((photo, i) => (
            <CurveCard 
              key={i}
              photo={photo}
              index={i}
              scrollPos={scrollPos}
              onLightbox={setLightbox}
              onScrollTo={scrollToTargetIndex}
              isActive={activeIndex === i}
            />
          ))}

          <div className={styles.infoPanel}>
            <AnimatePresence mode="wait">
              {activePhoto && (
                <motion.div
                  key={activeIndex}
                  className={styles.infoPanelInner}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                >
                  <span className={styles.infoCategory}>{activePhoto.category}</span>
                  <h3 className={styles.infoTitle}>{activePhoto.title}</h3>
                  <p className={styles.infoDesc}>{activePhoto.desc}</p>
                  
                  <div className={styles.infoMeta}>
                    <span className={styles.infoDate}>{activePhoto.date}</span>
                    <span className={styles.counter}>
                      {String(activeIndex + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
                    </span>
                  </div>

                  <div className={styles.infoControls}>
                    <button className={styles.navBtn} onClick={() => scrollToTargetIndex(activeIndex - 1)} aria-label="Precedente" data-cursor="view">←</button>
                    <button className={styles.navBtn} onClick={() => scrollToTargetIndex(activeIndex + 1)} aria-label="Successivo" data-cursor="view">→</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </div>
    </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.lightbox}
            onClick={() => setLightbox(null)}
          >
            <button className={styles.lbClose} onClick={() => setLightbox(null)}>✕</button>
            <div className={styles.lbInner} onClick={(e) => e.stopPropagation()}>
              <img src={lightbox.src} alt={lightbox.title} />
              <span className={styles.lbMeta}>
                <span className={styles.lbCategory}>{lightbox.category}</span>
                {' — '}
                <span className={styles.lbTitle}>{lightbox.title}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
