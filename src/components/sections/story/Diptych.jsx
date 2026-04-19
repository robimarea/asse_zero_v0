import { motion } from 'framer-motion';
import styles from './Diptych.module.css';

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function Diptych({ onNavigate }) {
  return (
    <section
      className={styles.diptych}
      aria-label="Dichiarazione"
    >
      <motion.div
        className={styles.diptychPhoto}
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        data-cursor="view"
      >
        <img src="/photos/2.webp" alt="Produzione cinematografica" />
        <span className={styles.photoCaption} aria-hidden="true">Behind the Frame</span>
      </motion.div>

      <motion.div
        className={styles.diptychText}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariants}
      >
        <span className={styles.chip}>// Il linguaggio visivo</span>
        <h2 className={styles.diptychHeading}>
          L'immagine ha <em>una grammatica.</em><br />
          Noi la <em>scriviamo.</em>
        </h2>
        <p className={styles.diptychBody}>
          Ogni inquadratura è una scelta. Ogni taglio, un ritmo.
          Dal set alle suite di post, il controllo creativo non cambia mai mano.
        </p>
        <button className={styles.ghostBtn} onClick={() => onNavigate('/our-team')}>
          Our Team <span aria-hidden="true">↗</span>
        </button>
      </motion.div>
    </section>
  );
}
