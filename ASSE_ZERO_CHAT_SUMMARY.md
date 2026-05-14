ASSE ZERO — caso di studio (riassunto)

- Progetto: portfolio/studio site con UX “editoriale/cinematografica” e scroll immersivo.
- Front-end: React 18 + Vite 6, SPA con react-router-dom, SEO via react-helmet-async, CSS Modules.
- Back-end: microservizi Express + MySQL separati:
  - auth-service: login con bcrypt, JWT con ruoli (admin/editor), rate limiting su login.
  - photo-service: catalogo foto + mutazioni protette (solo admin/editor).
  - video-service: catalogo video read-only (solo lettura).
- Gateway/API: Nginx inoltra `/api/photos`, `/api/videos`, `/api/auth` ai servizi interni.
- Sicurezza: JWT in `Authorization: Bearer`, autorizzazione per ruoli, rate limiting su login e sulle mutazioni foto.
- DB contenuti:
  - MySQL `photos_svc.photos` (title/category/date/src/description/sort_order)
  - MySQL `videos_svc.videos` (label/date/url/description/sort_order)
  - MySQL `auth_svc.admins` (email + password_hash; role aggiunta via migration)
- VPS/Domain/SSL (esempio “caso studio”): ipotesi Aruba, dominio `miodominio.it` e `www.miodominio.it`,
  DNS A verso IP pubblico VPS, Nginx con redirect 80→443, Let’s Encrypt, fallback SPA `try_files ... /index.html`.
- Docker: web build React in nginx; compose completo + compose modulari (mysql/photo/video/auth/web).
- CI: workflow GitHub Actions per `npm ci` + `npm run build`.
