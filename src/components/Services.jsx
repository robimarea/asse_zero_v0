import styles from './Services.module.css';

const services = [
  {
    id: 1,
    title: 'Video Production',
    description:
      "Creazione di video professionali per social media, pubblicità e storytelling. Dall'ideazione al montaggio finale, realizzo contenuti che emozionano e comunicano il tuo messaggio.",
    features: ['Riprese Cinematografiche', 'Color Grading Avanzato', 'Motion Graphics'],
    icon: (
      <svg className={styles.serviceIcon} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Photography',
    description:
      "Servizi fotografici professionali per brand, eventi e ritratti. Ogni scatto cattura l'essenza del momento con creatività e attenzione maniacale ai dettagli.",
    features: ['Ritratti & Lifestyle', 'Eventi & Corporate', 'Post-Produzione'],
    icon: (
      <svg className={styles.serviceIcon} viewBox="0 0 24 24" fill="none">
        <path
          d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Content Strategy',
    description:
      'Strategie di contenuto per social media e piattaforme digitali. Creo piani editoriali che aumentano engagement, reach e conversioni del tuo brand.',
    features: ['Piano Editoriale', 'Content Creation', 'Analytics & Reporting'],
    icon: (
      <svg className={styles.serviceIcon} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L2 7l10 5 10-5-10-5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <section id="services" className={styles.servicesSection}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">SERVIZI</h2>
          <p className={styles.servicesSubtitle}>Trasformo idee creative in contenuti di impatto</p>
        </div>

        <div className={styles.servicesInteractiveGrid}>
          {services.map((service) => (
            <div key={service.id} className={styles.serviceInteractiveCard}>
              <div className={styles.serviceCardGlow} />
              <div className={styles.serviceCardContent}>
                <div className={styles.serviceIconContainer}>{service.icon}</div>
                <h3 className={styles.serviceCardTitle}>{service.title}</h3>
                <div className={styles.serviceNumber}>0{service.id}</div>

                <div className={styles.serviceDetails}>
                  <p className={styles.serviceCardDescription}>{service.description}</p>
                  <ul className={styles.serviceFeaturesList}>
                    {service.features.map((feature) => (
                      <li key={feature}>
                        <svg viewBox="0 0 24 24" fill="none">
                          <polyline
                            points="20 6 9 17 4 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
