import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@context/AdminAuthContext';
import PageSeo from '@components/seo/PageSeo';
import AdminPhotoPanel from '@components/admin/AdminPhotoPanel';
import AdminVideoPanel from '@components/admin/AdminVideoPanel';
import AdminTeamPanel from '@components/admin/AdminTeamPanel';
import styles from './AdminDashboard.module.css';

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
      <div className={`container ${styles.dashboardContainer}`}>
        <div className={styles.dashboardHeader}>
          <h1 className={`section-title ${styles.title}`}>
            {isEditor ? 'Area editor' : 'Pannello admin'}
          </h1>
          <p className={styles.connectionStatus}>
            Connesso come <strong className={styles.email}>{admin?.email}</strong>
            {role ? (
              <span className={`${styles.badgeRole} ${isEditor ? styles.roleEditor : styles.roleAdmin}`}>
                {role}
              </span>
            ) : null}
          </p>

          {isEditor ? (
            <p className={styles.dashboardInfo}>
              Puoi aggiungere o rimuovere voci dal catalogo foto e video.
            </p>
          ) : (
            <p className={styles.dashboardInfoFull}>
              Gestione catalogo foto e video (funzioni complete).
            </p>
          )}
        </div>

        <div className={styles.tabsContainer}>
          <button
            onClick={() => setActiveTab('photos')}
            className={`${styles.tabButton} ${activeTab === 'photos' ? styles.tabActive : ''}`}
          >
            Catalogo Foto
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`${styles.tabButton} ${activeTab === 'videos' ? styles.tabActive : ''}`}
          >
            Catalogo Video
          </button>
          {!isEditor && (
            <button
              onClick={() => setActiveTab('team')}
              className={`${styles.tabButton} ${activeTab === 'team' ? styles.tabActive : ''}`}
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
          className={styles.logoutButton}
        >
          Esci
        </button>
        <p className={styles.backLink}>
          <Link to="/">← Torna al sito</Link>
        </p>
      </div>
    </>
  );
}
