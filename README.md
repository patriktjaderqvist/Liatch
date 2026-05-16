# Liatch – Praktikportal för studenter

Liatch är en webbapplikation där studenter kan hitta, söka och hantera praktikplatser (LIA), och där företag kan publicera och administrera sina praktikannonser.

Projektet utvecklas som en del av kursen **Webbramverk**, med fokus på modern fullstack-utveckling i React och FastAPI.

---

## Syfte & mål

Syftet med Liatch är att:
- förenkla processen för studenter att hitta relevant praktik
- ge företag ett strukturerat sätt att nå studenter
- fungera som ett realistiskt, portfolio-projekt

Projektet är byggt för att uppfylla kursens krav på:
- Full CRUD-funktionalitet
- React-baserad frontend
- FastAPI-baserad backend
- Tydlig commit-historik och agilt arbetssätt

---

## Användarroller

### Student
- Skapa och uppdatera profil
- Bläddra bland praktikannonser
- Ansöka till praktikplatser
- Spara intressanta annonser

### Företag
- Skapa konto
- Skapa, uppdatera och ta bort praktikannonser
- Se inkomna ansökningar
- Enkel kontakt

## Skola (Eventuellt)

---

## Tech Stack

**Frontend**
- React
- Tailwind CSS

**Backend**
- FastAPI
- SQLAlchemy
- Pydantic
- JWT-baserad autentisering(ändrad till bcrypt enligt lektioner)

**Databas**
- PostgreSQL

---

## Funktionalitet (MVP)

- CRUD för användare
- CRUD för praktikannonser
- Skapa och visa ansökningar
- Autentisering
- Dynamisk frontend kopplad till backend-API

---

## Planerad vidareutveckling

Exempel på funktionalitet som planeras att utforskas:
- Asynkron e-post vid ansökan
- Pagination och filtrering av annonser
- Deployment av frontend och backend
- Enklare rekommendationslogik

---

## Arbetsprocess

Projektet utvecklas agilt med:
- Små, frekventa commits
- Veckovis planering och uppföljning
- Brainstorming och strukturering via Miro

---

## Setup (lokalt)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Optional (AI recommendations)
# add to backend/.env
# GROQ_API_KEY=...
# GROQ_MODEL=llama-3.1-8b-instant

# Database migrations (Alembic)
cd backend

# Create a new migration from model changes
venv/bin/alembic revision --autogenerate -m "describe_change"

# Apply latest migrations
venv/bin/alembic upgrade head

# Existing local DB that already has tables:
# mark it as baseline without re-running initial create-table migration
venv/bin/alembic stamp head

# Seed dummy data (idempotent)
venv/bin/python -m app.seed

# Frontend
cd frontend
npm install
npm run dev

# Optional: point frontend auth API to another backend URL
# VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

## Deploy med Docker (hertznet, liatch.com)

Den containeriserade vägen används för liatch.com och bygger om sig själv via
GitHub Actions varje gång du pushar till `main` eller `dev`:

1. Workflowen i `.github/workflows/deploy.yml` bygger en multi-stage image
   (Node bygger frontend → Python serverar både `/api/v1/...` och den
   byggda Vite-bundeln) och pushar till `ghcr.io/patriktjaderqvist/liatch`.
2. SSH-steget loggar in på hertznet (`46.62.204.181`), pullar imagen och
   kör `docker compose up -d` mot `/srv/projects/liatch/docker-compose.yml`.

För att förbereda servern första gången:

```bash
ssh deploy@46.62.204.181
sudo mkdir -p /srv/projects/liatch
sudo chown deploy:deploy /srv/projects/liatch
cd /srv/projects/liatch

# Kopiera infra/server-compose.example.yml som docker-compose.yml
# Kopiera infra/server.env.example som .env och fyll i värden
# Lägg till en liatch.com-block i Caddyfile som proxy_pass:ar till
#   app-containern på det interna nätverket
```

Workflowen behöver dessa repo-secrets:
- `SSH_HOST` – `46.62.204.181`
- `SSH_USER` – `deploy`
- `SSH_PRIVATE_KEY` – privata nyckeln vars publika motsvarighet ligger i
  `deploy`-användarens `authorized_keys`

## Deploy på EC2 (24/7-miljö)

Använd deploy-scriptet i projektroten för att:
- hämta senaste kod
- installera dependencies
- köra Alembic-migrationer
- bygga frontend
- synka till Nginx web root
- restarta backend-service + reloada nginx
- köra health checks

```bash
cd ~/liatch
./deploy.sh
```

Om backend-service heter något annat än `backend`:

```bash
cd ~/liatch
BACKEND_SERVICE=ditt-service-namn ./deploy.sh
```

För att även fylla på dummydata vid deploy:

```bash
cd ~/liatch
RUN_SEED=1 ./deploy.sh
```

Om du redan har pullat manuellt och bara vill köra build/migration/restart:

```bash
cd ~/liatch
PULL_LATEST=0 ./deploy.sh
```

Om du kör scriptet i en miljö utan `systemctl` (t.ex. lokal Mac), hoppa över service-steg:

```bash
cd ~/liatch
PULL_LATEST=0 RESTART_SERVICES=0 RUN_HEALTHCHECKS=0 ./deploy.sh
```

Tips: hitta service-namn med:

```bash
systemctl list-unit-files --type=service | grep -Ei 'liatch|uvicorn|fastapi|backend'
```

Status
Projektet är under aktiv utveckling.
README och funktionalitet uppdateras löpande.

# Team
Patrik
Jesper
