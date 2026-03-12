/**
 * Contact.jsx
 * ─────────────────────────────────────────────────────────────
 * Stessa struttura di Services.jsx:
 *  - ContainerScroll: la card entra con rotateX 3D e si appiattisce
 *  - GlareCard: tilt al mouse + riflesso radiale che segue il cursore
 * Tutto inline — nessun import esterno.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Contact.module.css';

/* ─── BlurText (inline) ────────────────────────────────────── */
function BlurText({ text, className }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <span ref={ref} className={className} aria-label={text} style={{ display: 'inline-block' }}>
      {text.split(' ').map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            marginRight: '0.22em',
            opacity: visible ? 1 : 0,
            filter: visible ? 'blur(0px)' : 'blur(12px)',
            transform: visible ? 'translateY(0)' : 'translateY(18px)',
            transition: `opacity 0.6s ease ${i * 0.1}s, filter 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}


const INITIAL = { name: '', email: '', subject: '', message: '' };

/* ─── ContainerScroll hook ──────────────────────────────────── */
function useContainerScroll(wrapperRef) {
  const [t, setT] = useState({ rotateX: 18, scale: 0.88, translateY: 0 });

  const onScroll = useCallback(() => {
    if (!wrapperRef.current) return;
    const { top } = wrapperRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(1, Math.max(0, 1 - top / (vh * 0.8)));
    setT({
      rotateX:    18 * (1 - progress),
      scale:       0.88 + 0.12 * progress,
      translateY: -40 * (1 - progress),
    });
  }, [wrapperRef]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return t;
}

/* ─── GlareCard wrapper ─────────────────────────────────────── */
function GlareCard({ children, scrollTransform }) {
  const cardRef = useRef(null);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [tilt, setTilt]   = useState({ rx: 0, ry: 0 });

  const onMouseMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top)  / rect.height;
    setTilt({ rx: (py - 0.5) * -8, ry: (px - 0.5) * 8 });
    setGlare({ x: px * 100, y: py * 100, opacity: 0.18 });
  }, []);

  const onMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
    setGlare(g => ({ ...g, opacity: 0 }));
  }, []);

  const transform = `
    perspective(1000px)
    rotateX(${scrollTransform.rotateX + tilt.rx}deg)
    rotateY(${tilt.ry}deg)
    scale(${scrollTransform.scale})
    translateY(${scrollTransform.translateY}px)
  `;

  return (
    <div
      ref={cardRef}
      className={styles.card}
      style={{ transform }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Glare overlay */}
      <div
        aria-hidden="true"
        className={styles.glareOverlay}
        style={{
          background: `radial-gradient(
            circle at ${glare.x}% ${glare.y}%,
            rgba(255,255,255,${glare.opacity}) 0%,
            rgba(255,255,255,0.03) 40%,
            transparent 70%
          )`,
        }}
      />
      {children}
    </div>
  );
}

/* ─── Componente principale ───────────────────────────────── */
export default function Contact() {
  const [form, setForm]     = useState(INITIAL);
  const [status, setStatus] = useState(null);
  const wrapperRef          = useRef(null);
  const scrollTransform     = useContainerScroll(wrapperRef);

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

      {/* Section header — stesso stile di Services */}
      <div className={styles.sectionHeader}>
        <p className={styles.sectionLabel}>— Parliamoci</p>
        <h1 className={styles.sectionTitle}><BlurText text="Contattami" /></h1>
        <p className={styles.sectionIntro}>
          Hai un progetto in mente? Che si tratti di un videoclip, una campagna,
          un cortometraggio o sound design — siamo qui per ascoltare.
        </p>
      </div>

      {/* Card wrapper con ContainerScroll */}
      <div className={styles.cardSection} ref={wrapperRef}>

        {/* Title sopra la card — stesso pattern di Services */}
        <div className={styles.cardTitle}>
          <span className={styles.cardIndex}>→</span>
          <h2 className={styles.cardHeadline}>
            Scrivici
            <span className={styles.cardSubtitle}>Get in Touch</span>
          </h2>
        </div>

        {/* Perspective wrapper */}
        <div className={styles.cardPerspective}>
          <GlareCard scrollTransform={scrollTransform}>

            <div className={styles.layout}>

              {/* Colonna sinistra: info */}
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

                {/* Accent bar decorativa */}
                <div className={styles.accentBar} />
              </div>

              {/* Colonna destra: form */}
              <div className={styles.formCol}>
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.row}>
                    <div className={styles.group}>
                      <label htmlFor="name">Nome</label>
                      <input type="text" id="name" name="name" required
                        placeholder="Il tuo nome" value={form.name} onChange={handleChange} />
                    </div>
                    <div className={styles.group}>
                      <label htmlFor="email">Email</label>
                      <input type="email" id="email" name="email" required
                        placeholder="tua@email.com" value={form.email} onChange={handleChange} />
                    </div>
                  </div>

                  <div className={styles.group}>
                    <label htmlFor="subject">Oggetto</label>
                    <input type="text" id="subject" name="subject" required
                      placeholder="Di cosa vuoi parlare?" value={form.subject} onChange={handleChange} />
                  </div>

                  <div className={styles.group}>
                    <label htmlFor="message">Messaggio</label>
                    <textarea id="message" name="message" rows="6" required
                      placeholder="Descrivi il tuo progetto..." value={form.message} onChange={handleChange} />
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
          </GlareCard>
        </div>
      </div>
    </section>
  );
}
