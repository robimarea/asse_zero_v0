# ASSE ZERO — Caso di Studio e Documentazione Architetturale
## Corso di Evoluzione del Software

Questo documento costituisce il caso di studio analitico e la documentazione tecnica del progetto **ASSE ZERO**. L'obiettivo è analizzare l'architettura applicativa, le scelte tecnologiche e l'infrastruttura DevOps in vista di un processo di evoluzione ed ingegnerizzazione del software.

---

## 📌 Indice
1. [Overview del Sistema & Obiettivi](#1-overview-del-sistema--obiettivi)
2. [Architettura Front-end (React + Vite)](#2-architettura-front-end-react--vite)
3. [Architettura Dettagliata Back-end (Express & Microservizi)](#3-architettura-dettagliata-back-end-express--microservizi)
4. [Infrastruttura Docker & Containerizzazione](#4-infrastruttura-docker--containerizzazione)
5. [Configurazione del Nginx Gateway (Reverse Proxy)](#5-configurazione-del-nginx-gateway-reverse-proxy)
6. [Infrastruttura DevOps & Pipeline CI/CD (GitHub Actions)](#6-infrastruttura-devops--pipeline-cicd-github-actions)
7. [Comandistica e Script di Automazione](#7-comandistica-e-script-di-automazione)
8. [Strategia per l'Evoluzione del Software](#8-strategia-per-levoluzione-del-software)

---

## 1. Overview del Sistema & Obiettivi

**ASSE ZERO** è una piattaforma web concepita come portfolio e archivio multimediale per uno studio creativo. L'applicazione adotta un design editoriale fortemente incentrato su fluidità e micro-interazioni visuali nel front-end, supportato da un back-end distribuito orientato ai microservizi nel back-end.

### Obiettivi Architetturali Principali:
* **Separazione dei Confini (Bounded Contexts)**: Dividere la gestione dei contenuti fotografici, video e della sicurezza in tre servizi autonomi.
* **Database-per-Service**: Evitare accoppiamenti di database e consentire a ciascun microservizio di gestire il proprio schema dati in modo indipendente.
* **Infrastruttura Portabile**: Containerizzare l'intero sistema per permettere build e deploy riproducibili su qualsiasi ambiente (locale, staging o VPS di produzione).
* **Automazione DevOps**: Sviluppare una pipeline CI/CD per eliminare le operazioni manuali e validare i rilasci.

```
                  +---------------------------------------+
                  |            Browser Client             |
                  +-------------------+-------------------+
                                      |
                                      | HTTP Port 8080 (Gateway)
                                      v
                  +-------------------+-------------------+
                  |           Nginx Web Server            |
                  |     (Gateway & Static SPA Serving)    |
                  +-------+-----------+-----------+-------+
                          |           |           |
               /api/auth  |           |           | /api/videos
                          v           |           v
                  +-------+---+  /api/photos  +---+-------+
                  |   Auth    |       |       |   Video   |
                  |  Service  |       v       |  Service  |
                  | (Pt 4003) |  +----+---+   | (Pt 4002) |
                  +---+-------+  | Photo  |   +-------+---+
                      |          |Service |           |
                      |          |(Pt4001)|           |
                      |          +----+---+           |
                      |               |               |
                      +-------+       |       +-------+
                              |       |       |
                              v       v       v
                  +-----------+-------+-------+-----------+
                  |              MySQL 8.0                |
                  | (Database: auth_svc, photos_svc,...)  |
                  +---------------------------------------+
```

---

## 2. Architettura Front-end (React + Vite)

Il front-end è strutturato come una **Single Page Application (SPA)** progettata per massimizzare le performance e la reattività grafica.

### Stack Tecnologico Front-end:
* **React 18** per la programmazione dichiarativa dell'interfaccia utente.
* **Vite 6** come build tool ad alta velocità (sfrutta ES Modules in sviluppo ed Rollup in produzione).
* **Framer Motion, GSAP, OGL** per la gestione di animazioni complesse (incluso lo scroll snap magnetico ed effetti di reveal cinematografici).
* **react-router-dom** per il routing client-side (con caricamento asincrono tramite `lazy()` e `Suspense`).
* **react-helmet-async** per l'iniezione dinamica di tag meta-SEO ad ogni variazione di rotta.

### Gestione dello Stato e Integrazione Microservizi:
* **Auth State**: Centralizzato in un context globale (`AdminAuthContext.jsx`) che mantiene lo stato del JWT in memoria e nel `localStorage` per persistere la sessione amministrativa.
* **Aggregazione Dati Client-side**: Per evitare JOIN inter-database che violerebbero i principi dei microservizi, il modulo di visualizzazione delle statistiche del team amministrativo (`AdminTeamPanel`) esegue tre richieste HTTP asincrone concorrenti (`Promise.all`):
  1. `GET /api/auth/users` (elenco utenti).
  2. `GET /api/photos` (elenco foto per conteggio autore).
  3. `GET /api/videos` (elenco video per conteggio autore).
  
  React aggrega queste informazioni a runtime visualizzando le statistiche dell'operato dello staff senza generare accoppiamento nel backend.

---

## 3. Architettura Dettagliata Back-end (Express & Microservizi)

Il back-end è suddiviso in tre microservizi scritti in **Node.js (ES Modules)** utilizzando il framework **Express.js**.

### 3.1 I Microservizi
1. **`auth-service` (Porta 4003)**:
   * **Responsabilità**: Registrazione, login dello staff, gestione dei ruoli (`admin` ed `editor`), tracciamento dell'ultimo accesso (`last_login_at`) e stato online.
   * **Endpoint principali**:
     * `POST /login`: Autentica l'utente tramite email/password e rilascia un token JWT.
     * `GET /me`: Verifica e restituisce i dettagli dell'utente connesso (protetto da token).
     * `GET /users`: Restituisce la lista di utenti (riservato al ruolo `admin`).
2. **`photo-service` (Porta 4001)**:
   * **Responsabilità**: Catalogazione delle foto, caricamento e ottimizzazione dei file.
   * **Ottimizzazione Media**: Converte automaticamente JPG/PNG in formato WebP (qualità 80) e rimuove l'originale dal disco. Riduce le dimensioni dei file del 70-80% a parità di qualità visiva per massimizzare il punteggio SEO PageSpeed.
   * **Endpoint principali**:
     * `GET /photos`: Ritorna l'intero catalogo foto con compressione `gzip` (pubblico).
     * `POST /photos`: Carica una nuova foto, effettua la conversione a WebP, elimina l'originale ed inserisce il riferimento `.webp` a DB (protetto).
     * `DELETE /photos/:id`: Rimuove il record e cancella definitivamente il file fisico dal volume condiviso (protetto).
3. **`video-service` (Porta 4002)**:
   * **Responsabilità**: Catalogazione dei contenuti video.
   * **Ottimizzazione Media**: Accetta esclusivamente video in formato MP4 per garantire il supporto universale su tutti i dispositivi/browser ed evitare la latenza di transcodifica video.
   * **Endpoint principali**:
     * `GET /videos`: Elenco dei video con compressione `gzip` (pubblico).
     * `POST /videos`: Creazione di un nuovo record / upload file MP4 (protetto).
     * `DELETE /videos/:id`: Rimuove il record e cancella definitivamente il file MP4 fisico dal volume condiviso (protetto).

### 3.2 Database & Pattern "Database-per-Service"
Il server MySQL 8.0 ospita tre schemi isolati per prevenire accoppiamenti logici:
* **`auth_svc`**: Contiene la tabella `admins` (id, email, password_hash, role, last_login_at, is_online).
* **`photos_svc`**: Contiene la tabella `photos` (id, title, category, date_label, src, description, sort_order, uploaded_by_email).
* **`videos_svc`**: Contiene la tabella `videos` (id, label, date_label, url, description, sort_order, uploaded_by_email).

La connessione ai database avviene tramite pooling gestito dalla libreria `mysql2/promise`.

> 💡 **Nota per l'esplorazione dati locale**: Non è possibile accedere a MySQL tramite browser web (es. `http://localhost:3306/`).
> ### 1. Usare un programma "Database Client" (Consigliato)
> Per esplorare le tabelle e i dati durante lo sviluppo locale, si consiglia di scaricare un client gratuito come **DBeaver**, **TablePlus** o **MySQL Workbench** e connettersi usando queste credenziali:
> * **Host:** `localhost` (o `127.0.0.1`)
> * **Port:** `3306`
> * **Username:** `assezero`
> * **Password:** `appsecret`
> * **Database:** `photos_svc`, `videos_svc` o `auth_svc`
### 3.3 Migrazioni dello Schema Autonome ed Idempotenti
Per facilitare il deploy "zero-touch", i microservizi includono al loro avvio una logica di migrazione automatica. Eseguendo query riflessive su `information_schema`, i servizi verificano la presenza di tabelle o colonne ed eseguono query `ALTER TABLE` qualora manchino attributi aggiornati (ad esempio, le colonne di audit `uploaded_by_email` o lo stato `is_online`).

Esempio di query riflessiva in `auth-service/server.mjs`:
```javascript
const [cols] = await pool.query(
  `SELECT COLUMN_NAME FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'role'`,
  [MYSQL_DATABASE],
);
if (!cols.length) {
  await pool.query(
    `ALTER TABLE admins ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'admin' AFTER password_hash`,
  );
}
```

### 3.4 Meccanismi di Sicurezza, Resilienza & Quota Limit
* **Autenticazione Ibrida (JWT Stateless + Blacklist Stateful)**: 
  * I token JWT hanno una scadenza originaria di 8 ore per ridurre l'overhead sui server.
  * **Log-out & Revoca**: Al logout (`POST /logout`), la firma del token viene convertita in hash SHA-256 e memorizzata nella tabella `auth_svc.token_blacklist`.
  * **Verifica della Blacklist**: Ciascun middleware di controllo accessi (`requireAuth`, `requirePhotoStaff`, `requireVideoStaff`) interroga questa tabella prima di procedere. Se l'hash corrisponde, l'accesso viene negato (sessione invalidata). Un processo orario nel backend provvede ad eliminare i token memorizzati ormai scaduti.
* **Quota di Caricamento Giornaliera (50 GB / 24 ore)**:
  * Per evitare attacchi DoS volti a saturare il disco del server (Disk Exhaustion), gli upload vengono tracciati nella tabella `auth_svc.upload_logs` registrando la dimensione in byte di ciascun file salvato fisicamente (WebP per le foto, MP4 per i video).
  * Prima di elaborare un nuovo caricamento, il microservizio calcola il volume caricato nelle ultime 24 ore. Se la somma supera i **50 GB**, l'upload viene bloccato e il file temporaneo rimosso dal disco.
* **Controllo dei Ruoli (RBAC)**: I middleware `requireAuth` e `requireAdmin` intercettano le chiamate HTTP e decodificano il payload per accertare il ruolo del richiedente prima di passare al controller.
* **Rate Limiting**: Configurato tramite `express-rate-limit` per mitigare attacchi Denial of Service (DoS) e Brute-Force:
  * **Brute-Force Protection**: Massimo 12 tentativi su `POST /login` ogni 15 minuti.
  * **Global limits**: Limite di 120 chiamate al minuto per IP su `auth-service`.
  * **Mutation protection**: Massimo 30 operazioni di scrittura al minuto sui cataloghi foto/video per prevenire spam sul disco.
* **Prevenzione di File Orfani (File Cleanup & Conversion)**:
  * In caso di errori durante la convalida del form o fallimenti nelle query SQL del database, i file temporanei caricati o generati (es. WebP) vengono immediatamente cancellati fisicamente dal server (`fs.unlinkSync`) evitando sprechi di memoria.
  * Quando si rimuove una voce di catalogo (`DELETE`), il backend cancella fisicamente e definitivamente i relativi file multimediali dal volume condiviso.

---

## 4. Infrastruttura Docker & Containerizzazione

Il progetto adotta una configurazione multi-container tramite Docker Compose. Ciascun microservizio e il gateway Nginx possiedono il proprio `Dockerfile` basato su immagini Linux minimali (`alpine` o `slim`).

### 4.1 Strategia di Build Multi-Stage del Frontend
Il frontend non necessita di Node.js a runtime, ma solo per la compilazione. Il file `docker/web.Dockerfile` adotta il pattern multi-stage:
```dockerfile
# Stage 1: Compilazione degli asset statici in una sandbox Node.js
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Copia degli asset compilati in un server web Nginx minimale
FROM nginx:1.27-alpine
COPY docker/nginx.docker.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
```
Questo approccio riduce la dimensione finale dell'immagine di produzione a poche decine di megabyte e isola il codice sorgente del frontend.

### 4.2 Docker Compose Stack (`docker-compose.yml`)
Il file di orchestrazione definisce i servizi, le dipendenze e i volumi:
* **Dipendenze Sequenziali (`depends_on`)**: I servizi backend non partono finché il database MySQL non è pronto e funzionante. Questo viene garantito tramite un `healthcheck` integrato nel container mysql:
```yaml
depends_on:
  mysql:
    condition: service_healthy
```
* **Volume Condiviso per i File (`media-uploads`)**: Uno dei problemi più complessi nei microservizi è la gestione dello storage. ASSE ZERO risolve questo problema definendo un volume condiviso a livello di Docker Host:
  * `photo-service` e `video-service` montano il volume in scrittura su `/app/uploads`.
  * Il container `web` (Nginx Gateway) monta lo stesso volume in lettura su `/usr/share/nginx/html/uploads`.
  * **Vantaggio**: Quando l'amministratore carica un file, questo viene salvato istantaneamente sul volume e servito da Nginx senza passaggi di dati in rete o latenze infrastrutturali.

---

## 5. Configurazione del Nginx Gateway (Reverse Proxy)

Nginx funge da **API Gateway** unificato per l'applicazione. È configurato tramite `docker/nginx.docker.conf` per gestire i seguenti flussi:

1. **Routing delle API**:
   * Chiamate a `/api/photos` -> Inoltrate internamente al microservizio `photo-service:4001/photos`.
   * Chiamate a `/api/videos` -> Inoltrate internamente al microservizio `video-service:4002/videos`.
   * Chiamate a `/api/auth/` -> Inoltrate internamente al microservizio `auth-service:4003/`.
2. **Serving dei Media statici**:
   La rotta `/uploads/` punta all'alias della cartella montata dal volume condiviso. Nginx bypassa completamente Node.js per la distribuzione di immagini `.webp` o video `.mp4`, migliorando drasticamente la velocità di scaricamento e liberando la CPU dei microservizi.
3. **Routing SPA (Single Page Application)**:
   Per supportare il routing client-side (`react-router-dom`) ed evitare errori *404 Not Found* in caso di ricaricamento delle pagine, viene inserita la regola di fallback:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
4. **Performance & Compression**:
   Abilitata la compressione `gzip` al volo per file testuali (`html`, `css`, `js`, `json`, `xml`), minimizzando la banda consumata e migliorando le metriche LCP (Largest Contentful Paint).

---

## 6. Infrastruttura DevOps & Pipeline CI/CD (GitHub Actions)

Il ciclo di rilascio del software è interamente automatizzato tramite **GitHub Actions** nel workflow configurato in [.github/workflows/ci.yml](file:///.github/workflows/ci.yml).

```
[Sviluppatore] -> Push su GitHub -> [Trigger Pipeline]
                                          |
                                          v
                              +-----------+-----------+
                              |    CI: Verifica       |
                              |  - Install dipendenze |
                              |  - Build Frontend     |
                              |  - Build Docker Compose|
                              +-----------+-----------+
                                          |
                                 (Se OK & branch main)
                                          v
                              +-----------+-----------+
                              |    CD: Deploy         |
                              |  - SSH su VPS Aruba   |
                              |  - git pull           |
                              |  - docker compose up  |
                              |  - docker prune images|
                              +-----------------------+
```

### 6.1 Dettaglio del Processo di Continuous Integration (CI)
La CI si attiva su push o pull request verso `main` o `master` ed esegue le seguenti fasi:
* **Dependency Check**: Installa e valida le dipendenze in parallelo sia sul frontend sia sui tre microservizi backend via `npm ci`.
* **Frontend Build Integrity**: Esegue `npm run build` sul frontend per garantire che non vi siano errori sintattici o import mancanti.
* **Docker Verification**: Esegue una build pulita di prova dell'intero cluster (`docker compose build`) per assicurare che nessun file Dockerfile o compose yaml contenga definizioni errate.

### 6.2 Dettaglio del Processo di Continuous Deployment (CD)
Se la CI ha esito positivo e il commit si trova sul branch principale, viene avviato il job `deploy`:
1. **Connessione Sicura SSH**: Utilizzando `appleboy/ssh-action@v1.0.3` con chiavi cifrate private caricate nei GitHub Secrets.
2. **Aggiornamento del Codice**: Si posiziona nella directory del progetto sulla VPS Aruba ed effettua il `git pull` degli ultimi sorgenti.
3. **Ricostruzione Container**: Lancia il comando `docker compose up -d --build` per aggiornare solo i servizi modificati senza interrompere l'esecuzione generale.
4. **Garbage Collection di Docker**: Rimuove le immagini orfane vecchie (`docker image prune -f`) per prevenire la saturazione del disco della VPS.

---

## 7. Comandistica e Script di Automazione

Il `package.json` della cartella radice è stato configurato per fungere da pannello di controllo dello sviluppo (DevOps CLI locale):

```json
"scripts": {
  "dev:frontend": "npm run dev --prefix frontend",
  "dev:backend:photo": "npm run dev --prefix backend/photo-service",
  "dev:backend:video": "npm run dev --prefix backend/video-service",
  "dev:backend:auth": "npm run dev --prefix backend/auth-service",
  "docker:up": "docker compose up --build",
  "docker:down": "docker compose down",
  "docker:clean": "docker compose down -v"
}
```

### Comandi d'uso frequente:
* **Avvio rapido dello stack containerizzato**:
  `npm run docker:up`
* **Spegnimento con rilascio delle risorse**:
  `npm run docker:down`
* **Reset profondo del database e dei volumi di upload**:
  `npm run docker:clean` *(Causando l'eliminazione dei volumi Docker, forza MySQL ad eseguire nuovamente lo seeding dei dati demo presenti in `docker/mysql/init/`)*.
* **Avvio del frontend in locale**:
  `npm run dev:frontend`
* **Avvio dei microservizi singolarmente in locale con hot-reload attivo**:
  `npm run dev:backend:auth` / `npm run dev:backend:photo` / `npm run dev:backend:video`

---

## 8. Strategia per l'Evoluzione del Software

In un contesto accademico o professionale di **Evoluzione del Software**, il sistema as-is presenta una base eccellente, ma si presta a importanti evoluzioni architetturali per aumentarne la scalabilità, la tolleranza ai guasti e la manutenibilità:

```
               [Architettura As-Is]                   [Evoluzione Target]
          +-----------------------------+       +-----------------------------+
          | - DB MySQL unico           |       | - Istanze DB Cloud separate |
          | - Volume Docker locale      | ----> | - Object Storage (S3)       |
          | - Migrazioni hardcoded js   |       | - Strumenti dedicati (Prisma)|
          | - Gateway Nginx statico     |       | - API Gateway (Kong/APISIX) |
          +-----------------------------+       +-----------------------------+
```

### 8.1 Evoluzione dello Storage: Migrazione a Object Storage
* **Problema attuale**: L'uso del volume locale `media-uploads` vincola i microservizi ad essere eseguiti sullo stesso server fisico del gateway. Questo impedisce di scalare orizzontalmente i microservizi su più istanze o nodi cloud differenti.
* **Soluzione evolutiva**: Sostituire Multer DiskStorage con un adattatore S3 o Cloud Storage (es. AWS S3, Google Cloud Storage, MinIO). I microservizi caricano i file direttamente su cloud e registrano nel database solo l'URL pubblico assoluto. Nginx viene sollevato dal compito di servire la cartella locale `/uploads/`.

### 8.2 Evoluzione del Database: Disaccoppiamento Fisico e Gestione Migrazioni
* **Problema attuale**: Sebbene logicamente divisi in tre schemi, i database condividono la stessa istanza fisica di MySQL. Inoltre, le migrazioni del database sono scritte come query "hardcoded" all'avvio del server Express.
* **Soluzione evolutiva**: 
  * Assegnare a ciascun microservizio un'istanza fisica o cloud separata (es. istanze AWS RDS separate).
  * Introdurre uno strumento di migrazione dello schema standardizzato come **Prisma Migrations** o **Liquibase** integrato nelle pipeline di CI/CD, eliminando la logica di migrazione personalizzata dal codice dei server.

### 8.3 Gestione della Configurazione e Sicurezza Avanzata
* **Problema attuale**: I segreti (come `JWT_SECRET`, password del DB) sono dichiarati nel file `.env` ed esposti come variabili d'ambiente nel server.
* **Soluzione evolutiva**: Integrare un server di gestione dei segreti come **HashiCorp Vault** o servizi cloud equivalenti. All'avvio del container, il servizio interroga il Vault tramite API protette per ottenere temporaneamente le chiavi di sessione, eliminando la necessità di file `.env` fisici.

### 8.4 Evoluzione DevOps: Test Automatici & Container Registry (CD Avanzato)
* **Problema attuale**: Mancano i test automatici nella CI e la build avviene direttamente sul server di produzione VPS, consumando risorse CPU e RAM preziose.
* **Soluzione evolutiva**:
  1. **Aggiunta test**: Integrare framework come `Vitest` per il frontend e `SuperTest` + `Mocha` per il backend. Aggiornare `.github/workflows/ci.yml` per arrestare la CI in caso di fallimento dei test.
  2. **Pipeline CD con Container Registry**: Modificare la pipeline di deploy per compilare le immagini Docker internamente alle GitHub Actions e caricarle in un registro privato (GitHub Packages o Docker Hub). La VPS Aruba dovrà solo eseguire `docker pull` delle immagini pre-buildate e riavviare lo stack, riducendo a zero il tempo di compilazione locale e il carico sulla VPS.
