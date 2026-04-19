# Project Context

Questo file e pensato come context window persistente per AI e collaboratori.
Va aggiornato quando cambiano struttura, priorita, pattern architetturali o obiettivi del prodotto.

## Prodotto

- Nome attuale: `ASSE ZERO`
- Tipo di progetto: portfolio / studio site in React + Vite
- Obiettivo: presentare uno studio creativo con un linguaggio visivo editoriale e cinematografico
- Focus UX: scroll immersivo, sezioni magnetiche, presentazione premium di foto, video, servizi e team
- Focus tecnico: SPA React con routing client-side, forte uso di motion, CSS Modules, metadati SEO per pagina

## Stack

- Runtime: React 18
- Bundler: Vite 6
- Routing: `react-router-dom`
- SEO head management: `react-helmet-async`
- Motion: `framer-motion` + `gsap`
- Styling: CSS Modules + token globali in `src/styles/`

## Routing

- `/` -> Home
- `/work` -> portfolio foto + video
- `/servizi` -> servizi + contatto
- `/our-team` -> pagina team / vision / workspace
- `/about` -> redirect verso `/our-team`
- wildcard -> pagina 404 `noindex`

## Stato attuale del progetto

- E stato introdotto un sistema di viewport centralizzato in `src/hooks/useViewportSystem.js`
- Lo snap magnetico delle sezioni vive in `src/hooks/useChapterSnap.js`
- I metadati SEO sono centralizzati in `src/data/seoData.js` e renderizzati da `src/components/seo/PageSeo.jsx`
- La pagina `Our Team` e stata ristrutturata in:
  - `Our Vision`
  - `Our Story`
  - `Our Workspace`
  - `Our Team`
- I titoli delle sezioni principali sono di nuovo inclusi nel sistema di accentramento/snap

## Principi di design / sviluppo

- Il sito non deve sembrare template-based o generico
- Il movimento deve essere elegante, non nervoso
- Lo snap deve aiutare la lettura, non combattere lo scroll dell utente
- Le sezioni hero e i titoli hanno priorita narrativa, non solo decorativa
- Ogni modifica dovrebbe rispettare il tono: editoriale, cinematografico, pulito, intenzionale

## Albero logico della repo

```text
src/
  App.jsx                        shell app + routes + provider layout
  main.jsx                       entrypoint React

  components/
    layout/
      Navigation.jsx             menu overlay e navigazione principale
      Footer.jsx                 footer globale

    seo/
      PageSeo.jsx                meta tag, canonical, OG, Twitter, JSON-LD

    ui/
      LoadingScreen.jsx          intro/loading iniziale
      DotGrid.jsx                sfondo decorativo persistente
      ClickSpark.jsx             effetto visuale al click
      ScrollProgress.jsx         indicatore progresso scroll
      SimpleBlurText.jsx         reveal testuale animato
      ChapterSeparator.jsx       separatore tra blocchi narrativi
      ContactHoverCard.jsx       card 3D/hover per il contatto
      PricingBookCard.jsx        card servizi
      ResponsiveImage.jsx        picture con fallback immagini

    sections/
      Hero.jsx                   hero home
      HomeStory.jsx              asse narrativo home
      About.jsx                  pagina Our Team strutturata in 4 capitoli
      Services.jsx               servizi principali
      Contact.jsx                contatti + form
      Photos.jsx                 switch desktop/mobile per portfolio foto
      PhotosDesktop.jsx          portfolio foto desktop con layout su curva
      PhotosMobile.jsx           portfolio foto mobile
      Videos.jsx                 switch desktop/mobile per portfolio video
      VideosDesktop.jsx          portfolio video desktop
      VideosMobile.jsx           portfolio video mobile

      story/
        Manifesto.jsx            manifesto narrativo home
        ServicesPreview.jsx      teaser servizi in home
        Diptych.jsx              blocco visuale/storytelling home

  context/
    TransitionContext.jsx        transizioni pagina

  hooks/
    useViewportSystem.js         calcola variabili CSS viewport/focus
    useChapterSnap.js            magnetic snapping per i capitoli
    useMediaQuery.js             breakpoint logic
    useContainerScroll.js        transform locale usata dalla card contatti

  data/
    seoData.js                   configurazione SEO per pagina
    constants.js                 contenuti statici principali
    colors.js                    eventuali costanti colore

  styles/
    tokens.css                   design tokens globali
    global.css                   reset, utilities, stili globali
```

## Componenti chiave e responsabilita

### App shell

- `src/App.jsx`
  - monta layout globale
  - inizializza `useViewportSystem()`
  - inizializza `useChapterSnap()`
  - definisce route e redirect

### Sistema viewport / snap

- `src/hooks/useViewportSystem.js`
  - aggiorna CSS vars come `--viewport-height`, `--viewport-focus-y`
  - separa comportamento mobile/desktop
  - alimenta indirettamente il sistema di accentramento

- `src/hooks/useChapterSnap.js`
  - osserva tutti gli elementi con `data-chapter`
  - usa `data-snap-target="true"` se presente come target reale
  - usa preset `soft` / `editorial`
  - evita snap durante input, interazioni o motion ridotta

### Home

- `Hero.jsx`
  - apertura visiva iniziale
  - porta l utente verso la storia

- `HomeStory.jsx`
  - compone i moduli narrativi home

- `story/Manifesto.jsx`
  - manifesto del brand

- `story/ServicesPreview.jsx`
  - preview dei servizi

- `story/Diptych.jsx`
  - statement visivo e ponte verso `Our Team`

### Work

- `PhotosDesktop.jsx`
  - galleria desktop basata su curva bezier
  - lightbox e indice attivo

- `PhotosMobile.jsx`
  - stack mobile scroll-driven per le foto

- `VideosDesktop.jsx`
  - galleria video desktop con thumb rail e player visuale

- `VideosMobile.jsx`
  - versione mobile a slide 3D

### Servizi e contatti

- `Services.jsx`
  - intro servizi
  - due cluster principali: produzione video e social media

- `Contact.jsx`
  - intro contatto
  - card contatti con form e hover

- `useContainerScroll.js`
  - NON governa lo snap globale
  - serve solo a dare una trasformazione locale alla card contatto

### Our Team

- `About.jsx`
  - `Our Vision`: manifesto e quote
  - `Our Story`: origine e metodo
  - `Our Workspace`: processo e ambiente di lavoro
  - `Our Team`: struttura umana e CTA finale

## Convenzioni utili per modifiche future

- Se una sezione deve partecipare allo snap:
  - aggiungere `data-chapter`
  - opzionalmente `data-snap-strength`
  - opzionalmente `data-snap-target="true"` sull elemento da centrare davvero

- Se una sezione NON deve partecipare allo snap:
  - usare `data-no-snap="true"`

- Se una zona deve bloccare lo snap durante interazione:
  - usare `data-no-snap-during-interaction="true"`

- Se cambi la struttura delle pagine, aggiorna anche:
  - `src/data/seoData.js`
  - `public/sitemap.xml`
  - eventuali riferimenti narrativi in questo file

## File che andrebbero aggiornati spesso

- `PROJECT_CONTEXT.md`
- `src/data/seoData.js`
- `src/data/constants.js`
- eventuali README / note deploy se cambia dominio, routing o asset pipeline

## Note operative

- Il repo puo contenere modifiche locali non ancora committate: non fare revert aggressivi
- Il progetto usa immagini in `public/photos/`
- La build puo essere limitata dal sandbox locale; in quel caso usare verifica statica o build con permessi elevati se consentiti
