import { useState, useEffect } from 'react';
import { useAdminAuth } from '@context/AdminAuthContext';

function authApiUrl(path = '') {
  const base = (import.meta.env.VITE_AUTH_API_BASE ?? '/api/auth').replace(/\/$/, '');
  return `${base}${path}`;
}

function photosApiUrl() {
  const base = (import.meta.env.VITE_MEDIA_API_BASE ?? '/api').replace(/\/$/, '');
  return `${base}/photos`;
}

function videosApiUrl() {
  const base = (import.meta.env.VITE_MEDIA_API_BASE ?? '/api').replace(/\/$/, '');
  return `${base}/videos`;
}

export default function AdminTeamPanel() {
  const { token, admin } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || admin?.role !== 'admin') return;
    
    let cancelled = false;

    const loadData = () => {
      Promise.all([
        fetch(authApiUrl('/users'), {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => {
          if (!r.ok) throw new Error('Errore utenti');
          return r.json();
        }),
        fetch(photosApiUrl()).then(r => r.json()).catch(() => []),
        fetch(videosApiUrl()).then(r => r.json()).catch(() => [])
      ]).then(([uData, pData, vData]) => {
        if (cancelled) return;
        setUsers(Array.isArray(uData) ? uData : []);
        setPhotos(Array.isArray(pData) ? pData : []);
        setVideos(Array.isArray(vData) ? vData : []);
        setLoading(false);
      }).catch(e => {
        if (cancelled) return;
        console.error(e);
        setError('Impossibile caricare le statistiche del team.');
        setLoading(false);
      });
    };

    loadData();
    const interval = setInterval(() => {
      if (!cancelled) loadData();
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token, admin]);

  if (admin?.role !== 'admin') return null;

  return (
    <section style={{ marginTop: '1rem' }}>
      <h2 className="section-title" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', marginBottom: '1.5rem' }}>
        Statistiche Editor
      </h2>
      <p style={{ opacity: 0.7, marginBottom: '2rem', fontSize: '0.9rem' }}>
        Monitora l'attività degli account: ultimo accesso e quantità di file multimediali caricati nel catalogo.
      </p>

      {error && <p style={{ color: 'var(--color-danger, #c44)' }}>{error}</p>}
      
      {loading ? (
        <p style={{ opacity: 0.7 }}>Caricamento in corso...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {users.map(u => {
            const uPhotos = photos.filter(p => p.uploaded_by_email === u.email).length;
            const uVideos = videos.filter(v => v.uploaded_by_email === u.email).length;
            const total = uPhotos + uVideos;
            
            return (
              <li key={u.id} style={{ 
                padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '8px', marginBottom: '1rem',
                background: 'rgba(20,20,20,0.6)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{u.email}</strong>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        textTransform: 'uppercase', 
                        padding: '0.15rem 0.4rem', 
                        borderRadius: '4px',
                        background: u.role === 'admin' ? 'rgba(0, 255, 150, 0.15)' : 'rgba(255, 200, 0, 0.15)',
                        color: u.role === 'admin' ? '#00ff96' : '#ffc800',
                        border: `1px solid ${u.role === 'admin' ? 'rgba(0, 255, 150, 0.3)' : 'rgba(255, 200, 0, 0.3)'}`
                      }}>
                        {u.role}
                      </span>
                      {u.is_online === 1 && u.last_seen_at && (Date.now() - new Date(u.last_seen_at).getTime() < 65000) ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          fontSize: '0.65rem', textTransform: 'uppercase', padding: '0.15rem 0.4rem',
                          borderRadius: '4px', background: 'rgba(0, 255, 100, 0.1)', color: '#00ff64',
                          border: '1px solid rgba(0, 255, 100, 0.3)'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff64', boxShadow: '0 0 5px #00ff64' }}></span>
                          Online
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          fontSize: '0.65rem', textTransform: 'uppercase', padding: '0.15rem 0.4rem',
                          borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }}></span>
                          Offline
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
                      <strong>Ultima attività:</strong> {u.last_seen_at ? new Date(u.last_seen_at).toLocaleString('it-IT') : (u.last_login_at ? new Date(u.last_login_at).toLocaleString('it-IT') : 'Mai o precedente all\'aggiornamento')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{total} <span style={{fontSize: '0.8rem', fontWeight: 'normal', opacity: 0.6}}>Uploads</span></div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.2rem' }}>{uPhotos} foto, {uVideos} video</div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  );
}
