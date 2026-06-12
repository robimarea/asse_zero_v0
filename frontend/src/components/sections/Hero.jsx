import { motion } from 'framer-motion';
import styles from './Hero.module.css';

export default function Hero() {
  const scrollToStory = () =>
    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <motion.section
      id="hero"
      className={styles.hero}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ height: 'var(--svh-100)' }}
    >
      <div className={styles.topRow}>
        <span className={styles.topLabel}>Studio di Produzione</span>
        <span className={styles.topYear}>Roma · MMXXVI</span>
      </div>

      <div className={styles.titleBlock}>
        <h1 className={styles.titleLine}>ASSE ZERO</h1>
      </div>

      <div className={styles.bottomRow}>
        <p className={styles.disciplines}>
          ADV&nbsp;&nbsp;·&nbsp;&nbsp;SHORT FILM&nbsp;&nbsp;·&nbsp;&nbsp;MUSIC VIDEO&nbsp;&nbsp;·&nbsp;&nbsp;SOUND DESIGN
        </p>
        <button
          className={styles.scrollBtn}
          onClick={scrollToStory}
          aria-label="Scorri al contenuto"
        >
          <span className={styles.scrollLine} />
          <span className={styles.scrollText}>SCROLL</span>
        </button>
      </div>
    </motion.section>
  );
}
