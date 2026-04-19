import styles from './ChapterSeparator.module.css';

/**
 * ChapterSeparator
 * Standardized cinematic separator for chapters.
 * Provides a visual pause and vertical space between major sections.
 */
export default function ChapterSeparator({ height = 'var(--vh-standard, 20svh)' }) {
  return (
    <div className={styles.separator} style={{ height }}>
      <div className={styles.line} />
    </div>
  );
}
