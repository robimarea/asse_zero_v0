# ASSE ZERO — Caso di studio (Portfolio + Microservizi)

> Obiettivo: presentare uno studio creativo con linguaggio editoriale/cinematografico e gestione dei contenuti (foto/video) tramite microservizi.
> Stack: Front-end SPA (React+Vite) + Back-end microservizi Express (Node) + MySQL + Nginx (gateway) + Docker + deploy su VPS.

---

## 1) Overview del progetto
**ASSE ZERO** è un portfolio / studio site con:
- **UI immersiva** basata su scroll “magnetico” e reveal (hook custom).
- **Navigazione a capitoli** (Home, Work, Servizi, Our Team).
- **Cataloghi separati** per **foto** e **video** tramite API.
- **Area admin** protetta (login + ruoli admin/editor) per gestire almeno il catalogo foto.

Architettura complessiva:
- **Front-end**: React SPA servita da Nginx in modalità static.
- **Gateway/API**: Nginx che inoltra richieste `/api/*` ai microservizi.
- **Microservizi**:
  - `auth-service` (JWT + ruoli)
  - `photo-service` (catalogo foto + mutazioni protette)
  - `video-service` (catalogo video read-only)

---

## 2) Front-end (React + Vite + Router + SEO)
### Stack
- **React 18**
- **Vite 6**
- **react-router-dom**: routing client-side
- **react-helmet-async**: gestione metadati SEO
- **CSS Modules** + token globali (`src/styles/tokens.css`, `src/styles/global.css`)

### Shell applicativa
Nel file `src/App.jsx`:
- Inizializza il sistema di viewport: `useViewportSystem()`.
- Inizializza la UI/scroll system (integrazione dei capitoli/snap via hook).
- Configura route principali:
  - `/` → Home
  - `/work` → Work (foto/video)
  - `/servizi` → Servizi + contatto
  - `/our-team` → Team/vision/story/workspace
  - `/admin/login` → login staff
  - `/admin` → dashboard protetta da `RequireAdmin`
  - wildcard → `NotFound`

### Rendering e performance
- Routing con `lazy()` + `Suspense` per caricare pagine solo quando servono.
- UI basata su componenti riusabili (navigation, hero, sezioni story, ecc.).
- L’interazione utente è “motion-driven” (scroll reveal/snap) per una sensazione premium/editoriale.

---

## 3) Back-end (Microservizi Express + MySQL)
### Servizi
1. **auth-service** (porta 4003)
2. **photo-service** (porta 4001)
3. **video-service** (porta 4002)

I servizi sono containerizzati e comunicano con MySQL.
I DB sono **separati per servizio** per evitare interferenze.

### API Gateway (Nginx)
In `docker/nginx.docker.conf`:
- `/api/photos` → `photo-service:4001`
- `/api/videos` → `video-service:4002/videos`
- `/api/auth/` → `auth-service:4003/`

Il front-end quindi espone un’API “unica” sotto `/api`, senza conoscere le porte interne dei servizi.

---

## 4) Sicurezza (Auth, JWT, ruoli, rate limiting)
### JWT + ruoli (admin/editor)
Nel `services/auth-service/server.mjs`:
- `POST /login`
  - Validazione input (`email`, `password`)
  - Password verificata con **bcrypt**
  - Emissione **JWT** con payload:
    - `sub` = id utente
    - `email`
    - `role` = `admin` o `editor`
  - Expirazione configurabile via `JWT_EXPIRES_IN` (default: `8h`)

- `requireAuth` middleware
  - Legge `Authorization: Bearer <token>`
  - Verifica con `JWT_SECRET`
  - Consente solo `role in ['admin','editor']`
  - In caso di token mancante → **401**
  - In caso di ruolo non autorizzato → **403**

- `GET /me`
  - Restituisce admin corrente e ruolo

### Protezione mutazioni foto (staff only)
Nel `services/photo-service/server.mjs`:
- Solo staff (`admin` o `editor`) può modificare il catalogo:
  - `POST /photos` (catalogo foto)
  - `DELETE /photos/:id`

### Rate limiting
- `auth-service`:
  - Rate limit sul login: anti-bruteforce (**max 12/15 min**)
  - Rate limit globale API: **120/1 min**
- `photo-service`:
  - Rate limit dedicato alle mutazioni del catalogo foto (**max 30/60 min**)

> Nota utile per il prof: nel codice visto il **video-service espone solo lettura** (`GET /videos`), quindi non richiede auth per il catalogo video.

---

## 5) Database & base dati foto/video (MySQL)
MySQL 8 con schema iniziale in `docker/mysql/init/01_schema_and_seed.sql` e schema admin in `02_auth_schema.sql`.

### 5.1 DB foto
- Database: `photos_svc`
- Tabella: `photos`
  - `id` (PK)
  - `title`
  - `category`
  - `date_label` (mappato in API come `date`)
  - `src` (path pubblico, es. `/photos/1.webp`)
  - `description` (testo)
  - `sort_order` (ordinamento)

Seed demo: inserisce record iniziali con `src` coerente con la cartella `public/photos/`.

### 5.2 DB video
- Database: `videos_svc`
- Tabella: `videos`
  - `id` (PK)
  - `label`
  - `date_label` (mappato in API come `date`)
  - `url` (link esterno reel Instagram)
  - `description`
  - `sort_order`

Seed demo: array di 8 video con url e metadati.

### 5.3 DB auth
- Database: `auth_svc`
- Tabella: `admins`
  - `id` (PK)
  - `email` (unique)
  - `password_hash`
  - `created_at`
- In `auth-service` viene aggiunta (se mancante) la colonna `role` con default `admin`.

---

## 6) Servizi e contenuti multimediali
### Foto
- Le immagini sono presenti in `public/photos/` (JPEG/WEBP).
- Il catalogo foto dal DB fornisce metadati e `src`.
- La UI lavora con layout desktop/mobile e lightbox.

### Video
- I video nel catalogo sono riferimenti a reel esterni tramite URL nel DB.
- Il front-end usa questi dati per renderizzare la sezione “Videos”.

---

## 7) Configurazione VPS, dominio e IP pubblico (caso studio ipotetico)
> Qui presento una configurazione **tipo** per un caso studio “da esame”, usando ipotesi coerenti col repo.

### Ipotesi
- **VPS Aruba** (come richiesto)
- Dominio: `miodominio.it` e `www.miodominio.it`
- IP pubblico VPS: `X.X.X.X` (dove `X.X.X.X` è l’IP reale della tua istanza)

### DNS
1. Crea record **A**:
   - `miodominio.it` → `X.X.X.X`
   - `www.miodominio.it` → `X.X.X.X`

2. (Facoltativo) Crea record aggiuntivi secondo la configurazione Aruba.

### Porte in ingresso
- 80/tcp (HTTP)
- 443/tcp (HTTPS)

### Nginx su VPS
Repo include config `nginx.conf` con:
- redirect HTTP → HTTPS (301)
- HTTPS 443 con **Let’s Encrypt**
- root: `/var/www/gerardoromani/dist`
- **SPA fallback**:
  - `try_files $uri $uri/ /index.html;`
- cache aggressiva su asset statici (js/css/img/font) con `immutable`

### SSL (Let’s Encrypt / Certbot)
Esempio (adattare dominio):
- `certbot --nginx -d miodominio.it -d www.miodominio.it`

> Risultato: l’utente accede al sito via `https://miodominio.it`, con asset statici ottimizzati e routing client-side corretto.

---

## 8) Docker (build, compose, microservizi)
### Web (SPA)
`docker/web.Dockerfile`:
1. Build SPA con `npm ci` e `npm run build`
2. Copia `dist/` dentro Nginx:
   - Nginx server static per la SPA
   - Config: `docker/nginx.docker.conf` come default server

### Compose (stack completo)
`docker-compose.yml` include:
- `mysql` (esposto su `localhost:3306`)
- `photo-service` (porta interna 4001)
- `video-service` (porta interna 4002)
- `auth-service` (porta interna 4003)
- `web` esposto su `8080:80`

### Compose modulare (per demo/esame)
Componente per componente:
- `docker-compose.mysql.yml`
- `docker-compose.photo.yml`
- `docker-compose.video.yml`
- `docker-compose.auth.yml`
- `docker-compose.web.yml`

Motivo didattico:
- puoi avviare solo ciò che serve (riduce problemi durante la presentazione)
- evita collisioni di porte
- DB isolati per microservizio

---

## 9) Flusso tipico utente (riassunto)
1. L’utente entra sul dominio (SPA React).
2. Nginx serve `index.html` e gestisce fallback per route client-side.
3. La SPA chiede:
   - `GET /api/photos` → catalogo foto
   - `GET /api/videos` → catalogo video
4. Se l’utente entra in area admin:
   - `POST /api/auth/login` → JWT
   - token in `Authorization: Bearer`
   - protezioni su `photo-service` per mutazioni foto.

---

## 10) Conclusione (punti “da dire” in presentazione)
**Scelte principali del caso studio:**
- Architettura **microservizi** con DB dedicati (isolamento logico e semplice demo).
- **Gateway Nginx** per unificare l’API sotto `/api`.
- **Sicurezza JWT** con ruoli e rate limiting (login brute-force e mutazioni protette).
- **Deploy production-ready**: HTTPS con Let’s Encrypt + SPA fallback + cache asset.

**Cosa rende il progetto un buon caso di studio:**
- Separazione chiara dei confini (front vs back vs gateway vs DB).
- Semplicità operativa grazie a Docker Compose modulare.
- Coerenza tra dati (DB) e asset (public/photos).

---
