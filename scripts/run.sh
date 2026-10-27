#!/usr/bin/env bash
# Instala dependencias, construye las imágenes y levanta los contenedores.
# Uso: ./scripts/run.sh [--skip-install]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker/docker-compose.yml"
ENV_FILE="$ROOT_DIR/.env"

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[!]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

random_string() {
  local length="$1"
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 $((length * 2)) | tr -dc 'A-Za-z0-9' | head -c "$length"
  else
    LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c "$length"
  fi
}

ensure_env() {
  if [[ -s "$ENV_FILE" ]] && grep -q '^JWT_KEY=' "$ENV_FILE"; then
    return
  fi
  info "Creando .env a partir de .env.example con secretos aleatorios..."
  cp "$ROOT_DIR/.env.example" "$ENV_FILE"
  sed -i.bak \
    -e "s|^DB_SA_PASSWORD=.*|DB_SA_PASSWORD=Hpd_$(random_string 20)9a|" \
    -e "s|^JWT_KEY=.*|JWT_KEY=$(random_string 64)|" \
    -e "s|^SEED_ADMIN_PASSWORD=.*|SEED_ADMIN_PASSWORD=Hpd_$(random_string 12)1!|" \
    "$ENV_FILE"
  rm -f "$ENV_FILE.bak"
}

command -v docker >/dev/null 2>&1 || fail "Docker no está instalado: https://docs.docker.com/get-docker/"
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 no está disponible."
docker info >/dev/null 2>&1 || fail "El daemon de Docker no está corriendo."

ensure_env

if [[ "${1:-}" != "--skip-install" ]]; then
  if command -v npm >/dev/null 2>&1; then
    info "Instalando dependencias del cliente (core/client)..."
    (cd "$ROOT_DIR/core/client" && npm ci --no-audit --no-fund)
  else
    warn "npm no está instalado: se omiten dependencias locales del cliente (Docker las instala igual)."
  fi

  if command -v dotnet >/dev/null 2>&1; then
    info "Restaurando dependencias del servidor (core/server)..."
    (cd "$ROOT_DIR/core/server" && dotnet restore) || warn "dotnet restore falló localmente; la imagen Docker usa su propio SDK."
  else
    warn ".NET SDK no está instalado: se omite la restauración local (Docker la realiza igual)."
  fi
fi

info "Construyendo imágenes y levantando contenedores..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build

env_value() { grep -E "^$1=" "$ENV_FILE" | tail -n1 | cut -d= -f2-; }
CLIENT_PORT="$(env_value CLIENT_PORT)"
SERVER_PORT="$(env_value SERVER_PORT)"
DATABASE_PORT="$(env_value DATABASE_PORT)"
SEED_ADMIN_EMAIL="$(env_value SEED_ADMIN_EMAIL)"

info "Esperando a que la API responda (migraciones y datos iniciales)..."
for _ in $(seq 1 60); do
  if curl -fsS "http://localhost:${SERVER_PORT:-5040}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 3
done

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

cat <<INFO

  Sitio web     http://localhost:${CLIENT_PORT:-3000}
  Ingresar      http://localhost:${CLIENT_PORT:-3000}/ingresar
  API           http://localhost:${SERVER_PORT:-5040}  (OpenAPI: /openapi/v1.json)
  SQL Server    localhost,${DATABASE_PORT:-1433}  (usuario sa)

  Admin inicial ${SEED_ADMIN_EMAIL}
  Contraseña    definida en .env (SEED_ADMIN_PASSWORD)

  Logs:         docker compose --env-file .env -f docker/docker-compose.yml logs -f
INFO
