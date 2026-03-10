import { useRef } from 'react';
import useDragScroll from '../hooks/useDragScroll';
import useAutoScroll from '../hooks/useAutoScroll';
import styles from './Videos.module.css';

const videos = [
  { id: 1, label: 'VIDEO CREATIVO 1', date: 'Gennaio 2026',  url: 'https://www.instagram.com/reel/DOa-1TnDNvi/' },
  { id: 2, label: 'VIDEO CREATIVO 2', date: 'Gennaio 2026',  url: 'https://www.instagram.com/reel/EXAMPLE2/' },
  { id: 3, label: 'VIDEO CREATIVO 3', date: 'Dicembre 2025', url: 'https://www.instagram.com/reel/EXAMPLE3/' },
  { id: 4, label: 'VIDEO CREATIVO 4', date: 'Dicembre 2025', url: 'https://www.instagram.com/reel/EXAMPLE4/' },
  { id: 5, label: 'VIDEO CREATIVO 5', date: 'Novembre 2025', url: 'https://www.instagram.com/reel/EXAMPLE5/' },
  { id: 6, label: 'VIDEO CREATIVO 6', date: 'Novembre 2025', url: 'https://www.instagram.com/reel/EXAMPLE6/' },
  { id: 7, label: 'VIDEO CREATIVO 7', date: 'Ottobre 2025',  url: 'https://www.instagram.com/reel/EXAMPLE7/' },
  { id: 8, label: 'VIDEO CREATIVO 8', date: 'Ottobre 2025',  url: 'https://www.instagram.com/reel/EXAMPLE8/' },
];

export default function Videos() {
  const containerRef = useRef(null);

  useDragScroll(containerRef, 'y', 1.5);
  useAutoScroll(containerRef, 'y', 0.6);

  return (
    <section id="videos" className={styles.videosSection}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">I MIEI VIDEO</h2>
        </div>

        <div className={styles.videosScrollContainer} ref={containerRef}>
          <div className={styles.videosGrid}>
            {videos.map((video) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.videoCard}
              >
                <div className={styles.videoWrapper}>
                  <div className={styles.videoBorder} />
                  <img
                    src={`/images/video${video.id}-thumb.jpg`}
                    alt={`Video ${video.id}`}
                    loading="eager"
                    decoding="async"
                    width="405"
                    height="720"
                  />
                  <div className={styles.videoOverlay}>
                    <div className={styles.playButton}>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M8 5v14l11-7z" fill="currentColor" />
                      </svg>
                    </div>
                    <div className={styles.videoInfo}>
                      <span className={styles.videoLabel}>{video.label}</span>
                      <span className={styles.videoDate}>{video.date}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
