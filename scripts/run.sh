#!/usr/bin/env bash
# Instala dependencias, construye las imágenes y levanta los contenedores.
# Es autónomo (no invoca otros scripts) e idempotente: puede ejecutarse varias veces.
# Uso: ./scripts/run.sh [--skip-install]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker/docker-compose.yml"
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE="$ROOT_DIR/.env.example"
DB_VOLUME="sistema-ggr-hpd-database-data"
SKIP_INSTALL=false

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[!]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

for arg in "$@"; do
  case "$arg" in
    --skip-install) SKIP_INSTALL=true ;;
    -h | --help) sed -n '2,4p' "$0"; exit 0 ;;
    *) fail "Opción desconocida: $arg" ;;
  esac
done

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
# Nunca reemplaza valores existentes, así los secretos se mantienen entre ejecuciones.
sync_env() {
  local line key value added=0
  [[ -f "$ENV_EXAMPLE" ]] || fail "No se encontró $ENV_EXAMPLE"

  if [[ ! -s "$ENV_FILE" ]]; then
    if docker volume inspect "$DB_VOLUME" >/dev/null 2>&1; then
      fail "Existe el volumen $DB_VOLUME pero no hay .env: la contraseña de SQL Server no coincidiría. Restaura tu .env o ejecuta ./scripts/clear.sh -y"
    fi
    info "Creando .env desde .env.example con secretos aleatorios..."
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    for key in DB_SA_PASSWORD JWT_KEY SEED_ADMIN_PASSWORD; do
      value="$(secret_for "$key")"
      sed -i.bak "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    done
    rm -f "$ENV_FILE.bak"
  else
    while IFS= read -r line || [[ -n "$line" ]]; do
      [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)= ]] || continue
      key="${BASH_REMATCH[1]}"
      grep -q "^${key}=" "$ENV_FILE" && continue
      value="$(secret_for "$key")" && line="${key}=${value}"
      printf '%s\n' "$line" >>"$ENV_FILE"
      added=$((added + 1))
    done <"$ENV_EXAMPLE"
    if ((added > 0)); then info "Se agregaron $added variable(s) nuevas a .env"; else info ".env al día."; fi
  fi
  chmod 600 "$ENV_FILE"
}

env_value() { grep -E "^$1=" "$ENV_FILE" | tail -n1 | cut -d= -f2-; }

install_dependencies() {
  local client_dir="$ROOT_DIR/core/client"
  if command -v npm >/dev/null 2>&1; then
    # npm deja una copia del lockfile en node_modules: si no cambió, no hace falta reinstalar.
    if [[ -f "$client_dir/node_modules/.package-lock.json" && ! "$client_dir/package-lock.json" -nt "$client_dir/node_modules/.package-lock.json" ]]; then
      info "Dependencias del cliente al día."
    else
      info "Instalando dependencias del cliente (core/client)..."
      (cd "$client_dir" && npm ci --no-audit --no-fund)
    fi
  else
    warn "npm no está instalado: se omiten dependencias locales del cliente (Docker las instala igual)."
  fi

  restore_server "$ROOT_DIR/core/server"
}

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

wait_for_api() {
  local url="$1"
  info "Esperando a que la API responda (migraciones y datos iniciales)..."
  for _ in $(seq 1 60); do
    curl -fsS "$url" >/dev/null 2>&1 && return 0
    sleep 3
  done
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail 40 server >&2 || true
  fail "La API no respondió en $url tras 3 minutos."
}

for cmd in docker curl; do
  command -v "$cmd" >/dev/null 2>&1 || fail "Falta '$cmd'. Instálalo y vuelve a ejecutar el script."
done
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 no está disponible."
docker info >/dev/null 2>&1 || fail "El daemon de Docker no está corriendo."

sync_env
$SKIP_INSTALL || install_dependencies

info "Construyendo imágenes y levantando contenedores..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build --remove-orphans

CLIENT_PORT="$(env_value CLIENT_PORT)"
SERVER_PORT="$(env_value SERVER_PORT)"
DATABASE_PORT="$(env_value DATABASE_PORT)"
SEED_ADMIN_EMAIL="$(env_value SEED_ADMIN_EMAIL)"

wait_for_api "http://localhost:${SERVER_PORT:-5040}/health"
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
