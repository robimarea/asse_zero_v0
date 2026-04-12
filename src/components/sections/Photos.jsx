import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PHOTOS as photosData } from '@data/constants';
import { bezierPoint, bellCurve } from '@utils/math';
import styles from './Photos.module.css';

const N = photosData.length;

export default function Photos() {
  const [scrollPos, setScrollPos] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const sectionRef   = useRef(null);
  const stageRef     = useRef(null);
  const targetScroll = useRef(0);
  const animFrame    = useRef(null);
  const stickyRef    = useRef(null);

  // Native scroll tracking
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

  // Smooth lerp animation loop
  useEffect(() => {
    const animate = () => {
      setScrollPos(prev => {
        const diff = targetScroll.current - prev;
        if (Math.abs(diff) < 0.001) return targetScroll.current;
        return prev + diff * 0.12;
      });
      animFrame.current = requestAnimationFrame(animate);
    };
    animFrame.current = requestAnimationFrame(animate);
    return () => { if (animFrame.current) cancelAnimationFrame(animFrame.current); };
  }, []);

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

  const activeIndex = Math.max(0, Math.min(N - 1, Math.round(scrollPos)));
  const activePhoto = photosData[activeIndex];

  const svgPath = (() => {
    const P0 = { x: 3, y: 8 };
    const P1 = { x: 5, y: 55 };
    const P2 = { x: 55, y: 30 };
    const P3 = { x: 88, y: 82 };
    return `M${P0.x},${P0.y} C${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`;
  })();

  return (
    <section id="photos" className={styles.section} ref={sectionRef} style={{ height: `calc(100vh + ${N * 50}vh)` }}>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">LE MIE FOTO</h2>
          <p className={styles.subtitle}>
            Scatti dal set — pubblicità, cortometraggi, videoclip
          </p>
        </motion.div>
      </div>

      <div className={styles.stickyWrapper} ref={stickyRef}>
        <div className={styles.stage} ref={stageRef}>

          <svg className={styles.curveSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={svgPath}
              stroke="rgba(146,200,211,0.12)"
              strokeWidth="0.3"
              fill="none"
              strokeDasharray="1.2 1.8"
            />
          </svg>

          {photosData.map((photo, i) => {
            const rawOffset = i - scrollPos;

            const CENTER_T = 0.42;
            const SPREAD   = 0.11; 
            const t        = CENTER_T + rawOffset * SPREAD;

            if (t < -0.15 || t > 1.15) return null;

            const clampedT = Math.max(0, Math.min(1, t));
            const pos      = bezierPoint(clampedT);

            const proximity = bellCurve(rawOffset, 3.5);

            const scale    = 0.35 + proximity * 0.65;   
            const opacity  = 0.2 + proximity * 0.8;     
            const blur     = (1 - proximity) * 2.5;      
            const zIndex   = Math.round(proximity * 10);
            const rotation = rawOffset * -4;        

            const isCenter = Math.abs(rawOffset) < 0.4;

            return (
              <div
                key={i}
                className={`${styles.curveCard} ${isCenter ? styles.curveCardActive : ''}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                  opacity,
                  filter: `blur(${blur}px)`,
                  zIndex,
                }}
                onClick={() => {
                  if (isCenter) setLightbox(photo);
                  else scrollToTargetIndex(i);
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
                {isCenter && (
                  <div className={styles.activeGlow} />
                )}
              </div>
            );
          })}

          <div className={styles.infoPanel}>
            <AnimatePresence mode="wait">
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
                <span className={styles.infoDate}>{activePhoto.date}</span>
                <div className={styles.infoControls}>
                  <button className={styles.navBtn} onClick={() => scrollToTargetIndex(activeIndex - 1)} aria-label="Precedente" data-cursor="view">←</button>
                  <span className={styles.counter}>
                    {String(activeIndex + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
                  </span>
                  <button className={styles.navBtn} onClick={() => scrollToTargetIndex(activeIndex + 1)} aria-label="Successivo" data-cursor="view">→</button>
                </div>
              </motion.div>
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
