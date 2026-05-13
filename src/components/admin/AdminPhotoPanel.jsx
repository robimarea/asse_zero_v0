import { useCallback, useEffect, useState } from 'react';
import { useAdminAuth } from '@context/AdminAuthContext';

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
    date: '',
    src: '',
    desc: '',
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
      const r = await fetch(photosApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Inserimento fallito');
      setForm({ title: '', category: '', date: '', src: '', desc: '' });
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
    <section style={{ marginTop: '2rem' }}>
      <h2 className="section-title" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', marginBottom: '1rem' }}>
        Catalogo foto
      </h2>
      {error ? (
        <p role="alert" style={{ color: 'var(--color-danger, #c44)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </p>
      ) : null}

      <form
        onSubmit={handleAdd}
        style={{
          display: 'grid',
          gap: '0.65rem',
          marginBottom: '2rem',
          padding: '1.25rem',
          border: '1px solid rgb(var(--accent-rgb) / 0.2)',
          borderRadius: '6px',
        }}
      >
        <p style={{ opacity: 0.75, fontSize: '0.85rem', margin: 0 }}>Aggiungi foto (percorso src come sul sito, es. /photos/1.webp)</p>
        <input
          placeholder="Titolo"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
          style={inp}
        />
        <input
          placeholder="Categoria"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          required
          style={inp}
        />
        <input
          placeholder="Data (es. Gennaio 2026)"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          required
          style={inp}
        />
        <input
          placeholder="Src (es. /photos/1.webp)"
          value={form.src}
          onChange={(e) => setForm((f) => ({ ...f, src: e.target.value }))}
          required
          style={inp}
        />
        <textarea
          placeholder="Descrizione"
          value={form.desc}
          onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
          required
          rows={3}
          style={{ ...inp, resize: 'vertical' }}
        />
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: '0.65rem 1rem',
            letterSpacing: '0.06em',
            fontSize: '0.75rem',
            border: '1px solid rgb(var(--accent-rgb) / 0.35)',
            background: 'rgb(var(--accent-rgb) / 0.12)',
            color: 'var(--color-text)',
            cursor: pending ? 'wait' : 'pointer',
          }}
        >
          Aggiungi foto
        </button>
      </form>

      {loading ? (
        <p style={{ opacity: 0.7 }}>Caricamento…</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {photos.map((p) => (
            <li
              key={p.id ?? p.src}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.85rem 0',
                borderBottom: '1px solid rgb(var(--accent-rgb) / 0.12)',
              }}
            >
              <div>
                <strong>{p.title}</strong>
                <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>{p.category} · {p.date}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>{p.src}</div>
              </div>
              {p.id != null ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDelete(p.id)}
                  style={{
                    flexShrink: 0,
                    padding: '0.4rem 0.65rem',
                    fontSize: '0.7rem',
                    letterSpacing: '0.06em',
                    border: '1px solid rgb(var(--accent-rgb) / 0.35)',
                    background: 'transparent',
                    color: 'var(--color-text)',
                    cursor: pending ? 'wait' : 'pointer',
                  }}
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

const inp = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  borderRadius: '4px',
  border: '1px solid rgb(var(--accent-rgb) / 0.2)',
  background: 'rgb(var(--color-bg-rgb, 10 10 12) / 0.5)',
  color: 'var(--color-text)',
  fontSize: '0.9rem',
};
