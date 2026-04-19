import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { VIDEOS as videos } from '@data/constants';
import { verticalPath, bellCurve } from '@utils/math';
import styles from './Videos.module.css';

const N = videos.length;

/* ── Sub-component for optimized thumbnail list ─────────────────── */
/* ── Sub-component for optimized thumbnail list ─────────────────── */
function ThumbItem({ vid, index, scrollPos, onScrollTo, isActive }) {
  const rawOffset = useTransform(scrollPos, (s) => index - s);
  
  const CENTER_T  = 0.5; 
  const SPREAD    = 0.32; // Increased from 0.22 for more vertical air
  const t = useTransform(rawOffset, (o) => CENTER_T + o * SPREAD);

  const clampedT = useTransform(t, (v) => Math.max(0, Math.min(1, v)));
  const pos = useTransform(clampedT, (v) => verticalPath(v));
  const proximity = useTransform(rawOffset, (o) => bellCurve(o, 3.2));

  // Opacity: hits 0 at +/- 1.4 to prevent stacking at edges
  const opacity = useTransform(
    rawOffset, 
    [-1.4, -0.6, 0, 0.6, 1.4], 
    [0, 0.4, 1, 0.4, 0]
  );
  
  const scale = useTransform(proximity, (p) => 0.46 + p * 0.66);
  const zIndex = useTransform(proximity, (p) => Math.round(p * 100));

  return (
    <motion.div
      className={`${styles.thumbItem} ${isActive ? styles.activeThumb : ''}`}
      style={{
        left: useTransform(pos, (p) => `${p.x - 15}%`), // Shifted from 50% to ~35%
        top: useTransform(pos, (p) => `${p.y}%`),
        transform: "translate3d(-50%, -50%, 0)",
        rotate: 0, // Forced zero tilt
        scale,
        opacity,
        zIndex,
        willChange: "transform, opacity"
      }}
      onClick={() => onScrollTo(index)}
      data-cursor="view"
    >
      <img
        src={`/photos/${((vid.id - 1) % 5) + 1}.webp`}
        alt={vid.label}
        loading="lazy"
        decoding="async"
      />
      {isActive && <div className={styles.activeGlow} />}
    </motion.div>
  );
}

export default function Videos() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef   = useRef(null);
  const targetScroll = useRef(0);
  const animFrame    = useRef(null);

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

      // Account for the 100px offset from the header snap point
      const effectiveTop = top - 100;
      const progress = Math.max(0, Math.min(1, -effectiveTop / maxTravel));
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

  // 2. Smooth Lerp Loop via MotionValue
  useEffect(() => {
    const animate = () => {
      const current = scrollPos.get();
      const diff = targetScroll.current - current;
      
      if (Math.abs(diff) < 0.0005) {
        scrollPos.set(targetScroll.current);
        animFrame.current = null;
        return;
      }
      
      const next = current + diff * 0.15;
      scrollPos.set(next);

      // Update active index for player section (React State)
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

  const activeVideo = videos[activeIndex];

  const scrollToIdx = useCallback((idx) => {
    if (!sectionRef.current) return;
    const progress = idx / (N - 1);
    const parentRect = sectionRef.current.getBoundingClientRect();
    const maxTravel  = parentRect.height - window.innerHeight;
    const targetY    = window.scrollY + parentRect.top + (progress * maxTravel);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }, []);

  return (
    <section 
      id="videos" 
      className={styles.videosSection} 
      ref={sectionRef}
      style={{ height: `calc(var(--viewport-height) + ${N * 60}vh)` }} 
    >
      {/* Invisible Snap Points for Desktop Granular Magnetism */}
      <div className={styles.snapStrip}>
        {videos.map((_, i) => (
          <div 
            key={`snap-${i}`} 
            className={styles.snapPoint} 
            style={{ height: '60vh' }}
          />
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
          <h2 className="section-title">PORTFOLIO VIDEO</h2>
          <p className={styles.description}>
            Produzioni video tra spot, storytelling e formati narrativi
          </p>
        </motion.div>
      </div>

      <div className={styles.stickyWrapper}>
        <div className={styles.containerStyle}>
          
          <div className={styles.galleryCore}>
            <div className={styles.thumbListWrapper}>
              <div className={styles.thumbList}>
                {videos.map((vid, i) => (
                  <ThumbItem 
                    key={`${vid.id}-${i}`}
                    vid={vid}
                    index={i}
                    scrollPos={scrollPos}
                    onScrollTo={scrollToIdx}
                    isActive={activeIndex === i}
                  />
                ))}
              </div>
            </div>

            <div className={styles.playerSection}>
              {activeVideo && (
                <a 
                  href={activeVideo.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.displayArea}
                  data-cursor="view"
                >
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={activeVideo.id}
                      src={`/photos/${((activeVideo.id + 1) % 5) + 1}.webp`} 
                      alt={activeVideo.label}
                      initial={{ opacity: 0, scale: 1.02, rotate: 0 }}
                      animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.98, rotate: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      loading="eager"
                      style={{ rotate: 0 }}
                    />
                  </AnimatePresence>
                  <div className={styles.playBtnBig}>
                    <svg viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
                  </div>
                </a>
              )}

              <div className={styles.playerBottom}>
                <div className={styles.infoBlock}>
                  <AnimatePresence mode="wait">
                    {activeVideo && (
                      <motion.div
                        key={activeVideo.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <span className={styles.label}>PROGETTO SELEZIONATO</span>
                        <h3 className={styles.title}>{activeVideo.label}</h3>
                        <p className={styles.description}>{activeVideo.desc}</p>
                        <span className={styles.date}>{activeVideo.date}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className={styles.controls}>
                  <button 
                    className={styles.navBtn} 
                    onClick={() => scrollToIdx(activeIndex - 1)} 
                    disabled={activeIndex === 0}
                    data-cursor="view"
                  >
                    PREV
                  </button>
                  <button 
                    className={styles.navBtn} 
                    onClick={() => scrollToIdx(activeIndex + 1)} 
                    disabled={activeIndex === N - 1}
                    data-cursor="view"
                   >
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
