#!/usr/bin/env bash
# Elimina contenedores, imágenes y volúmenes del proyecto (incluye la base de datos).
# Uso: ./scripts/clear.sh [-y]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker/docker-compose.yml"
ENV_FILE="$ROOT_DIR/.env"
[[ -f "$ENV_FILE" ]] || ENV_FILE="$ROOT_DIR/.env.example"

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }

command -v docker >/dev/null 2>&1 || { echo "Docker no está instalado." >&2; exit 1; }

if [[ "${1:-}" != "-y" ]]; then
  read -r -p "Esto eliminará contenedores, imágenes y la base de datos del proyecto. ¿Continuar? [s/N] " answer
  [[ "$answer" =~ ^[sSyY]$ ]] || { echo "Cancelado."; exit 0; }
fi

info "Deteniendo y eliminando contenedores, imágenes y volúmenes..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down --volumes --rmi all --remove-orphans

info "Limpiando imágenes intermedias sin etiqueta..."
docker image prune --force --filter "label=com.docker.compose.project=sistema-ggr-hpd" >/dev/null || true

info "Listo. El entorno Docker del proyecto quedó limpio."
