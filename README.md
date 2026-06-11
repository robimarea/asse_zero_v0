# ASSE ZERO — Web Platform

Piattaforma web per la vetrina del portfolio cinematografico di Gerardo Romani, basata su architettura a microservizi.

---

## 💻 Requisiti di Sistema

Assicurati di avere installato sul tuo sistema:
- **Node.js** (v20+ consigliato) ed **npm**
- **Docker** e **Docker Compose**
- **Git**

---

## 🐳 Setup & Run Rapido (Docker Compose)

Il metodo consigliato per avviare l'intero ecosistema è l'uso di **Docker Compose**, che configura automaticamente il database MySQL, i microservizi, il gateway Nginx e la Single Page Application (SPA) in React.

### 1. Configurazione del file `.env`
Copia il file delle variabili d'ambiente di esempio nella radice del progetto:
```bash
cp .env.example .env
```
Apri il file `.env` e imposta le tue variabili (specialmente le password e i segreti). Per generare chiavi robuste, puoi usare:
```bash
# Genera JWT_SECRET (min. 64 caratteri)
openssl rand -base64 64

# Genera password per MySQL e admin/editor
openssl rand -base64 32
```

### 2. Avvio dello stack
Per avviare l'applicazione in background e compilare le immagini:
```bash
docker compose up --build -d
```

Una volta avviato, l'applicazione sarà accessibile all'indirizzo:
👉 **http://localhost:8080**

### 3. Arrestare i servizi
Per spegnere i container senza perdere i dati (i volumi MySQL e uploads rimangono persistiti):
```bash
docker compose down
```

### 4. Reset completo del database e dei caricamenti (ATTENZIONE: cancella tutti i dati)
Per spegnere lo stack e cancellare tutti i volumi persistenti:
```bash
docker compose down -v
```

---

## 🛠️ Sviluppo Locale (Senza Docker)

Se preferisci eseguire i servizi singolarmente sul tuo computer per scopi di sviluppo:

### 1. Avviare il Database MySQL locale
Puoi avviare solo il database tramite Docker:
```bash
docker compose up -d mysql
```

### 2. Avviare i Microservizi Backend
Per ciascuno dei microservizi sotto `backend/` (`auth-service`, `photo-service`, `video-service`):
```bash
cd backend/<nome-servizio>
npm install
npm run dev
```

### 3. Avviare il Frontend React
Nella cartella `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
Il server di sviluppo locale sarà disponibile su **http://localhost:5173** (che instrada automaticamente le API tramite proxy a localhost).

---

## 📡 Mappa delle Porte ed Endpoint

Quando lo stack è attivo tramite Docker Compose, i servizi rispondono alle seguenti porte:

* **Gateway Nginx (SPA + API Routing)**: http://localhost:8080 (Porta esposta al pubblico)
* **`auth-service`**: http://localhost:4003 (interna `/api/auth`)
* **`photo-service`**: http://localhost:4001 (interna `/api/photos`)
* **`video-service`**: http://localhost:4002 (interna `/api/videos`)
* **Database MySQL**: localhost:3306 (interna ai container)

---

## 📖 Dettagli Architetturali e Sicurezza

Tutte le analisi di dettaglio del software, le scelte tecnologiche, lo schema del database MySQL, l'autenticazione stateless, la pipeline CI/CD (GitHub Actions), il rate limiting, l'ottimizzazione automatica dei media (WebP/MP4) e i limiti di quota di upload sono documentati approfonditamente nel file:

👉 [**CASE_OF_STUDY.md**](file:///home/tomas/Desktop/Uni/asse_zero_v0/CASE_OF_STUDY.md)
