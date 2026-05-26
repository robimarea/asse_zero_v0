# ASSE ZERO — Portfolio & Microservizi

**ASSE ZERO** è un'applicazione web full-stack concepita come studio site / portfolio creativo con un linguaggio editoriale e cinematografico. Il progetto si basa su un'architettura moderna a microservizi per la gestione indipendente dei cataloghi multimediali (foto/video) e dell'autenticazione dello staff.

---

## 📌 Indice
1. [Architettura di Sistema](#-architettura-di-sistema)
2. [Requisiti di Sistema](#-requisiti-di-sistema)
3. [Guida al Setup & Run Rapido (Docker Compose)](#-guida-al-setup--run-rapido-docker-compose)
4. [Guida al Setup Locale (Sviluppo senza Docker)](#-guida-al-setup-locale-sviluppo-senza-docker)
5. [Credenziali di Sviluppo Default](#-credenziali-di-sviluppo-default)
6. [Analisi del Front-end](#-analisi-del-front-end)
7. [Analisi del Back-end](#-analisi-del-back-end)
8. [Pipeline CI/CD (GitHub Actions)](#-pipeline-cicd-github-actions)

---

## 🏗️ Architettura di Sistema

Il progetto è suddiviso in tre strati principali:
1. **Front-end (SPA)**: Sviluppato in React + Vite, offre una UI cinematografica ricca di micro-interazioni e transizioni fluide.
2. **API Gateway & Static File Serving (Nginx)**: In produzione/Docker, Nginx funge da gateway inoltrando le richieste `/api/*` ai rispettivi microservizi e servendo direttamente gli asset fisici caricati in `/uploads/` senza sovraccaricare Node.js.
3. **Back-end Microservizi (Express & Node.js)**:
   - **`auth-service`**: Gestione autenticazione, ruoli e audit di accesso.
   - **`photo-service`**: Gestione catalogo foto e caricamento file.
   - **`video-service`**: Gestione catalogo video, link esterni e caricamento file.
4. **Database (MySQL)**: Database unico con tre schemi isolati (`auth_svc`, `photos_svc`, `videos_svc`) per aderire al pattern *Database-per-Service*.

---

## 💻 Requisiti di Sistema

Prima di procedere, assicurati di avere installato:
- **Node.js** (v20+ consigliato) ed **npm**
- **Docker** e **Docker Compose**
- **Git** (per il controllo versione)

---

## 🐳 Guida al Setup & Run Rapido (Docker Compose)

Il metodo consigliato per avviare l'intero ecosistema è utilizzare **Docker Compose**, che configura automaticamente database, microservizi, gateway e frontend.

### 1. Configurazione dell'ambiente
Copia il file delle variabili d'ambiente di esempio nella directory radice:
```bash
cp .env.example .env
```
*(Facoltativo)* Apri il file `.env` per modificare le password o le chiavi JWT di default.

### 2. Avvio dello Stack Docker
Esegui il comando di avvio per compilare ed eseguire tutti i container in background:
```bash
docker compose up --build
```
In alternativa, puoi usare gli script definiti nel `package.json` del root di progetto:
```bash
# Avvio dello stack
npm run docker:up
```

Al termine del caricamento, le seguenti rotte saranno attive:
* 🌐 **Sito Web & Area Admin (Nginx Gateway)**: [http://localhost:8080](http://localhost:8080)
* 🗄️ **Database MySQL**: Esposto localmente sulla porta `3306`

> 💡 **Nota per il Database**: Non è possibile accedere a MySQL tramite il browser web (es. `http://localhost:3306/`). 
> ### 1. Usare un programma "Database Client" (Consigliato)
> Per esplorare le tabelle e i dati, scarica un client gratuito come **DBeaver**, **TablePlus** o **MySQL Workbench** e connettiti usando queste credenziali:
> * **Host:** `localhost` (o `127.0.0.1`)
> * **Port:** `3306`
> * **Username:** `assezero`
> * **Password:** `appsecret`
> * **Database:** `photos_svc`, `videos_svc` o `auth_svc`

### 3. Arresto e Pulizia dello Stack
Per fermare i container:
```bash
docker compose down
# Oppure tramite npm
npm run docker:down
```

Se desideri resettare completamente il database eliminando tutti i volumi persistiti e ricaricando lo schema e i seed iniziali:
```bash
docker compose down -v
# Oppure tramite npm
npm run docker:clean
```

---

## 🛠️ Guida al Setup Locale (Sviluppo senza Docker)

Se preferisci lavorare in locale con hot-reload e senza containerizzare i microservizi (tranne il database), segui questi passaggi.

### 1. Avvio del solo Database (MySQL)
Il backend necessita di un'istanza MySQL 8. È possibile avviarla rapidamente tramite Docker lasciando esposta la sola porta `3306`:
```bash
docker compose up -d mysql
```
*(Durante il primo avvio verranno eseguiti automaticamente gli script SQL presenti in `docker/mysql/init/` per inizializzare schemi, tabelle e dati demo)*.

### 2. Installazione delle dipendenze
Dalla radice del progetto, installa le dipendenze per tutti i moduli:
```bash
# Installa le dipendenze root
npm install

# Installa le dipendenze del frontend
cd frontend && npm install && cd ..

# Installa le dipendenze dei microservizi
cd backend/auth-service && npm install && cd ../..
cd backend/photo-service && npm install && cd ../..
cd backend/video-service && npm install && cd ../..
```

### 3. Configurazione dell'OS Host per gli Upload Locali
I microservizi `photo-service` e `video-service` salvano fisicamente i file nella cartella `/app/uploads`. Per evitare errori di permessi quando eseguiti al di fuori di Docker:
```bash
sudo mkdir -p /app/uploads
sudo chmod 777 /app/uploads
```

### 4. Avvio dei Microservizi Backend in locale
Dalla radice del progetto, puoi avviare i servizi in modalità di sviluppo (con `node --watch` attivo):
```bash
# Apri diversi terminali o avvia in background:
npm run dev:backend:auth
npm run dev:backend:photo
npm run dev:backend:video
```

### 5. Avvio del Frontend
Infine, avvia il server di sviluppo di Vite per il frontend:
```bash
npm run dev:frontend
```
Il frontend sarà accessibile su [http://localhost:5173](http://localhost:5173). 

> ℹ️ **Nota sul Proxy di Sviluppo**: Grazie alla configurazione presente in [vite.config.js](file:///home/tomas/Desktop/Uni/asse_zero_v0/frontend/vite.config.js), tutte le chiamate effettuate dal client verso `/api/photos`, `/api/videos` e `/api/auth` verranno automaticamente inoltrate alle porte locali dei rispettivi microservizi (`4001`, `4002` e `4003`), risolvendo qualsiasi problema di CORS in fase di sviluppo.

---

## 🔑 Credenziali di Sviluppo Default

Dopo l'inizializzazione del database, sono pronti due utenti staff predefiniti per testare l'area amministrativa:

| Ruolo | Email | Password di Default |
| :--- | :--- | :--- |
| **Admin** | `admin@assezero.local` | `admin_dev_change_me` |
| **Editor** | `editor@assezero.local` | `editor_dev_change_me` |

*(Puoi sovrascrivere queste credenziali modificando le variabili `DEFAULT_ADMIN_*` e `DEFAULT_EDITOR_*` nel file `.env`)*.

---

## 🖥️ Analisi del Front-end

Il frontend è strutturato come una **Single Page Application (SPA)** in React 18 e Vite 6, focalizzata sulla resa estetica e sull'esperienza utente (UX).

### Caratteristiche Tecniche del Frontend
* **UI/UX Premium e Motion-Driven**: Utilizza **Framer Motion**, **GSAP** e **OGL** per implementare effetti di scroll reveal cinematografici, scroll "magnetico" personalizzato e transizioni di capitolo fluide.
* **Client-Side Routing**: Gestito con `react-router-dom` con caricamento asincrono (`lazy` + `Suspense`) delle rotte per ridurre al minimo il peso del bundle iniziale.
* **Ottimizzazione SEO**: Utilizzo di `react-helmet-async` per iniettare dinamicamente titoli e meta description specifici per ogni pagina.
* **Architettura Aggregata Client-Side (Gestione Team)**: Nel pannello amministrativo della gestione dello staff (`AdminTeamPanel`), per rispettare l'isolamento dei database dei microservizi, il frontend esegue chiamate parallele ai tre servizi (`auth-service`, `photo-service`, `video-service`) e aggrega i dati a livello client (es. calcola il numero di upload effettuati da ogni utente). Ciò evita accoppiamenti forti (come `JOIN` multi-database) a livello backend.

---

## ⚙️ Analisi del Back-end

Il backend adotta un'architettura a **microservizi isolati** basati su Node.js (con moduli nativi `.mjs` ES) ed Express.

### Caratteristiche Chiave del Backend
1. **Database-per-Service**:
   Ciascun microservizio ha il proprio database MySQL logico separato. Questo impedisce a un servizio di accedere o modificare tabelle di un altro servizio se non tramite chiamate API, salvaguardando l'indipendenza strutturale.
2. **Sistema di Migrazione Schema Idempotente**:
   Tutti i servizi eseguono all'avvio controlli preventivi del database (`waitForMysql` e migrazioni automatiche). Se colonne come `role` in `admins` o `uploaded_by_email` in `photos`/`videos` non esistono, il servizio le crea in autonomia senza l'ausilio di tool di migrazione esterni.
3. **Sicurezza & Controllo Accessi (JWT + Ruoli)**:
   * Autenticazione stateless basata su token **JWT** firmati con `JWT_SECRET`.
   * Middleware di autorizzazione a livello di rotta: `requireAuth` (staff generico) e `requireAdmin` (restrizioni per soli amministratori).
   * Password hashing robusto tramite **bcryptjs**.
4. **Resilienza e Rate Limiting**:
   Per contrastare attacchi brute-force e abusi, viene impiegato `express-rate-limit`:
   * **Login Limit**: Massimo 12 tentativi in 15 minuti su `POST /login`.
   * **Global API Limit**: Massimo 120 richieste al minuto su `auth-service`.
   * **Mutation Limit**: Massimo 30 scritture al minuto su `photo-service` e `video-service`.
5. [Volume Docker Condiviso (`media-uploads`)](#-volume-docker-condiviso-media-uploads):
   Invece di appoggiarsi a server di storage di terze parti o trasferire file binari in HTTP tra container, i microservizi scrivono i file caricati tramite `multer` in un volume condiviso montato in `/app/uploads`. Nginx a sua volta vi accede in sola lettura montandolo in `/usr/share/nginx/html/uploads`, esponendolo direttamente al client via HTTP veloce.
6. [Auditing delle Azioni](#-auditing-delle-azioni):
   Ogni operazione di inserimento (upload di foto o video) viene marcata registrando l'email dell'autore (`uploaded_by_email` estratto dal JWT del middleware), permettendo agli amministratori di monitorare l'operato del team.

---

## 🚀 Pipeline CI/CD (GitHub Actions)

Il progetto include un workflow di automazione integrato in GitHub Actions tramite il file [.github/workflows/ci.yml](file:///home/tomas/Desktop/Uni/asse_zero_v0/.github/workflows/ci.yml). La pipeline gestisce automaticamente la validazione del codice e il rilascio continuo sulla VPS di produzione.

### 1. Fase di Continuous Integration (CI)
Ogni volta che viene effettuata una Pull Request o un Push verso i rami principali (`main`, `master`), la pipeline esegue i seguenti passaggi di verifica su un ambiente pulito:
* **Setup Ambiente**: Inizializzazione di Node.js (v20) e caching automatico delle dipendenze per velocizzare le esecuzioni successive.
* **Verifica Frontend**: Installazione delle dipendenze del frontend (`npm ci`) e avvio del processo di build di Vite per assicurarsi che non siano presenti errori di compilazione o refactoring errati.
* **Verifica Microservizi Backend**: Installazione pulita delle dipendenze per ciascuno dei tre microservizi (`auth-service`, `photo-service`, `video-service`) per verificare l'integrità dei moduli.
* **Verifica Ecosistema Docker**: Configurazione di Docker Buildx ed esecuzione di un test di build completo (`docker compose build`) per assicurare che la containerizzazione funzioni e le configurazioni dei Dockerfile non contengano errori.

### 2. Fase di Continuous Deployment (CD)
Se tutti i passaggi della CI hanno esito positivo, e il push è avvenuto sul ramo principale (`main` o `master`), viene avviato automaticamente il job di deployment:
* **Deployment via SSH**: GitHub Actions stabilisce una connessione SSH crittografata con la VPS remota.
* **Aggiornamento Codice**: Esegue un comando `git pull` per aggiornare il repository locale della VPS all'ultima versione.
* **Riavvio Stack Docker**: Esegue `docker compose up -d --build` per aggiornare e ricostruire i container modificati con un downtime minimo.
* **Manutenzione**: Esegue una pulizia delle immagini Docker vecchie ed inutilizzate (`docker image prune -f`) sulla VPS per ottimizzare lo spazio su disco.

### 🔑 Configurazione delle credenziali (Secrets)
Per abilitare il corretto funzionamento del deploy automatico (CD), configura i seguenti **Secrets** all'interno delle impostazioni del tuo repository GitHub (`Settings -> Secrets and variables -> Actions`):
* **`VPS_HOST`**: L'IP pubblico della tua VPS (es. `80.120.X.X`).
* **`VPS_USER`**: L'utente di sistema per la connessione SSH (es. `root`).
* **`SSH_PRIVATE_KEY`**: La chiave SSH privata. La corrispondente chiave pubblica deve essere memorizzata nel file `~/.ssh/authorized_keys` dell'utente sulla VPS.
* **`VPS_PORT`**: *(Opzionale)* La porta SSH della VPS (default `22`).
