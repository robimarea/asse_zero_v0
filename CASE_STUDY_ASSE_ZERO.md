# ASSE ZERO — Caso di studio (Portfolio + Microservizi)

> Obiettivo: presentare uno studio creativo con linguaggio editoriale/cinematografico e gestione dei contenuti (foto/video) tramite microservizi.
> Stack: Front-end SPA (React+Vite) + Back-end microservizi Express (Node) + MySQL + Nginx (gateway) + Docker + deploy su VPS.

---

## 1) Overview del progetto
**ASSE ZERO** è un portfolio / studio site con:
- **UI immersiva** basata su scroll “magnetico” e reveal (hook custom).
- **Navigazione a capitoli** (Home, Work, Servizi, Our Team).
- **Cataloghi multimediali** (foto e video) gestiti tramite API e upload fisico di file (Multer).
- **Area admin avanzata** a schede (tabs), con protezione JWT. Permette l'upload di file, la gestione dei cataloghi (ruolo editor/admin) e il monitoraggio delle attività degli utenti (solo admin).

Architettura complessiva:
- **Front-end**: React SPA servita da Nginx in modalità static.
- **Gateway/API/Media**: Nginx che inoltra richieste `/api/*` ai microservizi e serve i file fisici dalla rotta `/uploads/`.
- **Microservizi**:
  - `auth-service` (JWT + ruoli + tracciamento last_login)
  - `photo-service` (catalogo foto, upload file, mutazioni protette, auditing)
  - `video-service` (catalogo video, upload file, mutazioni protette, auditing)

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

### Rendering e UI/UX
- Routing con `lazy()` + `Suspense` per caricare pagine solo quando servono.
- UI pubblica basata su componenti riusabili e interazioni “motion-driven” (scroll reveal/snap) per una sensazione premium/editoriale.
- UI Admin ad **alto contrasto** e fluida: navigazione a *Tab* (Catalogo Foto, Catalogo Video, Gestione Team) e form intuitivi (es. date picker nativo formattato automaticamente in stringhe testuali).

---

## 3) Back-end (Microservizi Express + MySQL)
### Servizi
1. **auth-service** (porta 4003)
2. **photo-service** (porta 4001)
3. **video-service** (porta 4002)

I servizi sono containerizzati e comunicano con MySQL.
I DB sono **separati per servizio** per evitare interferenze.

### API Gateway e Media Serving (Nginx)
In `docker/nginx.docker.conf`:
- `/api/photos` → `photo-service:4001`
- `/api/videos` → `video-service:4002/videos`
- `/api/auth/` → `auth-service:4003/`
- `/uploads/` → Espone direttamente la cartella statica (volume condiviso) in cui i microservizi salvano i file fisici (immagini `.webp`, `.jpg` e video `.mp4`).

Il front-end quindi espone un’API “unica” sotto `/api`, senza conoscere le porte interne dei servizi, e carica le immagini tramite `/uploads/`.

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

### Protezione mutazioni e Upload (staff only)
Nel `services/photo-service/server.mjs` e `video-service/server.mjs`:
- Solo staff (`admin` o `editor`) può modificare il catalogo.
- **File Upload:** Utilizzo della libreria `multer` per ricevere i file in formato `multipart/form-data` e salvarli nel volume condiviso `media-uploads`.
- **Auditing:** Ogni operazione di `POST` registra l'email dell'utente che ha effettuato l'upload (`req.staff.email`) nel database multimediale, permettendo all'admin di avere statistiche chiare sulle attività del team.

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
  - `src` (path pubblico, es. `/uploads/file.webp`)
  - `description` (testo)
  - `sort_order` (ordinamento)
  - `uploaded_by_email` (tracciamento autore)

Seed demo: inserisce record iniziali con `src` coerente con la cartella `public/photos/`.

### 5.2 DB video
- Database: `videos_svc`
- Tabella: `videos`
  - `id` (PK)
  - `label`
  - `date_label` (mappato in API come `date`)
  - `url` (link a file in `/uploads/` o reel Instagram)
  - `description`
  - `sort_order`
  - `uploaded_by_email` (tracciamento autore)

Seed demo: array di 8 video con url e metadati.

### 5.3 DB auth
- Database: `auth_svc`
- Tabella: `admins`
  - `id` (PK)
  - `email` (unique)
  - `password_hash`
  - `created_at`
  - `last_login_at` (Aggiornato dinamicamente ad ogni `/login`)
- In `auth-service` viene aggiunta (se mancante) la colonna `role` con default `admin` e `last_login_at`.

---

## 6) Servizi e contenuti multimediali
### Foto e Video
- Le risorse storiche si trovano in `public/photos/`, mentre i **nuovi caricamenti** avvengono tramite `multer` e vengono posizionati nel volume condiviso `/uploads/`.
- Il front-end unifica la visualizzazione mixando URL manuali e URL fisici generati dai microservizi.
- **Gestione Team:** Un'innovativa architettura front-end aggrega i dati provenienti dai tre microservizi (`auth-service` per la lista utenti, `photo-service` e `video-service` per il conteggio dei file) mostrando una dashboard unificata di statistiche senza richiedere pesanti `JOIN` tra database separati.

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
   - Nginx server static per la SPA + serving dei file in `/uploads/`
   - Config: `docker/nginx.docker.conf` come default server

### Volume Condiviso `media-uploads`
Uno degli aspetti chiave dell'architettura aggiornata è il **volume Docker condiviso** `media-uploads`:
- `photo-service` e `video-service` ricevono i file dagli admin via `multer` e li scrivono su `/app/uploads`.
- `web` (Nginx) monta lo stesso volume in `/usr/share/nginx/html/uploads` e li serve staticamente via la rotta `/uploads/`.
- Il vantaggio: nessun trasferimento di file tra container, latenza zero per la visualizzazione lato client.

### Compose (stack completo)
`docker-compose.yml` include:
- `mysql` (esposto su `localhost:3306`; healthcheck integrato)
- `photo-service` (porta 4001, volume `media-uploads`, JWT, multer)
- `video-service` (porta 4002, volume `media-uploads`, JWT, multer)
- `auth-service` (porta 4003, JWT, tracciamento `last_login_at`)
- `web` (esposto su `8080:80`, volume `media-uploads` montato in lettura)

### Variabili di ambiente
Tutte le credenziali e i segreti sono gestiti tramite variabili d'ambiente nel `docker-compose.yml`:
- `JWT_SECRET` (configurabile via `.env`, default sicuro per dev)
- `JWT_EXPIRES_IN` (default `8h`)
- `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_EDITOR_EMAIL` / `DEFAULT_EDITOR_PASSWORD`

### Porte esposte all'host (dev)
Per permettere al proxy di Vite di raggiungere i microservizi durante lo sviluppo locale:
- `4001` → `photo-service`
- `4002` → `video-service`
- `4003` → `auth-service`
- `8080` → Gateway Nginx / Web

---

## 9) Flussi tipici

### Flusso utente pubblico
1. L'utente entra sul dominio (SPA React).
2. Nginx serve `index.html` e gestisce fallback per tutte le route client-side.
3. La SPA carica le gallerie in parallelo:
   - `GET /api/photos` → array di metadati foto con `src` (URL pubblico)
   - `GET /api/videos` → array di metadati video con `url`
4. Le immagini vengono caricate dai browser direttamente da `/uploads/` (file fisici) o da `/photos/` (asset statici pre-esistenti).

### Flusso admin — Upload di un file
1. `POST /api/auth/login` con email/password → riceve `token` JWT (8h).
2. Il `last_login_at` viene aggiornato nel database `auth_svc`.
3. Admin naviga nel tab **Catalogo Foto** o **Catalogo Video**.
4. Seleziona un file dal disco oppure inserisce un URL manuale.
5. Clicca "Aggiungi": il form manda una richiesta `multipart/form-data` con `Authorization: Bearer <token>`.
6. `photo-service` / `video-service` verifica il JWT, salva il file in `/app/uploads/` e registra il record nel DB con `uploaded_by_email = req.staff.email`.
7. La UI ricarica il catalogo: il nuovo elemento appare istantaneamente con la miniatura preview.

### Flusso admin — Visualizzazione statistiche team
1. L'admin entra nel tab **Gestione Team**.
2. `AdminTeamPanel.jsx` esegue 3 fetch in parallelo:
   - `GET /api/auth/users` → lista utenti (solo admin può chiamarla).
   - `GET /api/photos` → tutti i record foto.
   - `GET /api/videos` → tutti i record video.
3. Il componente React aggrega i dati client-side: per ogni utente conta quanti record hanno `uploaded_by_email` corrispondente.
4. Visualizza una scheda per ogni account con: email, ruolo (badge colorato), data/ora ultimo accesso, totale upload (foto + video).

---

## 10) Struttura del codice frontend (componenti)
```
src/
├── App.jsx                      # Router principale, lazy loading
├── pages/
│   ├── AdminDashboard.jsx       # Dashboard a tab (Foto | Video | Team)
│   └── AdminLogin.jsx           # Form login con feedback errori
├── components/
│   ├── admin/
│   │   ├── AdminPhotoPanel.jsx  # Catalogo foto: lista + upload + delete
│   │   ├── AdminVideoPanel.jsx  # Catalogo video: lista + upload + delete
│   │   └── AdminTeamPanel.jsx   # Statistiche editor (solo admin)
│   ├── layout/
│   │   ├── Navigation.jsx
│   │   └── Footer.jsx
│   ├── sections/               # Sezioni pagine pubbliche (Catalogo, Hero, ecc.)
│   ├── ui/                     # Componenti UI riusabili
│   └── seo/                    # PageSeo (helmet-async)
└── context/
    └── AdminAuthContext.jsx     # Stato auth globale (token, admin, logout)
```

---

## 11) Migrazioni automatiche del database
I microservizi gestiscono le **migrazioni dello schema in modo idempotente** all'avvio.
Non è richiesta alcuna operazione manuale: basta ricostruire i container.

| Servizio | Migrazione automatica |
|---|---|
| `auth-service` | Aggiunge colonna `role` se mancante |
| `auth-service` | Aggiunge colonna `last_login_at` se mancante |
| `photo-service` | Aggiunge colonna `uploaded_by_email` se mancante |
| `video-service` | Aggiunge colonna `uploaded_by_email` se mancante |

---

## 12) Credenziali di sviluppo predefinite
| Ruolo | Email | Password |
|---|---|---|
| Admin | `admin@assezero.local` | `admin_dev_change_me` |
| Editor | `editor@assezero.local` | `editor_dev_change_me` |

> Le credenziali sono configurabili tramite variabili d'ambiente (`DEFAULT_ADMIN_*`, `DEFAULT_EDITOR_*`) nel `docker-compose.yml`.

---

## 13) Conclusione (punti "da dire" in presentazione)
**Scelte principali del caso studio:**
- Architettura **microservizi** con DB dedicati (isolamento logico e semplice demo).
- **Gateway Nginx** per unificare l'API sotto `/api` e servire i file statici caricati via `/uploads/`.
- **Sicurezza JWT** con ruoli (`admin`/`editor`), middleware `requireAdmin` e rate limiting (anti-brute-force sul login, limite su mutazioni).
- **Upload file reale**: `multer` riceve i file, li salva su volume Docker condiviso, Nginx li serve senza overhead.
- **Auditing leggero**: ogni risorsa multimediale traccia chi l'ha caricata; ogni login aggiorna l'orario di accesso.
- **Deploy production-ready**: HTTPS con Let's Encrypt + SPA fallback + cache asset.

**Cosa rende il progetto un buon caso di studio:**
- Separazione chiara dei confini: front vs back vs gateway vs DB.
- Migrazioni automatiche all'avvio senza bisogno di tool esterni.
- Aggregazione dati multi-microservizio gestita client-side (no JOIN tra DB separati).
- Volume condiviso come soluzione elegante per la condivisione di file tra servizi.
- Interfaccia admin completamente funzionale e visivamente curata.
