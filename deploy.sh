#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-dev}"

BACKEND_DIR="${BACKEND_DIR:-backend}"
FRONTEND_DIR="${FRONTEND_DIR:-frontend}"
WEB_ROOT="${WEB_ROOT:-/var/www/html}"

BACKEND_SERVICE="${BACKEND_SERVICE:-backend}"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"

NPM_INSTALL_MODE="${NPM_INSTALL_MODE:-ci}" # ci | install
RUN_SEED="${RUN_SEED:-0}"                  # 1 = run seed step, 0 = skip
PULL_LATEST="${PULL_LATEST:-1}"            # 1 = git fetch/pull, 0 = skip
RESTART_SERVICES="${RESTART_SERVICES:-1}"  # 1 = restart backend/reload nginx, 0 = skip
RUN_HEALTHCHECKS="${RUN_HEALTHCHECKS:-1}"  # 1 = run curl checks, 0 = skip

BACKEND_HEALTH_URL="${BACKEND_HEALTH_URL:-http://127.0.0.1:8000/api/v1/auth/me}"
PROXY_HEALTH_URL="${PROXY_HEALTH_URL:-http://127.0.0.1/api/v1/auth/me}"

timestamp() {
  date +"%Y-%m-%d %H:%M:%S"
}

log() {
  printf "[%s] %s\n" "$(timestamp)" "$*"
}

fail() {
  printf "[%s] ERROR: %s\n" "$(timestamp)" "$*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

run_systemctl() {
  local action="$1"
  local service="$2"
  if command -v sudo >/dev/null 2>&1; then
    sudo systemctl "$action" "$service"
  else
    systemctl "$action" "$service"
  fi
}

run_rsync() {
  local src="$1"
  local dst="$2"
  if command -v sudo >/dev/null 2>&1; then
    sudo rsync -a --delete "$src" "$dst"
  else
    rsync -a --delete "$src" "$dst"
  fi
}

service_exists() {
  local service="$1"
  command -v systemctl >/dev/null 2>&1 || return 1
  systemctl list-unit-files --type=service --no-legend 2>/dev/null \
    | awk '{print $1}' \
    | grep -qx "${service}.service"
}

check_http() {
  local url="$1"
  local label="$2"
  local status_code
  status_code="$(curl -sS -o /dev/null -w "%{http_code}" "$url" || true)"

  case "$status_code" in
    200|401)
      log "${label} OK (${status_code})"
      ;;
    *)
      fail "${label} failed (${status_code}) for ${url}"
      ;;
  esac
}

need_cmd git
need_cmd curl
need_cmd npm
need_cmd rsync

if [ "$PULL_LATEST" = "1" ]; then
  if ! git diff --quiet || ! git diff --cached --quiet; then
    fail "Working tree has local changes. Commit or stash before deploy."
  fi

  if [ -n "$(git ls-files --others --exclude-standard)" ]; then
    log "Warning: untracked files detected. Deploy continues, but pull can still fail on name conflicts."
  fi

  log "Updating code from ${REMOTE}/${BRANCH}"
  git fetch "$REMOTE" "$BRANCH"
  if git show-ref --quiet "refs/heads/${BRANCH}"; then
    git checkout "$BRANCH"
  else
    git checkout -b "$BRANCH" "${REMOTE}/${BRANCH}"
  fi
  git pull --ff-only "$REMOTE" "$BRANCH"
else
  log "Skipping git pull step (PULL_LATEST=0)"
fi

if [ ! -x "${BACKEND_DIR}/venv/bin/python" ] \
  || [ ! -x "${BACKEND_DIR}/venv/bin/pip" ] \
  || [ ! -x "${BACKEND_DIR}/venv/bin/alembic" ]; then
  fail "Backend virtualenv tools not found in ${BACKEND_DIR}/venv. Create venv first."
fi

pushd "$BACKEND_DIR" >/dev/null
log "Installing backend dependencies"
venv/bin/pip install -r requirements.txt

log "Applying database migrations"
venv/bin/alembic upgrade head

if [ "$RUN_SEED" = "1" ]; then
  log "Seeding dummy data"
  venv/bin/python -m app.seed
fi
popd >/dev/null

log "Installing frontend dependencies (${NPM_INSTALL_MODE})"
pushd "$FRONTEND_DIR" >/dev/null
if [ "$NPM_INSTALL_MODE" = "install" ]; then
  npm install
else
  npm ci
fi

log "Building frontend"
npm run build
popd >/dev/null

log "Syncing frontend build to ${WEB_ROOT}"
run_rsync "${FRONTEND_DIR}/dist/" "${WEB_ROOT}/"

if [ "$RESTART_SERVICES" = "1" ]; then
  need_cmd systemctl

  if service_exists "$BACKEND_SERVICE"; then
    log "Restarting backend service (${BACKEND_SERVICE})"
    run_systemctl restart "$BACKEND_SERVICE"
  else
    fail "Backend service '${BACKEND_SERVICE}' not found. Set BACKEND_SERVICE to your systemd unit name."
  fi

  if service_exists "$NGINX_SERVICE"; then
    log "Reloading nginx (${NGINX_SERVICE})"
    run_systemctl reload "$NGINX_SERVICE"
  else
    fail "Nginx service '${NGINX_SERVICE}' not found."
  fi
else
  log "Skipping service restart step (RESTART_SERVICES=0)"
fi

if [ "$RUN_HEALTHCHECKS" = "1" ]; then
  log "Running health checks"
  check_http "$BACKEND_HEALTH_URL" "Backend direct health"
  check_http "$PROXY_HEALTH_URL" "Nginx proxy health"
else
  log "Skipping health checks (RUN_HEALTHCHECKS=0)"
fi

log "Deploy complete"
