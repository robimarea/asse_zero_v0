/**
 * ResponsiveImage.jsx
 * ────────────────────────────────────────────────────────────────
 * Component che serve immagini WebP con fallback automatico a JPG/PNG
 * Se il browser supporta WebP, carica .webp; altrimenti carica fallback
 * 
 * Usage:
 * <ResponsiveImage 
 *   src="/photos/1" 
 *   alt="Photo description"
 *   loading="lazy"
 * />
 * 
 * Questa componente cerca automaticamente:
 * - /photos/1.webp (moderno)
 * - /photos/1.jpeg (fallback)
 */

export default function ResponsiveImage({ 
  src, 
  alt, 
  className, 
  loading = "lazy",
  decoding = "async",
  ...props 
}) {
  return (
    <picture>
      {/* WebP per browser moderni (Chrome, Firefox, Edge, Safari 16+) */}
      <source srcSet={`${src}.webp`} type="image/webp" />
      
      {/* Fallback JPEG per browser non supportano WebP */}
      <source srcSet={`${src}.jpeg`} type="image/jpeg" />
      
      {/* Fallback img per non supportano picture tag */}
      <img
        src={`${src}.jpeg`}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        {...props}
      />
    </picture>
  );
}
