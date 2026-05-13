import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PHOTOS, VIDEOS } from '@data/constants';

const WorkMediaContext = createContext(null);

/**
 * Catalogo Work: parte dai dati statici (fase monolite) e, se disponibili,
 * sostituisce con le risposte dei microservizi /api/photos e /api/videos.
 */
export function WorkMediaProvider({ children }) {
  const [photos, setPhotos] = useState(PHOTOS);
  const [videos, setVideos] = useState(VIDEOS);
  const [source, setSource] = useState('static');

  useEffect(() => {
    const base = (import.meta.env.VITE_MEDIA_API_BASE ?? '/api').replace(/\/$/, '');
    const timeoutMs = Number(import.meta.env.VITE_MEDIA_API_TIMEOUT_MS) || 12_000;
    let cancelled = false;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);

    (async () => {
      try {
        const [pr, vr] = await Promise.all([
          fetch(`${base}/photos`, { signal: ac.signal }),
          fetch(`${base}/videos`, { signal: ac.signal }),
        ]);
        if (!pr.ok || !vr.ok) throw new Error('catalog HTTP');
        const [p, v] = await Promise.all([pr.json(), vr.json()]);
        if (cancelled) return;
        if (!Array.isArray(p) || !Array.isArray(v)) throw new Error('catalog shape');
        // Tutto o niente: evita catalogo misto (es. foto da API e video ancora statici).
        if (p.length > 0 && v.length > 0) {
          setPhotos(p);
          setVideos(v);
          setSource('api');
        }
      } catch {
        /* fallback: constants */
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
      clearTimeout(timer);
    };
  }, []);

  const value = useMemo(() => ({ photos, videos, source }), [photos, videos, source]);
  return <WorkMediaContext.Provider value={value}>{children}</WorkMediaContext.Provider>;
}

export function useWorkMedia() {
  const ctx = useContext(WorkMediaContext);
  if (!ctx) {
    throw new Error('useWorkMedia must be used within WorkMediaProvider');
  }
  return ctx;
}
