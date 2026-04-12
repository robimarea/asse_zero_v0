// src/data/constants.js
// Unica fonte di verità per tutti i dati statici dell'applicazione.

export const NAV_ITEMS = [
  { to: '/',        label: 'Home',    num: '01' },
  { to: '/work',    label: 'Work',    num: '02' },
  { to: '/servizi', label: 'Servizi', num: '03' },
  { to: '/about',   label: 'About',   num: '04' },
];

export const SERVICES_PREVIEW = [
  { num: '01', title: 'Advertising',  sub: 'Brand · Spot TV · Campaigns',  img: '/photos/f1.jpg' },
  { num: '02', title: 'Short Films',  sub: 'Cinema · Festival · Narrative', img: '/photos/f2.jpg' },
  { num: '03', title: 'Music Videos', sub: 'Artists · Labels · Concerts',   img: '/photos/f3.jpg' },
  { num: '04', title: 'Sound Design', sub: 'Score · Mix · Mastering',       img: '/photos/f4.jpg' },
];

export const SERVICES_FULL = [
  {
    id: 'pubblicita', index: '01',
    title: 'Pubblicità', subtitle: 'Advertising & Commercial',
    description: 'Creiamo campagne pubblicitarie che colpiscono nel segno. Dalla concept strategy alla post-produzione, ogni spot racconta il tuo brand con precisione chirurgica e impatto visivo duraturo.',
    tags: ['Brand Film', 'Spot TV', 'Digital Ads', 'Corporate Video'],
    accent: '#FF3B00', bg: '#0a0a0a', textColor: '#fff', graphic: 'adv',
  },
  {
    id: 'cortometraggi', index: '02',
    title: 'Cortometraggi', subtitle: 'Short Films',
    description: 'La narrazione è al centro di tutto. Sviluppiamo sceneggiature originali, dirigiamo set complessi e curiamo ogni frame per portare sul grande schermo storie che rimangono impresse.',
    tags: ['Sceneggiatura', 'Regia', 'Casting', 'Color Grading'],
    accent: '#C8A951', bg: '#080810', textColor: '#f5f0e8', graphic: 'film',
  },
  {
    id: 'videoclip', index: '03',
    title: 'Video Musicali', subtitle: 'Music Videos',
    description: 'Traduciamo ogni traccia in un universo visivo. Concept art, coreografie, effetti speciali in camera e un editing al ritmo della musica per video che diventano icone.',
    tags: ['Concept Art', 'Performance', 'VFX', 'Live Action'],
    accent: '#9B30FF', bg: '#06010f', textColor: '#fff', graphic: 'music',
  },
  {
    id: 'sounddesign', index: '04',
    title: 'Sound Design', subtitle: 'Audio & Music Production',
    description: 'Il suono che non senti è quello che senti di più. Composizione originale, sound design immersivo, mix e mastering per ogni formato: cinema, streaming, broadcast.',
    tags: ['Colonna Sonora', 'Foley', 'Mix & Master', 'Spatial Audio'],
    accent: '#00C8FF', bg: '#010810', textColor: '#e8f5ff', graphic: 'sound',
  },
];

export const PHOTOS = [
  { title: 'Campagna Autunnale',   category: 'Pubblicità',     date: 'Gennaio 2026',   src: '/photos/1.jpeg', desc: 'Una campagna visiva autunnale per brand identity, giocata su luce calda e ombre cinematografiche.' },
  { title: 'Brand Identity Shoot', category: 'Pubblicità',     date: 'Dicembre 2025',  src: '/photos/2.jpeg', desc: 'Ritratti editoriali in studio per campagna di lancio prodotto.' },
  { title: 'Luce di Mezzogiorno',  category: 'Cortometraggio', date: 'Novembre 2025',  src: '/photos/3.jpeg', desc: 'Still dal set del cortometraggio. Luce naturale, emotività pura.' },
  { title: 'Il Confine',           category: 'Cortometraggio', date: 'Ottobre 2025',   src: '/photos/4.jpeg', desc: 'Frame emblematico del confine psicologico del personaggio principale.' },
  { title: 'Neon Nights',          category: 'Video Musicale', date: 'Settembre 2025', src: '/photos/5.jpeg', desc: 'Set fotografico notturno per videoclip. Luce artificiale al neon su pelle.' },
  { title: 'Scena Finale',         category: 'Cortometraggio', date: 'Agosto 2025',    src: '/photos/1.jpeg', desc: 'L\'ultima inquadratura del film: silenzio, nostalgia e luce di taglio.' },
];

export const VIDEOS = [
  { id: 1, label: 'VIDEO CREATIVO 1', date: 'Gennaio 2026',  url: 'https://www.instagram.com/reel/DOa-1TnDNvi/', desc: 'Un’esplorazione visiva tra architettura e movimento, catturata con estetica minimale.' },
  { id: 2, label: 'VIDEO CREATIVO 2', date: 'Gennaio 2026',  url: 'https://www.instagram.com/reel/EXAMPLE2/', desc: 'Sound design immersivo e dinamiche veloci per raccontare l’energia urbana.' },
  { id: 3, label: 'VIDEO CREATIVO 3', date: 'Dicembre 2025', url: 'https://www.instagram.com/reel/EXAMPLE3/', desc: 'Studio sulla luce naturale e riflessi in un ambiente industriale dismesso.' },
  { id: 4, label: 'VIDEO CREATIVO 4', date: 'Dicembre 2025', url: 'https://www.instagram.com/reel/EXAMPLE4/', desc: 'Frammenti di vita quotidiana rielaborati in chiave sognante e cinematografica.' },
  { id: 5, label: 'VIDEO CREATIVO 5', date: 'Novembre 2025', url: 'https://www.instagram.com/reel/EXAMPLE5/', desc: 'Texture organiche e macro-riprese per un’esperienza visiva tattile.' },
  { id: 6, label: 'VIDEO CREATIVO 6', date: 'Novembre 2025', url: 'https://www.instagram.com/reel/EXAMPLE6/', desc: 'Un viaggio notturno attraverso le luci della città e il ritmo del battito urbano.' },
  { id: 7, label: 'VIDEO CREATIVO 7', date: 'Ottobre 2025',  url: 'https://www.instagram.com/reel/EXAMPLE7/', desc: 'Contrasti netti e bianco e nero per un’estetica noir contemporanea.' },
  { id: 8, label: 'VIDEO CREATIVO 8', date: 'Ottobre 2025',  url: 'https://www.instagram.com/reel/EXAMPLE8/', desc: 'La natura incontra il digitale in un montaggio sperimentale e psichedelico.' },
];

export const CONTACT = {
  email:        import.meta.env.VITE_CONTACT_EMAIL    ?? 'gerardo@example.com',
  instagram:    import.meta.env.VITE_INSTAGRAM_HANDLE ?? '@gerardoromani',
  instagramUrl: import.meta.env.VITE_INSTAGRAM_URL    ?? 'https://instagram.com/gerardoromani',
};

export const PROCESS_STEPS = [
  { n: '01', phase: 'Sviluppo',       desc: 'Ascoltiamo, ricerchiamo, costruiamo il concept. La storia prima di tutto.' },
  { n: '02', phase: 'Pre-produzione', desc: 'Storyboard, scouting, cast. Ogni dettaglio è pianificato prima che la camera giri.' },
  { n: '03', phase: 'Produzione',     desc: 'Sul set con crew selezionata. Direzione artistica totale, dal primo all\'ultimo frame.' },
  { n: '04', phase: 'Post',           desc: 'Color grading, sound design, mix. Dove i fotogrammi diventano cinema.' },
];
