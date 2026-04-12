import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTransition } from '@context/TransitionContext';
import { PROCESS_STEPS as PROCESS } from '@data/constants';
import styles from './About.module.css';

import SimpleBlurText from '@ui/SimpleBlurText';

export default function About() {
  const navigate    = useNavigate();
  const transit     = usePageTransition();
  const sectionRef  = useRef(null);
  const imgARef     = useRef(null);
  const imgBRef     = useRef(null);
  const revealRefs  = useRef([]);

  /* ── Parallax on two inset images ───────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      const sec = sectionRef.current;
      if (!sec) return;
      const prog = -sec.getBoundingClientRect().top;
      if (imgARef.current) imgARef.current.style.transform = `translateY(${prog * 0.07}px)`;
      if (imgBRef.current) imgBRef.current.style.transform = `translateY(${prog * -0.05}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Reveal on scroll ────────────────────────────────────────────── */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.visible);
            io.unobserve(e.target); // Unobserve to save memory once revealed
          }
        });
      },
      { threshold: 0.12 }
    );
    revealRefs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const reveal = (i) => (el) => { revealRefs.current[i] = el; };

  return (
    <section id="about" className={styles.about} ref={sectionRef} data-chapter="about">
      <div className="container">

        {/* ── A: Chapter heading ──────────────────────────────────── */}
        <div className={styles.tagLine} ref={reveal(0)}>
          <span className={styles.tagDash} />
          <span className={styles.tagText}>Chi siamo</span>
          <span className={styles.tagDash} />
        </div>

        {/* ── B: Hero statement ───────────────────────────────────── */}
        <div className={styles.heroStatementWrap}>
          <SimpleBlurText
            text="Raccontiamo storie attraverso immagini."
            className={styles.heroStatement}
          />
        </div>

        {/* ── C: Two-column intro ─────────────────────────────────── */}
        <div className={styles.introRow} ref={reveal(2)}>
          <div className={styles.imageBlockA}>
            <div className={styles.imageAInner} ref={imgARef}>
              <img src="/photos/f1.jpg" alt="Set cinematografico" />
              <div className={styles.imageCaption}>Behind the frame</div>
            </div>
          </div>

          <div className={styles.introText}>
            <p className={styles.leadText}>
              Siamo Gerardo Romani e un nucleo di collaboratori selezionati.
              Ogni progetto è diretto — non prodotto in serie.
              Portiamo la stessa testa creativa a un videoclip indipendente
              come a una campagna televisiva.
            </p>

            <blockquote className={styles.directorQuote}>
              <p>
                "Non mi interessa fare bei video.<br />
                Mi interessa fare cose che rimangono."
              </p>
              <cite>Gerardo Romani — Director &amp; Sound Designer</cite>
            </blockquote>
          </div>
        </div>

        {/* ── D: Full-width pull quote ─────────────────────────────── */}
        <div className={styles.pullQuote} ref={reveal(3)}>
          <span className={styles.pullMark}>"</span>
          <p className={styles.pullText}>
            Ogni fotogramma è una decisione.<br />Ogni suono, un'intenzione.
          </p>
        </div>

        {/* ── E: Second image + strengths text ────────────────────── */}
        <div className={styles.strengthsRow} ref={reveal(4)}>
          <div className={styles.strengthsLeft}>
            <span className={styles.sectionMicro}>// Il nostro approccio</span>
            <p className={styles.strengthsBody}>
              Lavoriamo con brand emergenti, artisti indipendenti e registi
              alla loro prima opera. Non abbiamo un formato standard:
              costruiamo ogni progetto attorno alla storia che deve raccontare,
              senza mai separare la direzione artistica dalla produzione.
            </p>
            <p className={styles.strengthsBody}>
              Il sound design non è un'aggiunta — è metà della storia.
              Coloriamo, mixiamo e masteriziamo in-house, mantenendo
              una visione coerente dall'inizio alla fine.
            </p>
          </div>

          <div className={styles.imageBlockB}>
            <div className={styles.imageBInner} ref={imgBRef}>
              <img src="/photos/f3.jpg" alt="Direzione artistica" />
            </div>
            <div className={styles.imageBLabel}>
              <span>Post-production</span>
              <span>Color · Sound · Mix</span>
            </div>
          </div>
        </div>

        {/* ── F: Process phases ───────────────────────────────────── */}
        <div className={styles.processSection} ref={reveal(5)}>
          <div className={styles.processHeader}>
            <span className={styles.sectionMicro}>// Il processo</span>
            <h3 className={styles.processTitle}>Dal concept al master</h3>
          </div>
          <div className={styles.processGrid}>
            {PROCESS.map((p) => (
              <div key={p.n} className={styles.phaseItem}>
                <span className={styles.phaseNum}>{p.n}</span>
                <div className={styles.phaseBody}>
                  <h4 className={styles.phaseTitle}>{p.phase}</h4>
                  <p  className={styles.phaseDesc}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── G: Final CTA ────────────────────────────────────────── */}
        <div className={styles.ctaBar} ref={reveal(6)}>
          <p className={styles.ctaTagline}>Hai un'idea. Noi la rendiamo reale.</p>
          <div className={styles.ctaButtons}>
            <button
              className={styles.btnPrimary}
              onClick={() => transit(() => navigate('/servizi'))}
            >
              Vedi i servizi
            </button>
            <button
              className={styles.btnSecondary}
              onClick={() => transit(() => navigate('/servizi'))}
            >
              Inizia un progetto →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
