/**
 * Services.jsx
 * ContainerScroll animation + GlareCard al mouse — tutto inline.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from './Services.module.css';


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

/* ─── GlareCard wrapper (inline) ───────────────────────────── */
function GlareCard({ children, accent, bg, textColor, scrollTransform }) {
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
      style={{ transform, background: bg, color: textColor }}
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

/* ─── Dati dei servizi ─────────────────────────────────────── */
const SERVICES = [
  {
    id: 'pubblicita',
    index: '01',
    title: 'Pubblicità',
    subtitle: 'Advertising & Commercial',
    description:
      'Creiamo campagne pubblicitarie che colpiscono nel segno. Dalla concept strategy alla post-produzione, ogni spot racconta il tuo brand con precisione chirurgica e impatto visivo duraturo.',
    tags: ['Brand Film', 'Spot TV', 'Digital Ads', 'Corporate Video'],
    accent: '#FF3B00',
    bg: '#0a0a0a',
    textColor: '#fff',
    graphic: 'adv',
  },
  {
    id: 'cortometraggi',
    index: '02',
    title: 'Cortometraggi',
    subtitle: 'Short Films',
    description:
      'La narrazione è al centro di tutto. Sviluppiamo sceneggiature originali, dirigiamo set complessi e curiamo ogni frame per portare sul grande schermo storie che rimangono impresse.',
    tags: ['Sceneggiatura', 'Regia', 'Casting', 'Color Grading'],
    accent: '#C8A951',
    bg: '#080810',
    textColor: '#f5f0e8',
    graphic: 'film',
  },
  {
    id: 'videoclip',
    index: '03',
    title: 'Video Musicali',
    subtitle: 'Music Videos',
    description:
      'Traduciamo ogni traccia in un universo visivo. Concept art, coreografie, effetti speciali in camera e un editing al ritmo della musica per video che diventano icone.',
    tags: ['Concept Art', 'Performance', 'VFX', 'Live Action'],
    accent: '#9B30FF',
    bg: '#06010f',
    textColor: '#fff',
    graphic: 'music',
  },
  {
    id: 'sounddesign',
    index: '04',
    title: 'Sound Design',
    subtitle: 'Audio & Music Production',
    description:
      'Il suono che non senti è quello che senti di più. Composizione originale, sound design immersivo, mix e mastering per ogni formato: cinema, streaming, broadcast.',
    tags: ['Colonna Sonora', 'Foley', 'Mix & Master', 'Spatial Audio'],
    accent: '#00C8FF',
    bg: '#010810',
    textColor: '#e8f5ff',
    graphic: 'sound',
  },
];

/* ─── SVG grafiche ─────────────────────────────────────────── */
function GraphicAdv() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svgGraphic}>
      <rect x="20" y="20" width="360" height="260" rx="4" stroke="#FF3B00" strokeWidth="1.5" strokeDasharray="8 4" />
      <text x="200" y="168" textAnchor="middle" fontSize="120" fontWeight="900" fill="#FF3B00" opacity="0.12" fontFamily="serif">ADV</text>
      <line x1="20" y1="80" x2="380" y2="80" stroke="#FF3B00" strokeWidth="0.8" opacity="0.4" />
      <line x1="20" y1="240" x2="380" y2="240" stroke="#FF3B00" strokeWidth="0.8" opacity="0.4" />
      <circle cx="50" cy="50" r="8" fill="#FF3B00" opacity="0.6" />
      <circle cx="350" cy="50" r="8" fill="#FF3B00" opacity="0.6" />
      <circle cx="50" cy="260" r="8" fill="#FF3B00" opacity="0.6" />
      <circle cx="350" cy="260" r="8" fill="#FF3B00" opacity="0.6" />
      <rect x="60" y="100" width="280" height="120" rx="2" fill="#FF3B00" opacity="0.05" />
      <text x="200" y="168" textAnchor="middle" fontSize="14" fill="#FF3B00" opacity="0.7" fontFamily="monospace">FRAME 001</text>
    </svg>
  );
}

function GraphicFilm() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svgGraphic}>
      <rect x="0" y="80" width="400" height="140" fill="#C8A951" opacity="0.06" />
      {[0,1,2,3,4,5,6,7].map(i => (
        <g key={i}>
          <rect x={i * 50 + 5} y="90" width="16" height="20" rx="2" fill="#C8A951" opacity="0.3" />
          <rect x={i * 50 + 5} y="190" width="16" height="20" rx="2" fill="#C8A951" opacity="0.3" />
        </g>
      ))}
      <rect x="30" y="110" width="340" height="80" rx="2" fill="#C8A951" opacity="0.04" stroke="#C8A951" strokeWidth="0.8" strokeOpacity="0.3" />
      <text x="200" y="158" textAnchor="middle" fontSize="11" fill="#C8A951" opacity="0.5" fontFamily="monospace" letterSpacing="6">SCENE / TAKE / ROLL</text>
      <circle cx="200" cy="150" r="60" stroke="#C8A951" strokeWidth="0.6" opacity="0.15" />
      <circle cx="200" cy="150" r="40" stroke="#C8A951" strokeWidth="0.6" opacity="0.15" />
    </svg>
  );
}

function GraphicMusic() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svgGraphic}>
      {[18,35,55,70,40,85,60,45,90,65,30,75,50,88,42,72,38,62,80,48].map((h, i) => (
        <rect key={i} x={i * 20 + 10} y={150 - h} width="10" height={h * 2} rx="5"
          fill="#9B30FF" opacity={0.1 + (i % 3) * 0.08} />
      ))}
      <circle cx="200" cy="150" r="80" stroke="#9B30FF" strokeWidth="1" opacity="0.2" strokeDasharray="4 6" />
      <circle cx="200" cy="150" r="50" stroke="#9B30FF" strokeWidth="0.8" opacity="0.15" />
      <text x="200" y="158" textAnchor="middle" fontSize="32" fontWeight="900" fill="#9B30FF" opacity="0.15" fontFamily="serif">♪</text>
    </svg>
  );
}

function GraphicSound() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svgGraphic}>
      <path d="M0 150 Q50 80 100 150 Q150 220 200 150 Q250 80 300 150 Q350 220 400 150"
        stroke="#00C8FF" strokeWidth="2" opacity="0.3" fill="none" />
      <path d="M0 150 Q25 110 50 150 Q75 190 100 150 Q125 110 150 150 Q175 190 200 150 Q225 110 250 150 Q275 190 300 150 Q325 110 350 150 Q375 190 400 150"
        stroke="#00C8FF" strokeWidth="1" opacity="0.15" fill="none" />
      {[20, 40, 60, 80, 100, 130].map((r, i) => (
        <circle key={i} cx="200" cy="150" r={r} stroke="#00C8FF" strokeWidth="0.6" opacity={0.25 - i * 0.03} />
      ))}
      <circle cx="200" cy="150" r="6" fill="#00C8FF" opacity="0.6" />
    </svg>
  );
}

const GRAPHICS = { adv: GraphicAdv, film: GraphicFilm, music: GraphicMusic, sound: GraphicSound };

/* ─── Singola Card ─────────────────────────────────────────── */
function ServiceCard({ service, cardIndex }) {
  const wrapperRef = useRef(null);
  const Graphic = GRAPHICS[service.graphic];
  const scrollTransform = useContainerScroll(wrapperRef);

  return (
    <div
      className={styles.cardSection}
      ref={wrapperRef}
      style={{
        '--accent': service.accent,
        '--z': cardIndex,
      }}
    >
      <div className={styles.cardTitle}>
        <span className={styles.cardIndex}>{service.index}</span>
        <h2 className={styles.cardHeadline}>
          {service.title}
          <span className={styles.cardSubtitle}>{service.subtitle}</span>
        </h2>
      </div>

      <div className={styles.cardPerspective}>
        <GlareCard
          accent={service.accent}
          bg={service.bg}
          textColor={service.textColor}
          scrollTransform={scrollTransform}
        >
          <div className={styles.cardGraphicCol}>
            <Graphic />
            <div className={styles.cardAccentBar} style={{ background: service.accent }} />
          </div>

          <div className={styles.cardContent}>
            <p className={styles.cardDesc}>{service.description}</p>
            <ul className={styles.cardTags}>
              {service.tags.map(tag => (
                <li key={tag} className={styles.cardTag}
                  style={{ borderColor: service.accent, color: service.accent }}>
                  {tag}
                </li>
              ))}
            </ul>
            <a href="/contatti" className={styles.cardCta} style={{ '--accent': service.accent }}>
              Scopri di più
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </GlareCard>
      </div>
    </div>
  );
}

/* ─── Componente principale ───────────────────────────────── */
export default function Services() {
  return (
    <section className={styles.servicesSection}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionLabel}>— Cosa facciamo</p>
        <h1 className={styles.sectionTitle}><BlurText text="I Nostri Servizi" /></h1>
        <p className={styles.sectionIntro}>
          Dalla strategia creativa alla post-produzione, ogni progetto è un viaggio
          verso qualcosa che nessuno ha mai visto prima.
        </p>
      </div>

      <div className={styles.cardsStack}>
        {SERVICES.map((service, i) => (
          <ServiceCard key={service.id} service={service} cardIndex={i} />
        ))}
      </div>
    </section>
  );
}
