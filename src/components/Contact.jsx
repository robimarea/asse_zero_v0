import { useState } from 'react';
import styles from './Contact.module.css';

const INITIAL = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm]       = useState(INITIAL);
  const [status, setStatus]   = useState(null); // null | 'success' | 'error'

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulate async send (replace with real fetch/API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('success');
      setForm(INITIAL);
      setTimeout(() => setStatus(null), 5000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className={styles.contactSection}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">CONTATTAMI</h2>
        </div>

        <div className={styles.contactContent}>
          <div className={styles.contactFormWrapper}>
            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nome</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Il tuo nome"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="tua@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject">Oggetto</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  placeholder="Di cosa vuoi parlare?"
                  value={form.subject}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Messaggio</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  placeholder="Scrivi qui il tuo messaggio..."
                  value={form.message}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                <span className={styles.btnText}>Invia Messaggio</span>
                <svg
                  className={styles.btnIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>

              {status && (
                <div
                  className={`${styles.formMessage} ${
                    status === 'success' ? styles.success : styles.error
                  }`}
                >
                  {status === 'success'
                    ? 'Messaggio inviato con successo! Ti risponderò presto.'
                    : "Errore nell'invio del messaggio. Riprova più tardi."}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
