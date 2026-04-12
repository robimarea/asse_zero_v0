import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VIDEOS as videos } from '@data/constants';
import { verticalPath, bellCurve } from '@utils/math';
import styles from './Videos.module.css';

const N = videos.length;

export default function Videos() {
  const [scrollPos, setScrollPos] = useState(0);
  const sectionRef   = useRef(null);
  const targetScroll = useRef(0);
  const animFrame    = useRef(null);

  // 1. Sync Section Scroll to Gallery Progress
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const { top, height } = sectionRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      
      const maxTravel = height - viewportH;
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

  // 2. Smooth Lerp Loop (Continuous)
  useEffect(() => {
    const animate = () => {
      setScrollPos(prev => {
        const diff = targetScroll.current - prev;
        if (Math.abs(diff) < 0.001) return targetScroll.current;
        return prev + diff * 0.15; 
      });
      animFrame.current = requestAnimationFrame(animate);
    };
    animFrame.current = requestAnimationFrame(animate);
    return () => { if (animFrame.current) cancelAnimationFrame(animFrame.current); };
  }, []);

  // 3. Derived Active Index
  const activeIndex = Math.max(0, Math.min(N - 1, Math.round(scrollPos)));
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
      style={{ height: `calc(100vh + ${N * 60}vh)` }} 
    >
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">VIDEO GALLERIA</h2>
        </motion.div>
      </div>

      <div className={styles.stickyWrapper}>
        <div className={styles.containerStyle}>
          
          <div className={styles.galleryCore}>
            {/* Sinistra: Stage delle Miniature (Linea Retta) */}
            <div className={styles.thumbListWrapper}>
              <div className={styles.thumbList}>
                {videos.map((vid, i) => {
                  const rawOffset = i - scrollPos;
                  const CENTER_T  = 0.5; 
                  const SPREAD    = 0.22; 
                  const t = CENTER_T + rawOffset * SPREAD;

                  if (t < -0.3 || t > 1.3) return null;

                  const clampedT = Math.max(0, Math.min(1, t));
                  const pos = verticalPath(clampedT);
                  const proximity = bellCurve(rawOffset, 3.2);

                  const scale    = 0.5 + proximity * 0.7; 
                  const opacity  = 0.2 + proximity * 0.8;
                  const zIndex   = Math.round(proximity * 10);
                  const isCenter = Math.abs(rawOffset) < 0.45;

                  return (
                    <div
                      key={`${vid.id}-${i}`}
                      className={`${styles.thumbItem} ${isCenter ? styles.activeThumb : ''}`}
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        transform: `translate(-50%, -50%) scale(${scale})`,
                        opacity,
                        zIndex,
                      }}
                      onClick={() => scrollToIdx(i)}
                      data-cursor="view"
                    >
                      <img
                        src={`/images/video${vid.id}-thumb.jpg`}
                        alt={vid.label}
                        loading="lazy"
                      />
                      {isCenter && <div className={styles.activeGlow} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Destra: Player Gigante */}
            <div className={styles.playerSection}>
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
                    src={`/images/video${activeVideo.id}-thumb.jpg`} 
                    alt="Active Video Poster"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 0.8, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    loading="eager"
                  />
                </AnimatePresence>
                <div className={styles.playBtnBig}>
                  <svg viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
                </div>
              </a>

              <div className={styles.playerBottom}>
                <div className={styles.infoBlock}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeVideo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className={styles.label}>PROGETTO SELEZIONATO</span>
                      <h3 className={styles.title}>{activeVideo.label}</h3>
                      <p className={styles.description}>{activeVideo.desc}</p>
                      <span className={styles.date}>{activeVideo.date}</span>
                    </motion.div>
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
