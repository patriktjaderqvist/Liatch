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
- JWT-baserad autentisering

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

## Setup (kommer uppdateras)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
Status
Projektet är under aktiv utveckling.
README och funktionalitet uppdateras löpande.

👥 Team
Patrik
Jesper