#!/bin/bash
# Idempotent first-time setup for /srv/projects/liatch/ on hertznet.
# Run with: sudo bash infra/setup-hertznet.sh
# Creates docker-compose.yml and a .env with freshly generated secrets.
# Re-running is safe — existing .env is preserved.

set -euo pipefail

if [ "$EUID" -ne 0 ]; then
    echo "Run with: sudo bash $0" >&2
    exit 1
fi

install -d -o deploy -g deploy /srv/projects/liatch
cd /srv/projects/liatch

cat > docker-compose.yml <<'YAML'
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: liatch
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: liatch
    volumes:
      - liatch_db:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U liatch -d liatch"]
      interval: 5s
      timeout: 5s
      retries: 10

  web:
    container_name: liatch-web
    image: ghcr.io/patriktjaderqvist/liatch:latest
    restart: unless-stopped
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    networks:
      - default
      - web

volumes:
  liatch_db:

networks:
  web:
    external: true
YAML
chown deploy:deploy docker-compose.yml

if [ ! -f .env ]; then
    PG_PW=$(openssl rand -base64 32 | tr -d '=+/' | head -c 32)
    SECRET_KEY=$(openssl rand -hex 32)
    cat > .env <<ENV
POSTGRES_PASSWORD=$PG_PW
DB_URL=postgresql+psycopg2://liatch:$PG_PW@db:5432/liatch
SECRET_KEY=$SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Run the upsert-style seed on every start so the demo dataset stays present
# even after a fresh volume. Flip to 0 once the site has real users.
SEED_ON_START=1

# Optional AI recommendations via Groq
# GROQ_API_KEY=
# GROQ_MODEL=llama-3.1-8b-instant
ENV
    chown deploy:deploy .env
    chmod 600 .env
    echo ".env created with fresh POSTGRES_PASSWORD and SECRET_KEY"
else
    echo ".env already exists - skipping"
fi

if ! docker network ls --format '{{.Name}}' | grep -qx web; then
    echo "External 'web' network missing - create it before starting:"
    echo "  docker network create web"
fi

echo
echo "Done. Next steps:"
echo "  1. Ensure Caddy is on the 'web' network and add a liatch.com block:"
echo "       liatch.com, www.liatch.com {"
echo "           reverse_proxy liatch-web:8000"
echo "       }"
echo "  2. Push to GitHub (workflow builds + pulls the image automatically),"
echo "     or pull manually for the first time:"
echo "       cd /srv/projects/liatch && docker compose pull && docker compose up -d"
