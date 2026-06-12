import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footerSection}>
      <div className="container">
        <div className={styles.footerContent}>

          <p className={styles.copyright}>© 2026 ASSE ZERO</p>

          <a
            href="https://www.instagram.com/assezero"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramLink}
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>

          <p className={styles.tagline}>ADV · FILM · MUSIC · SOUND</p>

          <div className={styles.adminLinks}>
            <a href="/admin/login" className={styles.adminButton}>Admin Login</a>
          </div>

        </div>
      </div>
    </footer>
  );
}
