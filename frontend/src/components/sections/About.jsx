import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTransition } from '@context/TransitionContext';
import { PROCESS_STEPS as PROCESS } from '@data/constants';
import SimpleBlurText from '@ui/SimpleBlurText';
import styles from './About.module.css';

const TEAM_MEMBERS = [
  {
    name: 'ASSE ZERO Core',
    role: 'Creative / Direction',
    text:
      'Un collettivo affiatato di menti creative. Uniamo regia, montaggio e sound design per dare vita a visioni uniche, lavorando in sinergia su ogni fase del progetto.',
  },
  {
    name: 'Production Network',
    role: 'Production / Crew',
    text:
      'Una rete selezionata di collaboratori esterni tra dop, scenografia e styling che si integra nel nostro collettivo per supportare produzioni di ogni scala.',
  },
  {
    name: 'Post Pipeline',
    role: 'Color / Sound / Edit',
    text:
      'Tutte le fasi della post-produzione avvengono internamente: color grading, sound design e montaggio nascono insieme per garantire la massima coerenza espressiva.',
  },
];

const VISION_POINTS = [
  'Ogni progetto parte dalla storia, non dal formato.',
  'L immagine e il suono vengono pensati come un unico gesto autoriale.',
  'Preferiamo precisione e carattere alla produzione seriale.',
];

const STORY_STATS = [
  { value: '01', label: 'Visione unica per progetto' },
  { value: '360', label: 'Direzione tra set, edit e sound' },
  { value: 'In-house', label: 'Controllo creativo in post-produzione' },
];

export default function About() {
  const navigate = useNavigate();
  const transit = usePageTransition();
  const sectionRef = useRef(null);
  const imgARef = useRef(null);
  const imgBRef = useRef(null);
  const revealRefs = useRef([]);

  useEffect(() => {
    const onScroll = () => {
      const sec = sectionRef.current;
      if (!sec) return;

      const progress = -sec.getBoundingClientRect().top;
      if (imgARef.current) imgARef.current.style.transform = `translateY(${progress * 0.055}px)`;
      if (imgBRef.current) imgBRef.current.style.transform = `translateY(${progress * -0.04}px)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(styles.visible);
          io.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    revealRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const reveal = (index) => (element) => {
    revealRefs.current[index] = element;
  };

  return (
    <div id="our-team" className={styles.about} ref={sectionRef}>
      <div className="container">
        <section
          className={styles.chapterSection}
        >
          <div className={styles.eyebrow} ref={reveal(0)}>
            <span className={styles.eyebrowLine} />
            <span className={styles.eyebrowText}>Our Vision</span>
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.heroCopy} ref={reveal(1)}>
              <p className={styles.kicker}>ASSE ZERO / Creative direction in motion</p>
              <SimpleBlurText
                text="Ogni storia chiede una forma precisa."
                className={styles.heroTitle}
              />
              <p className={styles.heroBody}>
                Non cerchiamo una firma ripetibile. Cerchiamo la forma piu giusta
                per ogni racconto, lasciando che regia, montaggio e sound design
                si influenzino a vicenda fin dal primo frame.
              </p>

              <div className={styles.visionList}>
                {VISION_POINTS.map((point) => (
                  <p key={point} className={styles.visionItem}>
                    {point}
                  </p>
                ))}
              </div>
            </div>

            <div className={styles.heroMedia} ref={reveal(2)}>
              <div className={styles.heroImageFrame}>
                <div className={styles.heroImageInner} ref={imgARef}>
                  <img src="/photos/1.webp" alt="Workspace creativo di ASSE ZERO" />
                </div>
              </div>
              <div className={styles.heroQuote}>
                <p>
                  "Non ci interessa fare solo bei video.
                  <br />
                  Ci interessa creare immagini e suoni che lasciano il segno."
                </p>
                <cite>ASSE ZERO / Creative Collective</cite>
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.chapterSection}
        >
          <div className={styles.sectionShell} ref={reveal(3)}>
            <div className={styles.sectionIntro}>
              <span className={styles.sectionLabel}>Our Story</span>
              <h2 className={styles.sectionTitle}>Un percorso costruito attorno alle immagini.</h2>
            </div>

            <div className={styles.storyGrid}>
              <div className={styles.storyText}>
                <p>
                  ASSE ZERO nasce dal desiderio di tenere unita la parte autoriale e
                  quella produttiva. Dalla pubblicita ai videoclip, ogni progetto viene
                  costruito senza separare concept, esecuzione e atmosfera finale.
                </p>
                <p>
                  Il metodo e semplice: meno formule, piu ascolto. Ogni storia viene
                  sviluppata su misura, scegliendo ritmo, materia visiva e tono sonoro
                  in funzione dell identita del lavoro.
                </p>
              </div>

              <div className={styles.storyStats}>
                {STORY_STATS.map((item) => (
                  <div key={item.label} className={styles.statCard}>
                    <span className={styles.statValue}>{item.value}</span>
                    <span className={styles.statLabel}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.chapterSection}
        >
          <div className={styles.workspaceGrid} ref={reveal(4)}>
            <div className={styles.workspaceMedia}>
              <div className={styles.workspaceImageWrap}>
                <div className={styles.workspaceImageInner} ref={imgBRef}>
                  <img src="/photos/3.webp" alt="Post produzione e color grading di ASSE ZERO" />
                </div>
                <div className={styles.workspaceBadge}>
                  <span>Our Workspace</span>
                  <span>Concept / Edit / Color / Sound</span>
                </div>
              </div>
            </div>

            <div className={styles.workspaceCopy}>
              <span className={styles.sectionLabel}>Our Workspace</span>
              <h2 className={styles.sectionTitle}>Uno spazio dove il film prende forma due volte.</h2>
              <p className={styles.workspaceText}>
                La prima volta sul set, la seconda in post-produzione. Il workspace e il
                punto in cui ogni dettaglio torna a dialogare: montaggio, color, texture,
                pause, frequenze, pulizia.
              </p>
              <p className={styles.workspaceText}>
                Per questo lavoriamo con un processo integrato. Le decisioni visive non
                finiscono allo shooting e quelle sonore non arrivano per ultime: crescono
                insieme al progetto.
              </p>

              <div className={styles.processRail}>
                {PROCESS.map((step) => (
                  <div key={step.n} className={styles.processCard}>
                    <span className={styles.processNum}>{step.n}</span>
                    <div>
                      <h3 className={styles.processCardTitle}>{step.phase}</h3>
                      <p className={styles.processCardDesc}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.chapterSection}
        >
          <div className={styles.teamSection} ref={reveal(5)}>
            <div className={styles.sectionIntro}>
              <span className={styles.sectionLabel}>Our Team</span>
              <h2 className={styles.sectionTitle}>Una struttura leggera, una direzione molto chiara.</h2>
            </div>

            <div className={styles.teamGrid}>
              {TEAM_MEMBERS.map((member) => (
                <article key={member.name} className={styles.teamCard}>
                  <p className={styles.teamRole}>{member.role}</p>
                  <h3 className={styles.teamName}>{member.name}</h3>
                  <p className={styles.teamText}>{member.text}</p>
                </article>
              ))}
            </div>

            <div className={styles.ctaBar}>
              <p className={styles.ctaTagline}>Hai un progetto in mente? Costruiamolo con un linguaggio preciso.</p>
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
                  Inizia un progetto
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
