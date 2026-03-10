import styles from './About.module.css';

export default function About() {
  return (
    <section id="about" className={styles.aboutSection}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">CHI SIAMO</h2>
        </div>

        <div className={styles.aboutGrid}>
          <div className={styles.aboutImageWrapper}>
            <div className={styles.imageFrame}>
              <img
                src="/photos/profilo.jpeg"
                alt="Gerardo Romani"
                className={styles.profileImage}
              />
              <div className={styles.imageGlow} />
            </div>
          </div>

          <div className={styles.aboutContent}>
            <h3 className={styles.nameTitle}>Zero Asse</h3>
            <div className={styles.nameUnderline} />
            <p className={styles.bioText}>
              Siamo un team di creativi appassionati di storytelling visivo.
              Attraverso i nostri video raccontiamo storie che emozionano e ispirano,
              combinando creatività e tecnica per creare esperienze uniche.
            </p>

            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>50K+</span>
                <span className={styles.statLabel}>Views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
