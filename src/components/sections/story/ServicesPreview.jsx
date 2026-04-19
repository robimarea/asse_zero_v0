import { motion } from 'framer-motion';
import { SERVICES_PREVIEW as SERVICES } from '@data/constants';
import styles from './ServicesPreview.module.css';

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

export default function ServicesPreview({ onNavigate }) {
  return (
    <section className={styles.servicesWrap} aria-label="Servizi">
      <motion.div
        className={styles.servicesHeader}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariants}
      >
        <span className={styles.chip}>// Cosa facciamo</span>
        <p className={styles.servicesTagline}>Quattro discipline. Un'unica visione.</p>
      </motion.div>

      <div className={styles.servicesGrid}>
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.num}
            className={styles.card}
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
            data-cursor="view"
            onClick={() => onNavigate('/servizi')}
            role="button"
            tabIndex={0}
            aria-label={`${s.title} — ${s.sub}`}
          >
            <div className={styles.cardBg} style={{ backgroundImage: `url(${s.img})` }} />
            <div className={styles.cardVeil} />
            <div className={styles.cardBody}>
              <span className={styles.cardNum}>{s.num}</span>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardSub}>{s.sub}</p>
            </div>
            <span className={styles.cardArrow} aria-hidden="true">↗</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
