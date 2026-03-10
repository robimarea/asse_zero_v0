import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import styles from './Navigation.module.css';

const NAV_ITEMS = [
  { href: '#about',    label: 'About',     num: '01' },
  { href: '#photos',   label: 'Foto',      num: '02' },
  { href: '#videos',   label: 'Video',     num: '03' },
  { href: '#services', label: 'Servizi',   num: '04' },
  { href: '#contact',  label: 'Contatti',  num: '05' },
];

export default function Navigation() {
  const [isOpen, setIsOpen]       = useState(false);
  const [activeHref, setActive]   = useState('');

  const overlayRef    = useRef(null);
  const bgRef         = useRef(null);
  const linksRef      = useRef([]);
  const metaRef       = useRef(null);
  const bar1Ref       = useRef(null);
  const bar2Ref       = useRef(null);
  const tlRef         = useRef(null);

  /* track active section */
  useEffect(() => {
    const onHash = () => setActive(window.location.hash || '');
    window.addEventListener('hashchange', onHash);
    onHash();
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  /* build GSAP timeline once */
  useEffect(() => {
    const overlay = overlayRef.current;
    const bg      = bgRef.current;
    const links   = linksRef.current.filter(Boolean);
    const meta    = metaRef.current;

    gsap.set(overlay, { visibility: 'hidden' });
    gsap.set(bg,      { scaleY: 0, transformOrigin: 'top center' });
    gsap.set(links,   { y: 80, opacity: 0 });
    gsap.set(meta,    { opacity: 0, y: 20 });

    const tl = gsap.timeline({ paused: true });

    tl
      .set(overlay, { visibility: 'visible' })
      .to(bg, { scaleY: 1, duration: 0.65, ease: 'expo.inOut' })
      .to(links, {
        y: 0, opacity: 1,
        duration: 0.55,
        stagger: 0.07,
        ease: 'power3.out'
      }, '-=0.3')
      .to(meta, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2');

    tlRef.current = tl;
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
    tlRef.current?.play();

    /* hamburger → X */
    gsap.to(bar1Ref.current, { rotation: 45,  y:  6, duration: 0.35, ease: 'power3.out' });
    gsap.to(bar2Ref.current, { rotation: -45, y: -6, duration: 0.35, ease: 'power3.out' });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
    tlRef.current?.reverse();

    /* X → hamburger */
    gsap.to(bar1Ref.current, { rotation: 0, y: 0, duration: 0.35, ease: 'power3.out' });
    gsap.to(bar2Ref.current, { rotation: 0, y: 0, duration: 0.35, ease: 'power3.out' });
  }, []);

  const toggle = () => (isOpen ? close() : open());

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    close();
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', href);
      setActive(href);
    }, 600);
  };

  /* close on ESC */
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape' && isOpen) close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  return (
    <>
      {/* ── Fixed top bar ── */}
      <header className={styles.header}>
        <a
          className={styles.logo}
          href="#hero"
          onClick={e => handleLinkClick(e, '#hero')}
        >
          ASSE ZERO
        </a>

        <button
          className={styles.menuBtn}
          onClick={toggle}
          aria-label={isOpen ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={isOpen}
        >
          <span className={styles.menuLabel}>{isOpen ? 'CLOSE' : 'MENU'}</span>
          <span className={styles.hamburger}>
            <span className={styles.bar} ref={bar1Ref} />
            <span className={styles.bar} ref={bar2Ref} />
          </span>
        </button>
      </header>

      {/* ── Fullscreen overlay ── */}
      <div className={styles.overlay} ref={overlayRef} aria-hidden={!isOpen}>
        {/* animated background panel */}
        <div className={styles.overlayBg} ref={bgRef} />

        <div className={styles.overlayInner}>
          {/* big nav links */}
          <nav className={styles.overlayNav} aria-label="Fullscreen navigation">
            <ul className={styles.overlayList}>
              {NAV_ITEMS.map((item, i) => (
                <li
                  key={item.href}
                  className={styles.overlayItem}
                  ref={el => { linksRef.current[i] = el; }}
                >
                  <a
                    href={item.href}
                    className={`${styles.overlayLink}${activeHref === item.href ? ` ${styles.active}` : ''}`}
                    onClick={e => handleLinkClick(e, item.href)}
                    tabIndex={isOpen ? 0 : -1}
                  >
                    <span className={styles.linkNum}>{item.num}</span>
                    <span className={styles.linkLabel} aria-label={item.label}>
                      {item.label.split('').map((char, ci) => (
                        <span
                          key={ci}
                          className={styles.charWrap}
                          style={{ '--ci': ci }}
                        >
                          <span className={styles.charInner}>{char}</span>
                          <span className={styles.charClone} aria-hidden="true">{char}</span>
                        </span>
                      ))}
                    </span>
                    <span className={styles.linkArrow}>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* bottom meta row */}
          <div className={styles.overlayMeta} ref={metaRef}>
            <span className={styles.metaTag}>Production Studio</span>
            <div className={styles.metaSocials}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.social}>IG</a>
              <a href="https://youtube.com"   target="_blank" rel="noreferrer" className={styles.social}>YT</a>
              <a href="https://vimeo.com"     target="_blank" rel="noreferrer" className={styles.social}>VM</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}