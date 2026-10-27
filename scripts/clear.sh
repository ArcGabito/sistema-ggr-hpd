#!/usr/bin/env bash
# Elimina contenedores, imágenes y volúmenes del proyecto (incluye la base de datos).
# Es autónomo (no invoca otros scripts) e idempotente: si no queda nada que borrar, termina sin error.
# Uso: ./scripts/clear.sh [-y]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker/docker-compose.yml"
PROJECT="sistema-ggr-hpd"
DB_VOLUME="sistema-ggr-hpd-database-data"
IMAGES=("sistema-ggr-hpd/server:latest" "sistema-ggr-hpd/client:latest")
ASSUME_YES=false

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

for arg in "$@"; do
  case "$arg" in
    -y | --yes) ASSUME_YES=true ;;
    -h | --help) sed -n '2,4p' "$0"; exit 0 ;;
    *) fail "Opción desconocida: $arg" ;;
  esac
done

command -v docker >/dev/null 2>&1 || fail "Docker no está instalado."
docker info >/dev/null 2>&1 || fail "El daemon de Docker no está corriendo."

if ! $ASSUME_YES; then
  [[ -t 0 ]] || fail "Sin terminal interactiva: usa ./scripts/clear.sh -y para confirmar."
  read -r -p "Esto eliminará contenedores, imágenes y la base de datos del proyecto. ¿Continuar? [s/N] " answer
  [[ "$answer" =~ ^[sSyY]$ ]] || { echo "Cancelado."; exit 0; }
fi

# compose solo necesita las variables para interpolar el archivo, no valores reales.
ENV_FILE="$ROOT_DIR/.env"
[[ -s "$ENV_FILE" ]] || ENV_FILE="$ROOT_DIR/.env.example"

info "Deteniendo y eliminando contenedores, imágenes y volúmenes..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down --volumes --rmi all --remove-orphans

# Restos que pudieran quedar si el compose cambió o se borró a mano.
leftover_containers="$(docker ps -aq --filter "label=com.docker.compose.project=$PROJECT")"
[[ -z "$leftover_containers" ]] || docker rm -f $leftover_containers >/dev/null
docker volume rm "$DB_VOLUME" >/dev/null 2>&1 || true
for image in "${IMAGES[@]}"; do
  docker image rm "$image" >/dev/null 2>&1 || true
done
docker image prune --force --filter "label=com.docker.compose.project=$PROJECT" >/dev/null || true

info "Listo. El entorno Docker del proyecto quedó limpio."
