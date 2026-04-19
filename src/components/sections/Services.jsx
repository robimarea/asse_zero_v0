import styles from './Services.module.css';
import SimpleBlurText from '@ui/SimpleBlurText';
import PricingBookCard from '@ui/PricingBookCard';
import { SERVICES_VIDEO, SERVICES_SOCIAL } from '@data/constants';

function CategorySection({ label, title, intro, services, onContact }) {
  return (
    <div className={styles.categorySection}>
      <div className={styles.categoryHeader}>
        <p className={styles.categoryLabel}>{label}</p>
        <h2 className={styles.categoryTitle}>{title}</h2>
        <p className={styles.categoryIntro}>{intro}</p>
      </div>
      <div className={styles.wheelWrapper}>
        <div className={styles.wheelInner} style={{ '--quantity': services.length }}>
          {services.map((service, idx) => (
            <div key={service.id} className={styles.wheelCard} style={{ '--index': idx }}>
              <PricingBookCard service={service} onContact={onContact} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.cardsGridMobile}>
        {services.map((service) => (
          <div key={service.id} className={styles.cardFallback}>
            <PricingBookCard service={service} onContact={onContact} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Services() {
  const goToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.servicesSection}>
      <div
      className={styles.sectionHeader}
      >
        <p className={styles.sectionLabel}>- Cosa facciamo</p>
        <h1 className={styles.sectionTitle}>
          <SimpleBlurText as="span" text="I Nostri Servizi" />
        </h1>
        <p className={styles.sectionIntro}>
          Dalla strategia creativa alla post-produzione, ogni progetto e un viaggio
          verso qualcosa che nessuno ha mai visto prima.
        </p>
      </div>

      <div className={styles.centeringBlock}>
        <CategorySection
          label="- 01 / Produzione"
          title="Produzione Video"
          intro="Spot pubblicitari, cortometraggi e videoclip musicali. Direzione artistica totale, dal concept al master."
          services={SERVICES_VIDEO}
          onContact={goToContact}
        />
      </div>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerDot} />
        <span className={styles.dividerLine} />
      </div>

      <div className={styles.centeringBlock}>
        <CategorySection
          label="- 02 / Digital"
          title="Social Media Management"
          intro="Strategia, content creation e community management per una presenza online che converte."
          services={SERVICES_SOCIAL}
          onContact={goToContact}
        />
      </div>
    </section>
  );
}
