import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@context/AdminAuthContext';
import PageSeo from '@components/seo/PageSeo';
import AdminPhotoPanel from '@components/admin/AdminPhotoPanel';
import AdminVideoPanel from '@components/admin/AdminVideoPanel';
import AdminTeamPanel from '@components/admin/AdminTeamPanel';

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const role = admin?.role ?? 'admin';
  const isEditor = role === 'editor';
  
  const [activeTab, setActiveTab] = useState('photos');

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
        <p style={{ opacity: 0.8, marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
          Connesso come <strong style={{ marginLeft: '0.5rem' }}>{admin?.email}</strong>
          {role ? (
            <span style={{
              display: 'inline-block',
              padding: '0.2rem 0.5rem',
              marginLeft: '0.75rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '4px',
              background: isEditor ? 'rgba(255, 200, 0, 0.15)' : 'rgba(0, 255, 150, 0.15)',
              color: isEditor ? '#ffc800' : '#00ff96',
              border: `1px solid ${isEditor ? 'rgba(255, 200, 0, 0.3)' : 'rgba(0, 255, 150, 0.3)'}`
            }}>
              {role}
            </span>
          ) : null}
        </p>

        {isEditor ? (
          <p style={{ opacity: 0.75, marginBottom: '0.5rem', lineHeight: 1.5, fontSize: '0.9rem' }}>
            Puoi aggiungere o rimuovere voci dal catalogo foto e video.
          </p>
        ) : (
          <p style={{ opacity: 0.7, marginBottom: '0.5rem', lineHeight: 1.6 }}>
            Gestione catalogo foto e video (funzioni complete).
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('photos')}
            style={tabStyle(activeTab === 'photos')}
          >
            Catalogo Foto
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            style={tabStyle(activeTab === 'videos')}
          >
            Catalogo Video
          </button>
          {!isEditor && (
            <button
              onClick={() => setActiveTab('team')}
              style={tabStyle(activeTab === 'team')}
            >
              Gestione Team
            </button>
          )}
        </div>

        {activeTab === 'photos' && <AdminPhotoPanel />}
        {activeTab === 'videos' && <AdminVideoPanel />}
        {activeTab === 'team' && !isEditor && <AdminTeamPanel />}

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

function tabStyle(isActive) {
  return {
    padding: '0.65rem 1.25rem',
    background: isActive ? 'rgb(var(--accent-rgb) / 0.1)' : 'transparent',
    color: isActive ? 'rgb(var(--accent-rgb))' : 'rgba(255, 255, 255, 0.6)',
    border: 'none',
    borderBottom: isActive ? '2px solid rgb(var(--accent-rgb))' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s',
  };
}
