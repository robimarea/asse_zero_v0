/**
 * HomeStory.jsx
 * ─────────────────────────────────────────────────────────────
 * The scroll-driven home experience.
 *
 * Architecture:
 *  • Every block that should reveal gets  data-reveal  on it.
 *  • A single IntersectionObserver watches all  [data-reveal]
 *    elements inside the root div.
 *  • When one enters the viewport the observer adds
 *    data-visible="true" which triggers CSS transitions.
 *  • Different CSS rules handle different entry styles:
 *      – .manifestoInner  → word-by-word heading mask reveal
 *      – .card            → clip-path wipe from bottom
 *      – .diptychPhoto    → clip-path horizontal wipe
 *      – .stripWrap       → fade + marquee kick-off
 *      – .quoteSection    → scale + fade
 *      – .ctaSection      → slide-up fade
 */

import { useEffect, useRef } from 'react';
import { useNavigate }       from 'react-router-dom';
import styles                from './HomeStory.module.css';

/* ── Data ──────────────────────────────────────────────────── */
const SERVICES = [
  { num: '01', title: 'Advertising',  sub: 'Brand · Spot TV · Campaigns',  img: '/photos/f1.jpg' },
  { num: '02', title: 'Short Films',  sub: 'Cinema · Festival · Narrative', img: '/photos/f2.jpg' },
  { num: '03', title: 'Music Videos', sub: 'Artists · Labels · Concerts',   img: '/photos/f3.jpg' },
  { num: '04', title: 'Sound Design', sub: 'Score · Mix · Mastering',       img: '/photos/f4.jpg' },
];

/* Six photos repeated twice for the marquee loop */
const STRIP_SRCS = [
  '/photos/f1.jpg', '/photos/f3.jpg', '/photos/f5.jpg',
  '/photos/f2.jpg', '/photos/f4.jpg', '/photos/f6.jpg',
];

/* ── Component ─────────────────────────────────────────────── */
export default function HomeStory() {
  const navigate = useNavigate();
  const rootRef  = useRef(null);

  /* Single IntersectionObserver for every [data-reveal] element */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll('[data-reveal]');

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-visible', 'true');
            io.unobserve(e.target);           // reveal once, never hide again
          }
        }),
      { threshold: 0.06, rootMargin: '0px 0px -60px 0px' }
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={styles.story}>

      {/* ══════════════════════════════════════════════════════
          01 — MANIFESTO
          Words enter one by one with a masked vertical reveal.
          ══════════════════════════════════════════════════════ */}
      <div className={styles.manifestoWrap} role="region" aria-label="Manifesto">
        <div className={styles.manifestoInner} data-reveal>

          <span className={styles.chip}>Studio di Produzione · Roma</span>

          {/* Each word wrapped in an overflow:hidden mask so the inner
              span can slide up from below without showing outside */}
          <h2 className={styles.manifestoHeading} aria-label="Ogni frame racconta qualcosa.">
            {['Ogni', 'frame', 'racconta', 'qualcosa.'].map((word, i) => (
              <span
                key={i}
                className={styles.wordMask}
                style={{ '--wi': i }}        /* index drives CSS animation-delay */
              >
                <span className={styles.wordInner}>{word}</span>
              </span>
            ))}
          </h2>

          <p className={styles.manifestoBody}>
            Siamo un collettivo creativo specializzato in video production,
            cortometraggi, videoclip musicali, pubblicità e sound design.
            Ogni progetto che tocchiamo viene trattato con la cura e l'intenzione
            di un'opera cinematografica.
          </p>
        </div>

        {/* Decorative vertical text on the far right */}
        <div className={styles.manifestoSide} aria-hidden="true">
          <span>ASSE ZERO</span>
          <span>PRODUCTION</span>
          <span>ROMA · MMXXIV</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          02 — SERVICES
          Cards wipe in from the bottom with a clip-path animation,
          each staggered by 110 ms via --delay.
          ══════════════════════════════════════════════════════ */}
      <div className={styles.servicesWrap} role="region" aria-label="Servizi">

        <div className={styles.servicesHeader} data-reveal>
          <span className={styles.chip}>// Cosa facciamo</span>
          <p className={styles.servicesTagline}>Quattro discipline. Un'unica visione.</p>
        </div>

        <div className={styles.servicesGrid}>
          {SERVICES.map((s, i) => (
            <div
              key={s.num}
              className={styles.card}
              data-reveal
              style={{ '--delay': `${i * 110}ms` }}
              onClick={() => navigate('/servizi')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/servizi')}
            >
              {/* Photo background */}
              <div
                className={styles.cardBg}
                style={{ backgroundImage: `url(${s.img})` }}
              />
              {/* Gradient veil */}
              <div className={styles.cardVeil} />
              {/* Text content */}
              <div className={styles.cardBody}>
                <span className={styles.cardNum}>{s.num}</span>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <p  className={styles.cardSub}>{s.sub}</p>
              </div>
              {/* Hover arrow */}
              <span className={styles.cardArrow} aria-hidden="true">↗</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          03 — DIPTYCH  (photo wipe  |  manifesto text)
          Photo wipes in horizontally from the right edge;
          text and button fade+slide separately.
          ══════════════════════════════════════════════════════ */}
      <div className={styles.diptych} role="region" aria-label="Dichiarazione">

        <div className={styles.diptychPhoto} data-reveal>
          <img src="/photos/f2.jpg" alt="Produzione cinematografica" />
          <span className={styles.photoCaption} aria-hidden="true">Behind the Frame</span>
        </div>

        <div className={styles.diptychText} data-reveal>
          <span className={styles.chip}>// Il nostro standard</span>

          <h2 className={styles.diptychHeading}>
            Non facciamo
            <em> bei video.</em>
            <br />
            Facciamo cose
            <em> che rimangono.</em>
          </h2>

          <p className={styles.diptychBody}>
            La dimensione del progetto non cambia il nostro standard.
            Portiamo la stessa ossessione per il dettaglio a un videoclip
            da camera come a una campagna internazionale.
          </p>

          <button
            className={styles.ghostBtn}
            onClick={() => navigate('/work')}
          >
            Vedi il portfolio <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          04 — FILM STRIP (infinite CSS marquee)
          The whole strip wrapper fades in; inside, the photos
          loop continuously via a CSS animation, evoking a film
          reel being projected.
          ══════════════════════════════════════════════════════ */}
      <div
        className={styles.stripWrap}
        role="region"
        aria-label="Film strip"
        data-reveal
      >
        <div className={styles.stripViewport}>
          {/* Two identical copies = seamless loop:
              when the first set scrolls fully off-screen the
              second set has taken its place, and we reset. */}
          <div className={styles.strip}>
            {[...STRIP_SRCS, ...STRIP_SRCS].map((src, i) => (
              <div key={i} className={styles.frame}>
                <img src={src} alt="" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.stripMeta}>
          <span className={styles.stripLabel}>Frames from the archive —</span>
          <button
            className={styles.stripCta}
            onClick={() => navigate('/work')}
          >
            Portfolio ↗
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          05 — DIRECTOR QUOTE
          Scales up from 96 % → 100 % while fading in, giving a
          cinematic "focus pull" feeling.
          ══════════════════════════════════════════════════════ */}
      <div
        className={styles.quoteSection}
        role="region"
        aria-label="Citazione"
        data-reveal
      >
        <blockquote className={styles.blockQuote}>
          <span className={styles.quoteMark} aria-hidden="true">"</span>
          <p>
            Non mi interessa fare bei video.<br />
            Mi interessa fare cose che rimangono.
          </p>
          <cite>Gerardo Romani — Director &amp; Sound Designer</cite>
        </blockquote>
      </div>

      {/* ══════════════════════════════════════════════════════
          06 — CTA
          ══════════════════════════════════════════════════════ */}
      <div
        className={styles.ctaSection}
        role="region"
        aria-label="Call to action"
        data-reveal
      >
        <span className={styles.ctaEyebrow}>Hai un'idea?</span>
        <h2  className={styles.ctaHeading}>Parliamone.</h2>
        <div className={styles.ctaRow}>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate('/servizi#contact')}
          >
            Inizia un progetto →
          </button>
          <button
            className={styles.outlineBtn}
            onClick={() => navigate('/servizi')}
          >
            Scopri i servizi
          </button>
        </div>
      </div>

    </div>
  );
}
