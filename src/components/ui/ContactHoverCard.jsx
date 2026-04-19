import { useState } from 'react';
import { useMediaQuery } from '@hooks/useMediaQuery';
import styles from './ContactHoverCard.module.css';

const TRACKERS = Array.from({ length: 25 }, (_, index) => index + 1);

export default function ContactHoverCard({
  children,
  scrollTransform,
  className = '',
  title = 'Contattami',
  subtitle = 'Muovi il cursore',
  prompt = 'Hover over',
  showTrackers = true,
  showOverlayCopy = true,
  interactiveHover = false,
}) {
  const [hoverTilt, setHoverTilt] = useState({ rotateX: 0, rotateY: 0, active: false });

  const isMobile = useMediaQuery('(max-width: 900px)');

  const transform = isMobile
    ? 'none'
    : `
    perspective(1000px)
    rotateX(${scrollTransform.rotateX}deg)
    scale(${scrollTransform.scale})
    translateY(${scrollTransform.translateY}px)
  `;

  const handlePointerMove = (event) => {
    if (!interactiveHover) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    setHoverTilt({
      rotateX: (0.5 - y) * 14,
      rotateY: (x - 0.5) * 18,
      active: true,
    });
  };

  const handlePointerLeave = () => {
    if (!interactiveHover) return;
    setHoverTilt({ rotateX: 0, rotateY: 0, active: false });
  };

  const cardStyle =
    interactiveHover && !showTrackers
      ? {
          transform: `rotateX(${hoverTilt.rotateX}deg) rotateY(${hoverTilt.rotateY}deg)`,
          filter: hoverTilt.active ? 'brightness(1.08)' : undefined,
          boxShadow: hoverTilt.active
            ? '0 30px 80px rgba(36, 24, 22, 0.24), 0 0 60px rgba(255, 255, 255, 0.08)'
            : undefined,
        }
      : undefined;

  return (
    <div
      className={`${styles.container} ${showTrackers ? styles.noselect : ''} ${className}`}
      style={{ transform }}
    >
      <div
        className={styles.canvas}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {showTrackers &&
          TRACKERS.map((tracker) => (
            <div
              key={tracker}
              className={`${styles.tracker} ${styles[`tr${tracker}`]}`}
              aria-hidden="true"
            />
          ))}

        <div className={styles.card} style={cardStyle}>
          <div className={styles.cardGlow} aria-hidden="true" />
          {showOverlayCopy && <p className={styles.prompt}>{prompt}</p>}
          {showOverlayCopy && (
            <div className={styles.heroCopy}>
              <p className={styles.title}>{title}</p>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
          )}
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  );
}
