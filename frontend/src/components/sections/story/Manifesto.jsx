import { motion } from 'framer-motion';
import styles from './Manifesto.module.css';

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.1,
    },
  }),
};

const wordVariants = {
  hidden: { y: '110%', opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.25 + i * 0.13,
    },
  }),
};

export default function Manifesto() {
  return (
    <section
      className={styles.manifestoWrap}
      aria-label="Manifesto"
    >
      <motion.div
        className={styles.manifestoInner}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10% 0px' }}
      >
        <motion.span variants={revealVariants} className={styles.chip}>
          Studio di Produzione · Roma
        </motion.span>

        <h2 className={styles.manifestoHeading} aria-label="Ogni frame racconta qualcosa.">
          {['Ogni', 'frame', 'racconta', 'qualcosa.'].map((word, i) => (
            <span key={i} className={styles.wordMask}>
              <motion.span
                custom={i}
                variants={wordVariants}
                className={styles.wordInner}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h2>

        <motion.p
          variants={revealVariants}
          custom={10}
          className={styles.manifestoBody}
        >
          Advertising. Cortometraggi. Video musicali. Sound design.
          Quattro modi di dire la stessa cosa: ogni storia merita
          di essere raccontata con intenzione.
        </motion.p>
      </motion.div>

      <div className={styles.manifestoSide} aria-hidden="true">
        <span>ASSE ZERO</span>
        <span>PRODUCTION</span>
        <span>ROMA · MMXXVI</span>
      </div>
    </section>
  );
}
