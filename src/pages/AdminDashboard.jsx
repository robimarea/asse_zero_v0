import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@context/AdminAuthContext';
import PageSeo from '@components/seo/PageSeo';
import AdminPhotoPanel from '@components/admin/AdminPhotoPanel';

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const role = admin?.role ?? 'admin';
  const isEditor = role === 'editor';

  async function handleLogout() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <>
      <PageSeo
        title={isEditor ? 'Editor — Foto' : 'Admin — Pannello'}
        description="Area riservata."
        robots="noindex, nofollow"
        path="/admin"
      />
      <div className="container" style={{ padding: '6rem 1.5rem 4rem', maxWidth: '44rem' }}>
        <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
          {isEditor ? 'Area editor' : 'Pannello admin'}
        </h1>
        <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
          Connesso come <strong>{admin?.email}</strong>
          {role ? (
            <>
              {' '}
              <span style={{ opacity: 0.65 }}>({role})</span>
            </>
          ) : null}
        </p>

        {isEditor ? (
          <p style={{ opacity: 0.75, marginBottom: '0.5rem', lineHeight: 1.5, fontSize: '0.9rem' }}>
            Puoi solo aggiungere o rimuovere voci dal catalogo foto. Le modifiche sono visibili sul sito dopo ricarico della pagina Work.
          </p>
        ) : (
          <p style={{ opacity: 0.7, marginBottom: '0.5rem', lineHeight: 1.6 }}>
            Gestione catalogo foto (stesso permesso dell&apos;editor, più funzioni future riservate all&apos;admin).
          </p>
        )}

        <AdminPhotoPanel />

        <button
          type="button"
          onClick={handleLogout}
          style={{
            marginTop: '2.5rem',
            padding: '0.75rem 1.25rem',
            letterSpacing: '0.08em',
            fontSize: '0.8rem',
            border: '1px solid rgb(var(--accent-rgb) / 0.35)',
            background: 'transparent',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          Esci
        </button>
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', opacity: 0.6 }}>
          <Link to="/">← Torna al sito</Link>
        </p>
      </div>
    </>
  );
}
