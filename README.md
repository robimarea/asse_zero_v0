# Gerardo Romani — Portfolio React

Conversione 1:1 del sito Astro in React + Vite con CSS Modules.

---

## Struttura del progetto

```
gerardoromani-react/
├── public/
│   ├── photos/                  ← stesse immagini del progetto Astro
│   │   ├── profilo.jpeg
│   │   ├── f1.jpg … f7.jpg
│   └── images/
│       └── video1-thumb.jpg … video8-thumb.jpg
│
├── src/
│   ├── styles/
│   │   └── global.css           ← variabili CSS, body, grid-background, section reveal
│   │
│   ├── hooks/
│   │   ├── useScrollReveal.js   ← IntersectionObserver (era utils.mjs)
│   │   ├── useDragScroll.js     ← drag mouse/touch (era photos/videos-scroll.mjs)
│   │   └── useAutoScroll.js     ← rAF auto-scroll avanti/indietro
│   │
│   ├── components/
│   │   ├── Navigation.jsx + .module.css   (era Navigation.astro + navigation.mjs)
│   │   ├── Hero.jsx       + .module.css
│   │   ├── About.jsx      + .module.css
│   │   ├── Photos.jsx     + .module.css   (lightbox incluso, era photos-lightbox.mjs)
│   │   ├── Videos.jsx     + .module.css
│   │   ├── Services.jsx   + .module.css
│   │   ├── Contact.jsx    + .module.css   (form state, era contact-form.mjs)
│   │   └── Footer.jsx     + .module.css
│   │
│   ├── App.jsx                  ← assembla tutto, chiama useScrollReveal
│   └── main.jsx                 ← entry point ReactDOM
│
├── index.html                   ← fonts Google + div#root
├── vite.config.js
├── package.json
├── nginx.conf                   ← config per VPS Aruba (SPA fallback)
└── README.md
```

---

## Avvio locale

```bash
npm install
npm run dev
```

## Build per produzione

```bash
npm run build
# Output in /dist
```

## Deploy su VPS Aruba

```bash
# 1. Build locale
npm run build

# 2. Copia dist sul server
scp -r dist/ user@gerardoromani.it:/var/www/gerardoromani/

# 3. Sul server — installa nginx se non presente
sudo apt install nginx certbot python3-certbot-nginx

# 4. Copia la config nginx
sudo cp nginx.conf /etc/nginx/sites-available/gerardoromani
sudo ln -s /etc/nginx/sites-available/gerardoromani /etc/nginx/sites-enabled/

# 5. Certificato SSL gratuito
sudo certbot --nginx -d gerardoromani.it -d www.gerardoromani.it

# 6. Riavvia nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

## Avvio con Docker Compose (microservizi riusabili)

Questa repo include una **versione “a pezzi”** del setup docker: invece di un singolo `docker-compose.yml`, puoi usare un compose dedicato per ogni service.

### Comandi rapidi

#### 1) MySQL only (DB)
```bash
docker compose -f docker-compose.mysql.yml up
```
- UI/porta DB: `localhost:3306` (host)
- Dati DB persistono in `mysql-data` (volume)

Per fermare e tenere i volumi:
```bash
docker compose -f docker-compose.mysql.yml down
```

Per resettare DB (ATTENZIONE cancella i dati):
```bash
docker compose -f docker-compose.mysql.yml down -v
```

#### 2) Photo microservice (+ DB interno)
```bash
docker compose -f docker-compose.photo.yml up --build
```
- Non espone `3306` verso l’host (solo rete Docker)
- Volume DB separato: `mysql-data-photo`

#### 3) Video microservice (+ DB interno)
```bash
docker compose -f docker-compose.video.yml up --build
```
- Non espone `3306` verso l’host
- Volume DB separato: `mysql-data-video`

#### 4) Auth microservice (+ DB interno)
```bash
docker compose -f docker-compose.auth.yml up --build
```
- Non espone `3306` verso l’host
- Volume DB separato: `mysql-data-auth`

#### 5) Web (SPA + nginx gateway)
```bash
docker compose -f docker-compose.web.yml up --build
```
- Porta: `http://localhost:8080`

### Robustezza / semplicità (per esame)
- **Setup modulare**: puoi avviare solo ciò che ti serve (MySQL / Photo / Video / Auth / Web).
- **Avvio ordinato**: `depends_on` con `condition: service_healthy` per evitare race-condition lato DB.
- **Nessuna collisione di porte**: solo `docker-compose.mysql.yml` espone `3306` all’host.
- **DB isolati per stack**: volumi separati per evitare interferenze tra microservizi durante test/demo.
- **Riusabilità**: i file compose sono indipendenti e riutilizzabili anche in contesti diversi (es. prove parziali in sede).

---

## Differenze rispetto ad Astro

| Astro | React |
|---|---|
| `*.astro` components | `*.jsx` + CSS Modules |
| `public/scripts/*.mjs` | Hook custom in `src/hooks/` |
| `<slot />` in Layout | `children` prop / composizione in App.jsx |
| SEO nel frontmatter | `react-helmet-async` |
| SSG (HTML puro) | SPA (nginx fallback su index.html) |
