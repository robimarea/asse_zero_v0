import styles from './Services.module.css';

const services = [
  {
    id: 1,
    title: 'Video Production',
    description: "Creazione di video professionali per social media, pubblicità e storytelling. Dall'ideazione al montaggio finale, contenuti che emozionano e comunicano.",
    features: ['Riprese Cinematografiche', 'Color Grading Avanzato', 'Motion Graphics'],
    icon: (
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Photography',
    description: "Servizi fotografici professionali per brand, eventi e ritratti. Ogni scatto cattura l'essenza del momento con creatività e attenzione ai dettagli.",
    features: ['Ritratti & Lifestyle', 'Eventi & Corporate', 'Post-Produzione'],
    icon: (
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Content Strategy',
    description: 'Strategie di contenuto per social media e piattaforme digitali. Piani editoriali che aumentano engagement, reach e conversioni del tuo brand.',
    features: ['Piano Editoriale', 'Content Creation', 'Analytics & Reporting'],
    icon: (
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <section id="services" className={styles.section}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">SERVIZI</h2>
          <p className={styles.subtitle}>Trasformo idee creative in contenuti di impatto</p>
        </div>

        <div className={styles.grid}>
          {services.map((s) => (
            <div key={s.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>{s.icon}</div>
                <span className={styles.num}>0{s.id}</span>
              </div>
              <h3 className={styles.title}>{s.title}</h3>
              <div className={styles.details}>
                <p className={styles.desc}>{s.description}</p>
                <ul className={styles.features}>
                  {s.features.map((f) => (
                    <li key={f}>
                      <svg viewBox="0 0 24 24" fill="none">
                        <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* hover-fill bottom line */}
              <div className={styles.hoverLine} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
