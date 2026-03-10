import styles from './FilmFrame.module.css';

/**
 * FilmFrame v3 — 35mm sprocket border as absolute overlay strips.
 *
 * variant  'h'  → top + bottom strips   (Photos)
 *          'v'  → left + right strips   (Videos)
 * speed    animation duration — default '14s' (slow, realistic)
 */
const CELLS = 60;

function SprocketTrack({ axis, speed }) {
  const cells = Array.from({ length: CELLS });
  return (
    <div
      className={`${styles.track} ${axis === 'x' ? styles.trackX : styles.trackY}`}
      style={{ '--spd': speed }}
      aria-hidden="true"
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          className={`${styles.inner} ${axis === 'x' ? styles.innerX : styles.innerY}`}
          aria-hidden={copy === 1 ? 'true' : undefined}
        >
          {cells.map((_, i) => (
            <span key={i} className={styles.cell}>
              <span className={styles.hole}>
                <span className={styles.holeInner} />
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Strip({ pos, speed }) {
  const isH = pos === 'top' || pos === 'bot';
  return (
    <div className={`${styles.strip} ${styles[pos]}`} aria-hidden="true">
      {/* outer raised edge */}
      <div className={styles.edgeA} />
      {/* sprocket channel */}
      <div className={styles.channel}>
        <SprocketTrack axis={isH ? 'x' : 'y'} speed={speed} />
      </div>
      {/* inner edge toward content */}
      <div className={styles.edgeB} />
      {/* acetate grain */}
      <div className={styles.acetate} />
    </div>
  );
}

export default function FilmFrame({ children, variant = 'h', speed = '14s', className = '' }) {
  const isH = variant === 'h';
  const isV = variant === 'v';
  return (
    <div className={`${styles.frame} ${styles['var_' + variant]} ${className}`}>
      {isH && <Strip pos="top" speed={speed} />}
      {isV && <Strip pos="left"  speed={speed} />}

      <div className={styles.slot}>{children}</div>

      {isH && <Strip pos="bot" speed={speed} />}
      {isV && <Strip pos="right" speed={speed} />}
    </div>
  );
}
