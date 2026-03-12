import { useState, useRef, useEffect } from 'react';
import useDragScroll from '../hooks/useDragScroll';
import useAutoScroll from '../hooks/useAutoScroll';
import FilmFrame from './FilmFrame';
import styles from './Photos.module.css';

const photos = [
  { id: 1, description: 'Scatto creativo 1', date: 'Gennaio 2026',  path: '/photos/f1.jpg' },
  { id: 2, description: 'Scatto creativo 2', date: 'Gennaio 2026',  path: '/photos/f2.jpg' },
  { id: 3, description: 'Scatto creativo 3', date: 'Dicembre 2025', path: '/photos/f3.jpg' },
  { id: 4, description: 'Scatto creativo 4', date: 'Dicembre 2025', path: '/photos/f4.jpg' },
  { id: 5, description: 'Scatto creativo 5', date: 'Novembre 2025', path: '/photos/f5.jpg' },
  { id: 6, description: 'Scatto creativo 6', date: 'Novembre 2025', path: '/photos/f6.jpg' },
  { id: 7, description: 'Scatto creativo 7', date: 'Ottobre 2025',  path: '/photos/f7.jpg' },
];

export default function Photos() {
  const containerRef = useRef(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useDragScroll(containerRef, 'x', 0.8);
  useAutoScroll(containerRef, 'x', 0.6);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightboxSrc(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section id="photos" className={styles.sliderSection}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">LE MIE FOTO</h2>
        </div>

        <FilmFrame variant="h" speed="16s" className={styles.frameOuter}>
          <div className={styles.scrollArea} ref={containerRef}>
            <div className={styles.track}>
              {photos.map((photo) => (
                <div key={photo.id} className={styles.item} onClick={() => setLightboxSrc(photo.path)}>
                  <img src={photo.path} alt={`Foto ${photo.id}`} loading="eager" decoding="async" width="600" height="338" />
                  <div className={styles.overlay}>
                    <p className={styles.desc}>{photo.description}</p>
                    <p className={styles.date}>{photo.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FilmFrame>
      </div>

      {lightboxSrc && (
        <div className={styles.lightbox} onClick={(e) => { if (e.target === e.currentTarget || e.target.tagName === 'IMG') setLightboxSrc(null); }}>
          <button className={styles.lbClose} aria-label="Chiudi" onClick={() => setLightboxSrc(null)}>✕</button>
          <img src={lightboxSrc} alt="Foto ingrandita" />
        </div>
      )}
    </section>
  );
}
