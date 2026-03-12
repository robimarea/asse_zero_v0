import { useState } from 'react';
import styles from './Photos.module.css';

/* ─── Dati foto ───────────────────────────────────────────────────────────────
   src: usa path locali dalla cartella public/photos/
   Struttura cartelle corretta:
     progetto/
     ├── public/
     │   └── photos/
     │       ├── f1.jpg
     │       ├── f2.jpg   ← estensione ESATTA (minuscola su Linux)
     │       └── ...
     ├── src/
     └── index.html
   In Vite i file in public/ si referenziano con /nomefile  (senza 'public')
────────────────────────────────────────────────────────────────────────────── */
const photos = [
  { title: 'Campagna Autunnale',        category: 'Pubblicità',      date: 'Gennaio 2026',   src: '/photos/1.jpeg' },
  { title: 'Brand Identity Shoot',      category: 'Pubblicità',      date: 'Dicembre 2025',  src: '/photos/2.jpeg' },
  { title: 'Luce di Mezzogiorno',       category: 'Cortometraggio',  date: 'Novembre 2025',  src: '/photos/3.jpeg' },
  { title: 'Il Confine',                category: 'Cortometraggio',  date: 'Ottobre 2025',   src: '/photos/4.jpeg' },
  { title: 'Neon Nights',               category: 'Video Musicale',  date: 'Settembre 2025', src: '/photos/5.jpeg' },

];

/* ─── Card singola ───────────────────────────────────────────────────────── */
function Card({ card, index, hovered, setHovered, onOpen }) {
  const isDimmed = hovered !== null && hovered !== index;
  const isActive = hovered === index;

  return (
    <div
      className={[
        styles.card,
        isDimmed ? styles.dimmed : '',
        isActive  ? styles.active  : '',
      ].join(' ')}
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onClick={() => onOpen(card)}
    >
      <img
        src={card.src}
        alt={card.title}
        className={styles.cardImage}
        loading="lazy"
        decoding="async"
      />
      <div className={`${styles.overlay} ${isActive ? styles.overlayVisible : ''}`}>
        <span className={styles.category}>{card.category}</span>
        <span className={styles.title}>{card.title}</span>
        <span className={styles.date}>{card.date}</span>
      </div>
    </div>
  );
}

/* ─── Componente principale ─────────────────────────────────────────────── */
export default function Photos() {
  const [hovered, setHovered]   = useState(null);
  const [lightbox, setLightbox] = useState(null);

  return (
    <section id="photos" className={styles.section}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">LE MIE FOTO</h2>
          <p className={styles.subtitle}>
            Scatti dal set — pubblicità, cortometraggi, videoclip, sound design
          </p>
        </div>

        <div className={styles.grid}>
          {photos.map((card, index) => (
            <Card
              key={index}
              card={card}
              index={index}
              hovered={hovered}
              setHovered={setHovered}
              onOpen={setLightbox}
            />
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className={styles.lightbox}
          onClick={(e) => {
            if (e.target === e.currentTarget || e.target.tagName === 'IMG')
              setLightbox(null);
          }}
        >
          <button
            className={styles.lbClose}
            aria-label="Chiudi"
            onClick={() => setLightbox(null)}
          >✕</button>
          <div className={styles.lbInner}>
            <img src={lightbox.src} alt={lightbox.title} />
            <span className={styles.lbMeta}>
              <span className={styles.lbCategory}>{lightbox.category}</span>
              {' — '}
              <span className={styles.lbTitle}>{lightbox.title}</span>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
