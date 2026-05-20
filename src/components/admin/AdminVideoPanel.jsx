import { useCallback, useEffect, useState } from 'react';
import { useAdminAuth } from '@context/AdminAuthContext';

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
    <section style={{ marginTop: '3rem' }}>
      <h2 className="section-title" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', marginBottom: '1rem' }}>
        Catalogo video
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
        <p style={{ opacity: 0.75, fontSize: '0.85rem', margin: 0 }}>Aggiungi video: scegli un file mp4 dal computer O inserisci un URL manualmente.</p>
        <input
          placeholder="Etichetta / Titolo (es. Campagna Estiva)"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          required
          style={inp}
        />
        <input
          type="date"
          value={form.rawDate}
          onChange={(e) => setForm((f) => ({ ...f, rawDate: e.target.value }))}
          required
          style={inp}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setForm((f) => ({ ...f, file: e.target.files[0], url: '' }))}
            style={{ ...inp, flex: '1 1 auto' }}
          />
          <span style={{ display: 'flex', alignItems: 'center', opacity: 0.6, fontSize: '0.8rem' }}>oppure</span>
          <input
            placeholder="URL video o link Reel (se non carichi un file)"
            value={form.url}
            disabled={!!form.file}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            required={!form.file}
            style={{ ...inp, flex: '2 1 auto', opacity: form.file ? 0.5 : 1 }}
          />
        </div>
        <textarea
          placeholder="Breve descrizione o note aggiuntive..."
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
          Aggiungi video
        </button>
      </form>

      {loading ? (
        <p style={{ opacity: 0.7 }}>Caricamento…</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {videos.map((p) => (
            <li
              key={p.id ?? p.url}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.85rem 0',
                borderBottom: '1px solid rgb(var(--accent-rgb) / 0.12)',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.url && p.url.endsWith('.mp4') ? (
                    <video src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  ) : (
                    <span style={{ fontSize: '10px', opacity: 0.5 }}>VIDEO</span>
                  )}
                </div>
                <div>
                  <strong>{p.label}</strong>
                  <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>{p.date}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
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
  padding: '0.65rem 0.85rem',
  borderRadius: '6px',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  background: 'rgba(20, 20, 20, 0.95)',
  color: '#ffffff',
  fontSize: '0.95rem',
  outline: 'none',
};
