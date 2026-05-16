# syntax=docker/dockerfile:1.7

# --- Stage 1: build the Vite frontend ---
FROM node:20-alpine AS frontend
WORKDIR /web

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY frontend/ ./
RUN npm run build


# --- Stage 2: install Python deps ---
FROM python:3.12-slim AS backend-deps
WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt


# --- Stage 3: runtime ---
FROM python:3.12-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
 && rm -rf /var/lib/apt/lists/* \
 && useradd -m -u 1000 liatch

COPY --from=backend-deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-deps /usr/local/bin /usr/local/bin

WORKDIR /app
COPY --chown=liatch:liatch backend/app ./app
COPY --chown=liatch:liatch backend/alembic ./alembic
COPY --chown=liatch:liatch backend/alembic.ini ./alembic.ini
COPY --chown=liatch:liatch backend/main.py ./main.py

COPY --from=frontend --chown=liatch:liatch /web/dist /app/frontend_dist

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    FRONTEND_DIST=/app/frontend_dist

USER liatch
EXPOSE 8000

# Apply migrations on every start (idempotent). When SEED_ON_START=1, also
# run the seed module — seed() upserts rows so re-runs are safe. Then serve.
CMD ["sh", "-c", "alembic upgrade head && { [ \"${SEED_ON_START:-0}\" = \"1\" ] && python -m app.seed || true; } && exec uvicorn main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips=*"]
