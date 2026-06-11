import { useCallback, useEffect, useState } from 'react';
import { useAdminAuth } from '@context/AdminAuthContext';
import styles from './AdminVideoPanel.module.css';

const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
function formatDate(yyyyMmDd) {
  if (!yyyyMmDd) return '';
  const [y, m, d] = yyyyMmDd.split('-');
  return `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1]} ${y}`;
}

function videosApiUrl(path = '') {
  const base = (import.meta.env.VITE_MEDIA_API_BASE ?? '/api').replace(/\/$/, '');
  return `${base}/videos${path}`;
}

export default function AdminVideoPanel() {
  const { token, admin } = useAdminAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    label: '',
    rawDate: '',
    url: '',
    desc: '',
    file: null,
  });

  const canEdit = admin?.role === 'admin' || admin?.role === 'editor';

  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(videosApiUrl());
      if (!r.ok) throw new Error('Lettura catalogo fallita');
      const data = await r.json();
      setVideos(Array.isArray(data) ? data : []);
    } catch {
      setError('Impossibile caricare i video.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!canEdit || !token) return;
    setPending(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('label', form.label);
      formData.append('date', formatDate(form.rawDate));
      formData.append('desc', form.desc);
      if (form.file) {
        formData.append('file', form.file);
      } else {
        formData.append('url', form.url);
      }

      const r = await fetch(videosApiUrl(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Inserimento fallito');
      setForm({ label: '', rawDate: '', url: '', desc: '', file: null });
      await loadVideos();
    } catch (err) {
      setError(err.message || 'Errore inserimento');
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id) {
    if (!canEdit || !token) return;
    if (!window.confirm('Rimuovere questa voce dal catalogo?')) return;
    setPending(true);
    setError('');
    try {
      const r = await fetch(videosApiUrl(`/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.status === 404) throw new Error('Voce non trovata');
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || 'Eliminazione fallita');
      }
      await loadVideos();
    } catch (err) {
      setError(err.message || 'Errore eliminazione');
    } finally {
      setPending(false);
    }
  }

  if (!canEdit) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={`section-title ${styles.title}`}>
        Catalogo video
      </h2>
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}

      <form onSubmit={handleAdd} className={styles.form}>
        <p className={styles.formDescription}>Aggiungi video: scegli un file mp4 dal computer O inserisci un URL manualmente.</p>
        <input
          placeholder="Etichetta / Titolo (es. Campagna Estiva)"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          required
          className={styles.input}
        />
        <input
          type="date"
          value={form.rawDate}
          onChange={(e) => setForm((f) => ({ ...f, rawDate: e.target.value }))}
          required
          className={styles.input}
        />
        <div className={styles.fileInputContainer}>
          <input
            type="file"
            accept="video/mp4"
            onChange={(e) => setForm((f) => ({ ...f, file: e.target.files[0], url: '' }))}
            className={`${styles.input} ${styles.fileInput}`}
          />
          <span className={styles.fileOrLabel}>oppure</span>
          <input
            placeholder="URL video o link Reel"
            value={form.url}
            disabled={!!form.file}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            required={!form.file}
            className={`${styles.input} ${styles.urlInput}`}
            style={{ opacity: form.file ? 0.5 : 1 }}
          />
        </div>
        <textarea
          placeholder="Breve descrizione o note aggiuntive..."
          value={form.desc}
          onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
          required
          rows={3}
          className={`${styles.input} ${styles.textarea}`}
        />
        <button
          type="submit"
          disabled={pending}
          className={styles.submitButton}
        >
          {pending ? 'Aggiunta in corso...' : 'Aggiungi video'}
        </button>
      </form>

      {loading ? (
        <p style={{ opacity: 0.7 }}>Caricamento…</p>
      ) : (
        <ul className={styles.list}>
          {videos.map((p) => (
            <li key={p.id ?? p.url} className={styles.listItem}>
              <div className={styles.mediaContainer}>
                <div className={styles.videoWrapper}>
                  {p.url && (p.url.endsWith('.mp4') || p.url.startsWith('/uploads/')) ? (
                    <video src={p.url} className={styles.video} muted playsInline controls />
                  ) : (
                    <span className={styles.videoPlaceholder}>VIDEO</span>
                  )}
                </div>
                <div>
                  <strong>{p.label}</strong>
                  <div className={styles.meta}>{p.date}</div>
                  <div className={styles.urlText}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      {p.url}
                    </a>
                  </div>
                </div>
              </div>
              {p.id != null ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDelete(p.id)}
                  className={styles.deleteButton}
                >
                  Rimuovi
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
