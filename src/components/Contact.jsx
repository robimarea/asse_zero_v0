import { useState, useRef } from 'react';
import styles from './Contact.module.css';

import BlurText from './BlurText';
import GlareCard          from './GlareCard';
import useContainerScroll from '../hooks/useContainerScroll';

const INITIAL_FORM = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [form,   setForm]   = useState(INITIAL_FORM);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const wrapperRef          = useRef(null);
  const scrollTransform     = useContainerScroll(wrapperRef);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setForm(INITIAL_FORM);
      setStatus('success');
      setTimeout(() => setStatus(null), 5000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className={styles.section}>

      <div className={styles.sectionHeader}>
        <p className={styles.sectionLabel}>— Parliamoci</p>
        <h1 className={styles.sectionTitle}>
          <BlurText as="span" text="Contattami" />
        </h1>
        <p className={styles.sectionIntro}>
          Hai un progetto in mente? Che si tratti di un videoclip, una campagna,
          un cortometraggio o sound design — siamo qui per ascoltare.
        </p>
      </div>

      <div className={styles.cardSection} ref={wrapperRef}>
        <div className={styles.cardTitle}>
          <span className={styles.cardIndex}>→</span>
          <h2 className={styles.cardHeadline}>
            Scrivici
            <span className={styles.cardSubtitle}>Get in Touch</span>
          </h2>
        </div>

        <div className={styles.cardPerspective}>
          <GlareCard scrollTransform={scrollTransform} className={styles.card}>

            <div className={styles.layout}>

              {/* Left column — contact info */}
              <div className={styles.info}>
                <p className={styles.infoLead}>
                  Hai un progetto in mente?<br />
                  Parliamone.
                </p>
                <p className={styles.infoBody}>
                  Dalla concept strategy alla post-produzione,
                  ogni progetto è un viaggio verso qualcosa che
                  nessuno ha mai visto prima.
                </p>

                <div className={styles.contactDetails}>
                  <span className={styles.contactLabel}>Email</span>
                  <a href="mailto:gerardo@example.com" className={styles.contactLink}>
                    gerardo@example.com
                  </a>
                  <span className={styles.contactLabel}>Instagram</span>
                  <a href="https://instagram.com" className={styles.contactLink}
                    target="_blank" rel="noopener noreferrer">
                    @gerardoromani
                  </a>
                </div>

                <div className={styles.accentBar} />
              </div>

              {/* Right column — contact form */}
              <div className={styles.formCol}>
                <form className={styles.form} onSubmit={handleSubmit}>

                  <div className={styles.row}>
                    <div className={styles.group}>
                      <label htmlFor="name">Nome</label>
                      <input type="text" id="name" name="name" required
                        placeholder="Il tuo nome"
                        value={form.name} onChange={handleChange} />
                    </div>
                    <div className={styles.group}>
                      <label htmlFor="email">Email</label>
                      <input type="email" id="email" name="email" required
                        placeholder="tua@email.com"
                        value={form.email} onChange={handleChange} />
                    </div>
                  </div>

                  <div className={styles.group}>
                    <label htmlFor="subject">Oggetto</label>
                    <input type="text" id="subject" name="subject" required
                      placeholder="Di cosa vuoi parlare?"
                      value={form.subject} onChange={handleChange} />
                  </div>

                  <div className={styles.group}>
                    <label htmlFor="message">Messaggio</label>
                    <textarea id="message" name="message" rows="6" required
                      placeholder="Descrivi il tuo progetto..."
                      value={form.message} onChange={handleChange} />
                  </div>

                  <button type="submit" className={styles.btn}>
                    <span>Invia Messaggio</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>

                  {status && (
                    <div className={`${styles.msg} ${styles[status]}`} role="alert">
                      {status === 'success'
                        ? 'Messaggio inviato! Ti risponderò presto.'
                        : "Errore nell'invio. Riprova più tardi."}
                    </div>
                  )}

                </form>
              </div>

            </div>
          </GlareCard>
        </div>
      </div>

    </section>
  );
}
