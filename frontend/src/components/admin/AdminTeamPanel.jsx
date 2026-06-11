import { useState, useEffect } from 'react';
import { useAdminAuth } from '@context/AdminAuthContext';
import styles from './AdminTeamPanel.module.css';

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
    <section className={styles.section}>
      <h2 className={`section-title ${styles.title}`}>
        Statistiche Editor
      </h2>
      <p className={styles.description}>
        Monitora l'attività degli account: ultimo accesso e quantità di file multimediali caricati nel catalogo.
      </p>

      {error && <p className={styles.error}>{error}</p>}
      
      {loading ? (
        <p className={styles.loading}>Caricamento in corso...</p>
      ) : (
        <ul className={styles.list}>
          {users.map(u => {
            const uPhotos = photos.filter(p => p.uploaded_by_email === u.email).length;
            const uVideos = videos.filter(v => v.uploaded_by_email === u.email).length;
            const total = uPhotos + uVideos;
            
            return (
              <li key={u.id} className={styles.listItem}>
                <div className={styles.flexContainer}>
                  <div>
                    <div className={styles.infoRow}>
                      <strong className={styles.email}>{u.email}</strong>
                      <span className={`${styles.badgeRole} ${u.role === 'admin' ? styles.roleAdmin : styles.roleEditor}`}>
                        {u.role}
                      </span>
                      {u.is_online === 1 && u.last_seen_at && (Date.now() - new Date(u.last_seen_at).getTime() < 65000) ? (
                        <span className={`${styles.badgeStatus} ${styles.statusOnline}`}>
                          <span className={styles.statusOnlineDot}></span>
                          Online
                        </span>
                      ) : (
                        <span className={`${styles.badgeStatus} ${styles.statusOffline}`}>
                          <span className={styles.statusOfflineDot}></span>
                          Offline
                        </span>
                      )}
                    </div>
                    <div className={styles.lastSeen}>
                      <strong>Ultima attività:</strong> {u.last_seen_at ? new Date(u.last_seen_at).toLocaleString('it-IT') : (u.last_login_at ? new Date(u.last_login_at).toLocaleString('it-IT') : 'Mai o precedente all\'aggiornamento')}
                    </div>
                  </div>
                  <div className={styles.statsBox}>
                    <div className={styles.statsTotal}>
                      {total} <span className={styles.statsLabel}>Uploads</span>
                    </div>
                    <div className={styles.statsBreakdown}>
                      {uPhotos} foto, {uVideos} video
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
