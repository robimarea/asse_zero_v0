import { useCallback, useEffect, useState } from 'react';
import { useAdminAuth } from '@context/AdminAuthContext';
import styles from './AdminPhotoPanel.module.css';

const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
function formatDate(yyyyMmDd) {
  if (!yyyyMmDd) return '';
  const [y, m, d] = yyyyMmDd.split('-');
  return `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1]} ${y}`;
}

function photosApiUrl(path = '') {
  const base = (import.meta.env.VITE_MEDIA_API_BASE ?? '/api').replace(/\/$/, '');
  return `${base}/photos${path}`;
}

export default function AdminPhotoPanel() {
  const { token, admin } = useAdminAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    rawDate: '',
    src: '',
    desc: '',
    file: null,
  });

  const canEdit = admin?.role === 'admin' || admin?.role === 'editor';

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(photosApiUrl());
      if (!r.ok) throw new Error('Lettura catalogo fallita');
      const data = await r.json();
      setPhotos(Array.isArray(data) ? data : []);
    } catch {
      setError('Impossibile caricare le foto.');
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!canEdit || !token) return;
    setPending(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('date', formatDate(form.rawDate));
      formData.append('desc', form.desc);
      if (form.file) {
        formData.append('file', form.file);
      } else {
        formData.append('src', form.src);
      }

      const r = await fetch(photosApiUrl(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Inserimento fallito');
      setForm({ title: '', category: '', rawDate: '', src: '', desc: '', file: null });
      await loadPhotos();
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
      const r = await fetch(photosApiUrl(`/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.status === 404) throw new Error('Voce non trovata');
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || 'Eliminazione fallita');
      }
      await loadPhotos();
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
        Catalogo foto
      </h2>
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}

      <form onSubmit={handleAdd} className={styles.form}>
        <p className={styles.formDescription}>Aggiungi foto: scegli un file dal computer O inserisci un URL manualmente.</p>
        <input
          placeholder="Titolo (es. Tramonto in Duomo)"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
          className={styles.input}
        />
        <input
          placeholder="Categoria (es. Ritrattistica, Esterni, Eventi)"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
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
            accept="image/jpeg,image/png"
            onChange={(e) => setForm((f) => ({ ...f, file: e.target.files[0], src: '' }))}
            className={`${styles.input} ${styles.fileInput}`}
          />
          <span className={styles.fileOrLabel}>oppure</span>
          <input
            placeholder="URL immagine"
            value={form.src}
            disabled={!!form.file}
            onChange={(e) => setForm((f) => ({ ...f, src: e.target.value }))}
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
          {pending ? 'Aggiunta in corso...' : 'Aggiungi foto'}
        </button>
      </form>

      {loading ? (
        <p style={{ opacity: 0.7 }}>Caricamento…</p>
      ) : (
        <ul className={styles.list}>
          {photos.map((p) => (
            <li key={p.id ?? p.src} className={styles.listItem}>
              <div className={styles.mediaContainer}>
                <div className={styles.imageWrapper}>
                  {p.src && <img src={p.src} alt={p.title} className={styles.image} />}
                </div>
                <div>
                  <strong>{p.title}</strong>
                  <div className={styles.meta}>{p.category} · {p.date}</div>
                  <div className={styles.urlText}>{p.src}</div>
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
