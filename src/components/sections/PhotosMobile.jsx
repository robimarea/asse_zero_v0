import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PHOTOS as staticPhotos } from '@data/constants';
import styles from './PhotosMobile.module.css';

function PhotoSlide({ photo, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Parallax: l'immagine si muove leggermente meno dello scroll
  const y = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <section ref={ref} className={styles.slide}>
      <div className={styles.imageWrapper}>
        <motion.img 
          src={photo.src} 
          alt={photo.title} 
          loading="lazy" 
          decoding="async"
          style={{ y, scale }}
        />
      </div>
      
      <motion.div 
        className={styles.infoWrapper}
        
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className={styles.category}>{photo.category}</span>
        <h3 className={styles.title}>{photo.title}</h3>
        <p className={styles.desc}>{photo.desc}</p>
        <span className={styles.date}>{photo.date}</span>
      </motion.div>
    </section>
  );
}

export default function PhotosMobile({ photos = staticPhotos }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "center start"]
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.5], [0, -40]);

  if (photos.length === 0) return null;

  return (
    <div ref={containerRef} className={styles.mobileContainer}>
      <motion.div 
        className={styles.header}
        style={{ opacity: headerOpacity, y: headerY }}
      >
        <h2 className="section-title">PORTFOLIO FOTOGRAFICO</h2>
        <p className={styles.subtitle}>
          Scatti dal set tra advertising, cortometraggi e videoclip
        </p>
      </motion.div>

      <div className={styles.scrollArea}>
        {photos.map((photo, i) => (
          <PhotoSlide key={i} photo={photo} index={i} />
        ))}
      </div>
    </div>
  );
}
