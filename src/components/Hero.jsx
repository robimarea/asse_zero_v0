import BlurText from './BlurText';
import styles   from './Hero.module.css';

const gradientStyle = {
  background:           'linear-gradient(135deg, var(--teal-100), var(--teal-300))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor:  'transparent',
  backgroundClip:       'text',
};

export default function Hero() {
  const scrollToStory = () =>
    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className={styles.hero}>

      <div className={styles.topRow}>
        <span className={styles.topLabel}>Studio di Produzione</span>
        <span className={styles.topYear}>Roma · MMXXVI</span>
      </div>

      <div className={styles.titleBlock} aria-label="Asse Zero">
        <BlurText
          as="div"
          text="ASSE ZERO"
          animateBy="letters"
          direction="top"
          delay={55}
          stepDuration={0.42}
          threshold={0.01}
          className={styles.titleLine}
          style={{ justifyContent: 'flex-start', gap: '0.18em' }}
          spanStyle={gradientStyle}
        />
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

    </section>
  );
}
