import BlurText from './BlurText';
import styles from './Hero.module.css';

const gradientSpanStyle = {
  background: 'linear-gradient(135deg, var(--primary-white), var(--light-blue), var(--primary-blue))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

export default function Hero() {
  return (
    <section id="hero" className={styles.heroSection}>
      <div className={styles.heroContent}>
        <div className={styles.quoteWrapper}>
          <BlurText
            text="ASSE ZERO"
            animateBy="letters"
            direction="top"
            delay={120}
            stepDuration={0.45}
            className={styles.heroTitle}
            spanStyle={gradientSpanStyle}
          />
          <p className={styles.heroAuthor}>Production</p>
        </div>

        <div className={styles.scrollIndicator}>
          <div className={styles.scrollLine} />
          <span className={styles.scrollText}>SCROLL</span>
        </div>
      </div>
    </section>
  );
}