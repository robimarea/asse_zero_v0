# Changelog Progetto ASSE ZERO

## Novità Architetturali e Admin (Versione Corrente)

### 1. Sistema di Upload File (Multer + Docker Volumes)
- I microservizi `photo-service` e `video-service` ora supportano upload di file `multipart/form-data` tramite `multer`.
- Creato un **volume condiviso Docker** (`media-uploads`) montato sui microservizi backend e sul container Nginx.
- Nginx mappa automaticamente il traffico verso la rotta `/uploads/` per servire istantaneamente le risorse statiche caricate dal backend (video .mp4 e immagini .webp/.jpg) abbattendo a zero l'overhead di rete tra container.
- Vite dev-server configurato con un proxy apposito per `/uploads`.

### 2. Dashboard Admin Fluida e Avanzata
- La pagina `AdminDashboard` è stata riprogettata con una UI a "Schede" (Tab).
- Separazione logica netta tra **Catalogo Foto**, **Catalogo Video** e **Gestione Team**.
- I form di inserimento ora utilizzano un **Input Calendario Nativo** (`<input type="month">`) per una UX migliore, formattando automaticamente la data stringa sul database ("Gennaio 2026").
- Migliorati nettamente i placeholder per guidare l'inserimento dati.

### 3. Monitoraggio Attività Team
- Introdotta la colonna `last_login_at` in `auth-service` (aggiornata in automatico su `/login`).
- Aggiunta colonna `uploaded_by_email` in `photo-service` e `video-service` (valorizzata tramite JWT `req.staff.email` ai vari POST).
- Creato `AdminTeamPanel`: un aggregatore intelligente lato frontend in grado di fare interrogazioni parallele (senza onerose JOIN SQL distribuiti) tra `auth-service`, `photo-service` e `video-service`, riepilogando in tempo reale: data ultimo accesso e conteggio esatto dei media caricati da ciascun membro del team.

---

## Refactoring Iniziale

### Obiettivo
Leggibilità, correttezza, efficienza e pulizia del codice senza alterare
lo stile visivo o il comportamento dell'applicazione.

---

## File MODIFICATI

### `App.jsx`
- **Rimosso** `useState`, `useCallback`, `loading`, `done` — lo stato di
  caricamento era definito ma mai usato (`onComplete` non veniva passato a
  `<LoadingScreen />`).
- Risultato: componente ridotto a sole 2 responsabilità reali (scroll-to-top
  + routing).

### `components/BlurText.jsx`
- `buildKeyframes` spostata fuori dal render loop (era già fuori, reso
  esplicito con commento).
- Keyframes (`animateKeyframes`) calcolati **una volta** nel corpo del
  componente invece di essere ricalcolati per ogni `motion.span`.
- Minori miglioramenti ai commenti.

### `components/LightRays.jsx`
- **Rimossa** la costante `DEFAULT_COLOR = '#ffffff'` — dichiarata ma mai
  referenziata in tutto il file.
- Shaders GLSL estratti in costanti modulo `VERT` / `FRAG` invece di essere
  string letterali inline nell'`useEffect`.
- `containerRef.current.replaceChildren(gl.canvas)` al posto del loop
  `while (firstChild) removeChild(...)`.
- La variabile `cancelled` ora blocca correttamente la race condition se
  il componente viene smontato durante l'`await`.
- Tutti i `useRef` consolidati; rimosso `observerRef` separato (ora locale
  nell'`useEffect`).

### `components/LoadingScreen.jsx`
- Aggiunto guard `typeof onComplete === 'function'` prima di chiamare la
  callback — la prop è opzionale (App non la passa).

### `styles/global.css`
- **Rimossa** la regola morta `.grid-background { display: none }` — il
  nodo non è mai nel DOM.
- Puliti i commenti verbosi; mantenuta la sezione degli alias semantici.

---

## File NUOVI (codice estratto dalle duplicazioni)

### `hooks/useContainerScroll.js`  *(NUOVO)*
- Estratto da `Services.jsx` e `Contact.jsx` dove era definito
  **identicamente** in entrambi i file.
- Ora importato da entrambi.

### `components/GlareCard.jsx`  *(NUOVO)*
### `components/GlareCard.module.css`  *(NUOVO)*
- Estratto da `Services.jsx` e `Contact.jsx` dove era definito
  **identicamente** in entrambi i file.
- Aggiunta prop `className` / `style` per permettere sovrascrittura puntuale
  da parte di ogni sezione.

### `components/SimpleBlurText.jsx`  *(NUOVO)*
- Estratto da `Services.jsx` e `Contact.jsx` dove il componente locale
  `BlurText` era definito **identicamente** in entrambi i file.
- Rinominato `SimpleBlurText` per distinguerlo dall'animazione framer-motion
  di `BlurText.jsx`.

---

## File INVARIATI (nessuna modifica necessaria)

| File | Motivo |
|------|--------|
| `components/Navigation.jsx` | Pulito, nessuna duplicazione |
| `components/Hero.jsx`       | Minimale, corretto |
| `components/HomeStory.jsx`  | Architettura corretta, IntersectionObserver ben gestito |
| `components/Footer.jsx`     | Minimale, corretto |
| `components/FilmFrame.jsx`  | Corretto, nessuna ridondanza |
| `components/Photos.jsx`     | Corretto |
| `components/Videos.jsx`     | Corretto |
| `hooks/useDragScroll.js`    | Corretto, cleanup completo |
| `hooks/useAutoScroll.js`    | Corretto, cleanup completo |
| `hooks/useScrollReveal.js`  | Corretto |
| `pages/Home.jsx`            | Minimale, corretto |
| `pages/Work.jsx`            | Minimale, corretto |
| `pages/Servizi.jsx`         | Minimale, corretto |
| `main.jsx`                  | Corretto |
| `index.html`                | Invariato |
| `vite_config.js`            | Invariato |
| `package.json`              | Invariato |
| Tutti i `.module.css`       | Invariati (stile visivo preservato) |
| `LightRays.css`             | Invariato |

---

## File MORTI (non usati da nessuna route né import)

| File | Stato |
|------|-------|
| `ContainerScrollCards.jsx` | Non importato da nessun file — può essere eliminato o archiviato per uso futuro |
| `About.jsx` / `About_module.css` | Componente completo ma non montato in nessuna route — aggiungere una route `/about` oppure eliminare |

> **Raccomandazione:** aggiungere `<Route path="/about" element={<About />} />` in
> `App.jsx` e un link `04 / About` in `Navigation.jsx` per non perdere il
> lavoro già fatto.
