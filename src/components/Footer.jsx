import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footerSection}>
      <div className="container">
        <div className={styles.footerContent}>
          <p className={styles.copyright}>© 2026 Gerardo Romani</p>

          <a
            href="https://www.instagram.com/tuousername/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramIcon}
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>

          <p className={styles.madeWith}>
            Made with <span className={styles.heart}>♥</span> and creative energy
          </p>
        </div>
      </div>
    </footer>
  );
}
