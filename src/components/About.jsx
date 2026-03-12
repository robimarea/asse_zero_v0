import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './About.module.css';

const PROCESS = [
  { n: '01', phase: 'Sviluppo',       desc: 'Ascoltiamo, ricerchiamo, costruiamo il concept. La storia prima di tutto.' },
  { n: '02', phase: 'Pre-produzione', desc: 'Storyboard, scouting, cast. Ogni dettaglio è pianificato prima che la camera giri.' },
  { n: '03', phase: 'Produzione',     desc: 'Sul set con crew selezionata. Direzione artistica totale, dal primo all\'ultimo frame.' },
  { n: '04', phase: 'Post',           desc: 'Color grading, sound design, mix. Dove i fotogrammi diventano cinema.' },
];

export default function About() {
  const navigate    = useNavigate();
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
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add(styles.visible)),
      { threshold: 0.12 }
    );
    revealRefs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const reveal = (i) => (el) => { revealRefs.current[i] = el; };

  return (
    <section id="about" className={styles.about} ref={sectionRef}>
      <div className="container">

        {/* ── A: Opening tag ──────────────────────────────────────── */}
        <div className={styles.tagLine} ref={reveal(0)}>
          <span className={styles.tagDash} />
          <span className={styles.tagText}>Studio di Produzione</span>
          <span className={styles.tagDash} />
        </div>

        {/* ── B: Hero statement ───────────────────────────────────── */}
        <h2 className={styles.heroStatement} ref={reveal(1)}>
          Raccontiamo storie<br />
          <span className={styles.heroOutline}>attraverso immagini.</span>
        </h2>

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
              Siamo un collettivo creativo specializzato in video production,
              cortometraggi, videoclip musicali, pubblicità e sound design.
              Ogni progetto che tocchiamo viene trattato con la cura e l'intenzione
              di un'opera cinematografica.
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
              alla loro prima opera. La dimensione del progetto non cambia
              il nostro standard: portiamo la stessa ossessione per il dettaglio
              a un videoclip da camera come a una campagna per un brand internazionale.
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
              onClick={() => navigate('/servizi')}
            >
              Vedi i servizi
            </button>
            <button
              className={styles.btnSecondary}
              onClick={() => navigate('/servizi#contact')}
            >
              Inizia un progetto →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
