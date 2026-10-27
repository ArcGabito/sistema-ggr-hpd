#!/usr/bin/env bash
# Instalación remota: clona (o actualiza) el repositorio, crea el .env, instala dependencias
# y levanta el proyecto. Es autónomo (no invoca otros scripts) e idempotente.
#
#   curl -fsSL https://raw.githubusercontent.com/ArcGabito/sistema-ggr-hpd/master/scripts/setup.sh | bash
#
# Variables opcionales:
#   REPO_URL    (por defecto https://github.com/ArcGabito/sistema-ggr-hpd.git)
#   BRANCH      (por defecto master)
#   TARGET_DIR  (por defecto el repo actual si ya estás dentro de él, si no ./sistema-ggr-hpd)
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ArcGabito/sistema-ggr-hpd.git}"
BRANCH="${BRANCH:-master}"
DB_VOLUME="sistema-ggr-hpd-database-data"

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

# Valor aleatorio para las variables secretas; falla para el resto.
secret_for() {
  case "$1" in
    DB_SA_PASSWORD) printf 'Hpd_%s9a' "$(random_string 20)" ;;
    JWT_KEY) random_string 64 ;;
    SEED_ADMIN_PASSWORD) printf 'Hpd_%s1!' "$(random_string 12)" ;;
    *) return 1 ;;
  esac
}

# Crea .env si no existe; si existe, solo agrega las variables nuevas de .env.example.
sync_env() {
  local env_file="$1/.env" env_example="$1/.env.example" line key value added=0
  [[ -f "$env_example" ]] || fail "No se encontró $env_example"

  if [[ ! -s "$env_file" ]]; then
    if docker volume inspect "$DB_VOLUME" >/dev/null 2>&1; then
      fail "Existe el volumen $DB_VOLUME de una instalación anterior pero no hay .env: la contraseña de SQL Server no coincidiría. Copia el .env anterior o elimina el volumen con: docker volume rm $DB_VOLUME"
    fi
    info "Creando .env desde .env.example con secretos aleatorios..."
    cp "$env_example" "$env_file"
    for key in DB_SA_PASSWORD JWT_KEY SEED_ADMIN_PASSWORD; do
      value="$(secret_for "$key")"
      sed -i.bak "s|^${key}=.*|${key}=${value}|" "$env_file"
    done
    rm -f "$env_file.bak"
  else
    while IFS= read -r line || [[ -n "$line" ]]; do
      [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)= ]] || continue
      key="${BASH_REMATCH[1]}"
      grep -q "^${key}=" "$env_file" && continue
      value="$(secret_for "$key")" && line="${key}=${value}"
      printf '%s\n' "$line" >>"$env_file"
      added=$((added + 1))
    done <"$env_example"
    if ((added > 0)); then info "Se agregaron $added variable(s) nuevas a .env"; else info ".env existente conservado."; fi
  fi
  chmod 600 "$env_file"
}

env_value() { grep -E "^$2=" "$1/.env" | tail -n1 | cut -d= -f2-; }

# Comando para instalar ASP.NET Core 10 según el gestor de paquetes disponible.
aspnet_install_hint() {
  if command -v pacman >/dev/null 2>&1; then echo "sudo pacman -S aspnet-runtime aspnet-targeting-pack"
  elif command -v apt-get >/dev/null 2>&1; then echo "sudo apt-get install aspnetcore-runtime-10.0"
  elif command -v dnf >/dev/null 2>&1; then echo "sudo dnf install aspnetcore-runtime-10.0 aspnetcore-targeting-pack-10.0"
  else echo "https://dotnet.microsoft.com/download/dotnet/10.0"; fi
}

# El SDK necesita el runtime y el targeting pack de ASP.NET Core 10; algunas distros los empaquetan aparte.
has_aspnet_sdk() {
  local runtimes sdk_root
  runtimes="$(dotnet --list-runtimes 2>/dev/null || true)"
  sdk_root="$(dotnet --list-sdks 2>/dev/null | sed -n 's/.*\[\(.*\)\/sdk\]$/\1/p' || true)"
  sdk_root="${sdk_root%%$'\n'*}"
  [[ "$runtimes" == *"Microsoft.AspNetCore.App 10."* && -n "$sdk_root" ]] &&
    compgen -G "$sdk_root/packs/Microsoft.AspNetCore.App.Ref/10.*" >/dev/null
}

restore_server() {
  local server_dir="$1" output
  if ! command -v dotnet >/dev/null 2>&1; then
    warn ".NET SDK no está instalado: se omite la restauración local (Docker la realiza igual)."
    return
  fi
  if ! has_aspnet_sdk; then
    warn "El SDK local no incluye ASP.NET Core 10: se omite dotnet restore (Docker compila con su propio SDK)."
    warn "Para compilar fuera de Docker instala: $(aspnet_install_hint)"
    return
  fi
  info "Restaurando dependencias del servidor (core/server)..."
  if ! output="$(cd "$server_dir" && dotnet restore --verbosity quiet 2>&1)"; then
    printf '%s\n' "$output" >&2
    warn "dotnet restore falló localmente; la imagen Docker usa su propio SDK."
  fi
}

for cmd in git docker curl; do
  command -v "$cmd" >/dev/null 2>&1 || fail "Falta '$cmd'. Instálalo y vuelve a ejecutar el script."
done
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 no está disponible."
docker info >/dev/null 2>&1 || fail "El daemon de Docker no está corriendo."

# Si se ejecuta dentro de un clon existente, se reutiliza en lugar de clonar otro anidado.
if [[ -z "${TARGET_DIR:-}" ]] && top="$(git rev-parse --show-toplevel 2>/dev/null)" &&
  git -C "$top" remote get-url origin 2>/dev/null | grep -q 'sistema-ggr-hpd'; then
  TARGET_DIR="$top"
fi
TARGET_DIR="${TARGET_DIR:-$PWD/sistema-ggr-hpd}"

# ---------- 1. Código ----------
if [[ -d "$TARGET_DIR/.git" ]]; then
  info "Repositorio existente en $TARGET_DIR; actualizando $BRANCH..."
  git -C "$TARGET_DIR" fetch --quiet origin "$BRANCH"
  [[ "$(git -C "$TARGET_DIR" rev-parse --abbrev-ref HEAD)" == "$BRANCH" ]] || git -C "$TARGET_DIR" checkout "$BRANCH"
  git -C "$TARGET_DIR" merge --ff-only "origin/$BRANCH" ||
    warn "No se pudo avanzar $BRANCH automáticamente (cambios locales o historial divergente); se usa el código actual."
elif [[ -e "$TARGET_DIR" && -n "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]]; then
  fail "$TARGET_DIR existe y no es un repositorio git. Usa TARGET_DIR=<otra ruta>."
else
  info "Clonando $REPO_URL en $TARGET_DIR..."
  git clone --branch "$BRANCH" "$REPO_URL" "$TARGET_DIR"
fi

cd "$TARGET_DIR"
chmod +x scripts/*.sh

# ---------- 2. Variables de entorno ----------
sync_env "$TARGET_DIR"

# ---------- 3. Dependencias ----------
if command -v npm >/dev/null 2>&1; then
  if [[ -f core/client/node_modules/.package-lock.json && ! core/client/package-lock.json -nt core/client/node_modules/.package-lock.json ]]; then
    info "Dependencias del cliente al día."
  else
    info "Instalando dependencias del cliente (core/client)..."
    (cd core/client && npm ci --no-audit --no-fund)
  fi
else
  warn "npm no está instalado: se omiten dependencias locales del cliente (Docker las instala igual)."
fi

restore_server "$TARGET_DIR/core/server"

# ---------- 4. Contenedores ----------
COMPOSE=(docker compose --env-file "$TARGET_DIR/.env" -f "$TARGET_DIR/docker/docker-compose.yml")
info "Construyendo imágenes y levantando contenedores..."
"${COMPOSE[@]}" up -d --build --remove-orphans

SERVER_PORT="$(env_value "$TARGET_DIR" SERVER_PORT)"
CLIENT_PORT="$(env_value "$TARGET_DIR" CLIENT_PORT)"
info "Esperando a que la API responda (migraciones y datos iniciales)..."
ready=false
for _ in $(seq 1 60); do
  if curl -fsS "http://localhost:${SERVER_PORT:-5040}/health" >/dev/null 2>&1; then ready=true; break; fi
  sleep 3
done
if ! $ready; then
  "${COMPOSE[@]}" logs --tail 40 server >&2 || true
  fail "La API no respondió tras 3 minutos."
fi

"${COMPOSE[@]}" ps
cat <<INFO

  Proyecto listo en $TARGET_DIR

  Sitio web     http://localhost:${CLIENT_PORT:-3000}
  Ingresar      http://localhost:${CLIENT_PORT:-3000}/ingresar
  API           http://localhost:${SERVER_PORT:-5040}

  Admin inicial $(env_value "$TARGET_DIR" SEED_ADMIN_EMAIL)
  Contraseña    definida en $TARGET_DIR/.env (SEED_ADMIN_PASSWORD)
INFO
