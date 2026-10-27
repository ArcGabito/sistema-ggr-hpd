#!/usr/bin/env bash
# Instalación remota: clona el repositorio, crea el .env, instala dependencias y levanta el proyecto.
#
#   curl -fsSL https://raw.githubusercontent.com/ArcGabito/sistema-ggr-hpd/master/scripts/setup.sh | bash
#
# Variables opcionales:
#   REPO_URL    (por defecto https://github.com/ArcGabito/sistema-ggr-hpd.git)
#   BRANCH      (por defecto master)
#   TARGET_DIR  (por defecto ./sistema-ggr-hpd)
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ArcGabito/sistema-ggr-hpd.git}"
BRANCH="${BRANCH:-master}"
TARGET_DIR="${TARGET_DIR:-$PWD/sistema-ggr-hpd}"

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

random_string() {
  local length="$1"
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 $((length * 2)) | tr -dc 'A-Za-z0-9' | head -c "$length"
  else
    LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c "$length"
  fi
}

for cmd in git docker curl; do
  command -v "$cmd" >/dev/null 2>&1 || fail "Falta '$cmd'. Instálalo y vuelve a ejecutar el script."
done
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 no está disponible."

if [[ -d "$TARGET_DIR/.git" ]]; then
  info "El repositorio ya existe en $TARGET_DIR; actualizando rama $BRANCH..."
  git -C "$TARGET_DIR" fetch origin "$BRANCH"
  git -C "$TARGET_DIR" checkout "$BRANCH"
  git -C "$TARGET_DIR" pull --ff-only origin "$BRANCH"
else
  info "Clonando $REPO_URL en $TARGET_DIR..."
  git clone --branch "$BRANCH" "$REPO_URL" "$TARGET_DIR"
fi

cd "$TARGET_DIR"

if [[ -s .env ]]; then
  info ".env ya existe; se conserva."
else
  info "Creando .env desde .env.example con secretos aleatorios..."
  cp .env.example .env
  sed -i.bak \
    -e "s|^DB_SA_PASSWORD=.*|DB_SA_PASSWORD=Hpd_$(random_string 20)9a|" \
    -e "s|^JWT_KEY=.*|JWT_KEY=$(random_string 64)|" \
    -e "s|^SEED_ADMIN_PASSWORD=.*|SEED_ADMIN_PASSWORD=Hpd_$(random_string 12)1!|" \
    .env
  rm -f .env.bak
  chmod 600 .env
fi

chmod +x scripts/*.sh
info "Instalando dependencias y levantando contenedores..."
./scripts/run.sh

info "Proyecto listo en $TARGET_DIR"
grep -E '^SEED_ADMIN_(EMAIL|PASSWORD)=' .env | sed 's/^/    /'
