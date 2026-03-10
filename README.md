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

## Differenze rispetto ad Astro

| Astro | React |
|---|---|
| `*.astro` components | `*.jsx` + CSS Modules |
| `public/scripts/*.mjs` | Hook custom in `src/hooks/` |
| `<slot />` in Layout | `children` prop / composizione in App.jsx |
| SEO nel frontmatter | `react-helmet-async` |
| SSG (HTML puro) | SPA (nginx fallback su index.html) |
