import { useState } from 'react';
import styles from './Contact.module.css';

const INITIAL = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm]     = useState(INITIAL);
  const [status, setStatus] = useState(null);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setStatus('success');
      setForm(INITIAL);
      setTimeout(() => setStatus(null), 5000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className={styles.section}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">CONTATTAMI</h2>
        </div>

        <div className={styles.layout}>
          {/* left: info block */}
          <div className={styles.info}>
            <p className={styles.infoLead}>
              Hai un progetto in mente?<br />
              Parliamone.
            </p>
            <p className={styles.infoBody}>
              Che si tratti di un videoclip, una campagna pubblicitaria, 
              un cortometraggio o un progetto di sound design — 
              siamo qui per ascoltare.
            </p>
            <div className={styles.contact_details}>
              <span className={styles.contactLabel}>Email</span>
              <a href="mailto:gerardo@example.com" className={styles.contactLink}>gerardo@example.com</a>
              <span className={styles.contactLabel}>Instagram</span>
              <a href="https://instagram.com" className={styles.contactLink} target="_blank" rel="noopener noreferrer">@gerardoromani</a>
            </div>
          </div>

          {/* right: form */}
          <div className={styles.formWrap}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.group}>
                  <label htmlFor="name">Nome</label>
                  <input type="text" id="name" name="name" required placeholder="Il tuo nome" value={form.name} onChange={handleChange} />
                </div>
                <div className={styles.group}>
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" required placeholder="tua@email.com" value={form.email} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.group}>
                <label htmlFor="subject">Oggetto</label>
                <input type="text" id="subject" name="subject" required placeholder="Di cosa vuoi parlare?" value={form.subject} onChange={handleChange} />
              </div>

              <div className={styles.group}>
                <label htmlFor="message">Messaggio</label>
                <textarea id="message" name="message" rows="6" required placeholder="Descrivi il tuo progetto..." value={form.message} onChange={handleChange} />
              </div>

              <button type="submit" className={styles.btn}>
                <span>Invia Messaggio</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>

              {status && (
                <div className={`${styles.msg} ${styles[status]}`}>
                  {status === 'success'
                    ? 'Messaggio inviato! Ti risponderò presto.'
                    : "Errore nell'invio. Riprova più tardi."}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
