import { Link } from 'react-router-dom';
import PageSeo from '@components/seo/PageSeo';
import { SEO } from '@data/seoData';

export default function NotFound() {
  return (
    <>
      <PageSeo {...SEO.notFound} />
      <section
        style={{
          minHeight: '60vh',
          display: 'grid',
          placeItems: 'center',
          padding: '8rem 0',
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: '720px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '1rem',
            }}
          >
            404
          </p>
          <h1 className="section-title" style={{ marginBottom: '1rem' }}>
            {SEO.notFound.heading}
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}
          >
            L&apos;URL richiesto non esiste oppure e stato spostato.
          </p>
          <Link
            to="/"
            style={{
              color: 'var(--text-primary)',
              textDecoration: 'underline',
              textUnderlineOffset: '0.2em',
            }}
          >
            Torna alla home
          </Link>
        </div>
      </section>
    </>
  );
}
