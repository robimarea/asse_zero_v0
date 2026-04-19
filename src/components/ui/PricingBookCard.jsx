import styles from './PricingBookCard.module.css';

const PACKAGE_DETAILS = {
  pubblicita: {
    collection: 'Pacchetto produzione',
    investment: 'Da 1.800 EUR',
    pricingLabel: 'Una tantum',
    offer: 'Spot hero + cut verticali',
    features: ['Concept', 'Riprese', 'Montaggio', 'Color'],
    cta: 'Richiedi il pacchetto',
  },
  cortometraggi: {
    collection: 'Pacchetto regia',
    investment: 'Da 2.400 EUR',
    pricingLabel: 'Una tantum',
    offer: 'Short film + trailer',
    features: ['Scrittura', 'Prep', 'Regia', 'Post'],
    cta: 'Parliamo del progetto',
  },
  videoclip: {
    collection: 'Pacchetto music video',
    investment: 'Da 1.600 EUR',
    pricingLabel: 'Una tantum',
    offer: 'Videoclip + teaser social',
    features: ['Moodboard', 'Setup', 'Edit', 'Styling'],
    cta: 'Prenota una call',
  },
  sounddesign: {
    collection: 'Pacchetto post audio',
    investment: 'Da 900 EUR',
    pricingLabel: 'Una tantum',
    offer: 'Sound design + master',
    features: ['Design', 'Foley', 'Mix', 'Export'],
    cta: 'Attiva il servizio',
  },
  strategy: {
    collection: 'Pacchetto strategia',
    investment: 'Da 650 EUR',
    pricingLabel: 'Una tantum',
    offer: 'Roadmap editoriale + KPI',
    features: ['Audit', 'Tone', 'Piano', 'Metriche'],
    cta: 'Imposta la strategia',
  },
  content: {
    collection: 'Pacchetto content',
    investment: 'Da 1.200 EUR',
    pricingLabel: 'Una tantum',
    offer: 'Contenuti verticali + cover',
    features: ['Riprese', 'Montaggi', 'Hook', 'Cover'],
    cta: 'Costruiamo il piano',
  },
  community: {
    collection: 'Pacchetto community',
    investment: 'Da 950 EUR',
    pricingLabel: 'Una tantum',
    offer: 'Setup community + guidelines',
    features: ['Reply', 'Moderazione', 'Insight', 'Growth'],
    cta: 'Avvia il setup',
  },
};

export default function PricingBookCard({ service, onContact }) {
  const details = PACKAGE_DETAILS[service.id] ?? {
    collection: 'Pacchetto servizio',
    investment: 'Su misura',
    pricingLabel: 'Una tantum',
    offer: service.tags?.slice(0, 2).join(' + ') ?? 'Output su progetto',
    features: service.tags?.slice(0, 4) ?? [],
    cta: 'Scopri il pacchetto',
  };

  return (
    <article className={styles.card} style={{ '--card-accent': service.accent }}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.topRow}>
        <span className={styles.index}>{service.index}</span>
        <p className={styles.collection}>{details.collection}</p>
      </div>

      <div className={styles.header}>
        <p className={styles.heading}>{service.title}</p>
        <p className={styles.subtitle}>{service.subtitle}</p>
      </div>

      <div className={styles.priceBlock}>
        <p className={styles.price}>{details.investment}</p>
        <p className={styles.pricingLabel}>{details.pricingLabel}</p>
      </div>

      <div className={styles.offerBlock}>
        <p className={styles.offerLabel}>Cosa include</p>
        <p className={styles.offerValue}>{details.offer}</p>
      </div>

      <ul className={styles.bullets} role="list">
        {details.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <button type="button" onClick={onContact} className={styles.cta}>
        {details.cta}
      </button>
    </article>
  );
}
