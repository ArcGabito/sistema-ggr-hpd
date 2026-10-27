# Sistema de Gestión de Guías de Remisión — HPD Glass Group S.A.C.

Sistema para emitir guías de remisión y coordinar los despachos de mercancía dentro de una sede operativa de HPD Glass Group, junto con el sitio web público de la empresa.

| Capa | Tecnología | Carpeta |
| --- | --- | --- |
| Cliente | Next.js 16, React 19, Tailwind CSS 4, Framer Motion, Lucide, React Hook Form + Zod, Sileo (toasts) | `core/client` |
| Servidor | ASP.NET Core 10 Web API, Entity Framework Core 10, JWT | `core/server` |
| Base de datos | SQL Server 2022 (desarrollo) | contenedor `database` |
| Orquestación | Docker + Docker Compose | `docker/` |

## Inicio rápido

Instalación remota (clona, crea `.env` con secretos aleatorios, instala dependencias y levanta los contenedores):

```bash
curl -fsSL https://raw.githubusercontent.com/ArcGabito/sistema-ggr-hpd/master/scripts/setup.sh | bash
```

Con el repositorio ya clonado:

```bash
./scripts/run.sh
```

| Servicio | URL |
| --- | --- |
| Sitio web | http://localhost:3000 |
| Acceso al sistema | http://localhost:3000/ingresar |
| API | http://localhost:5040 (OpenAPI en `/openapi/v1.json`) |
| SQL Server | `localhost,1433` (usuario `sa`) |

El usuario administrador inicial se toma de `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` del `.env`.

## Scripts

| Script | Qué hace |
| --- | --- |
| `scripts/setup.sh` | Clona el repositorio, crea `.env` desde `.env.example`, instala dependencias y deja el proyecto corriendo. |
| `scripts/run.sh` | Instala dependencias (`npm ci`, `dotnet restore`), construye las imágenes y arranca los contenedores. `--skip-install` omite la instalación local. |
| `scripts/clear.sh` | Elimina contenedores, imágenes y volúmenes del proyecto (incluida la base de datos). `-y` omite la confirmación. |

## Arquitectura

```
navegador ──► Next.js (core/client) ──► ASP.NET Core API (core/server) ──► SQL Server
               │  /api/auth/*   login/logout: guarda el JWT en cookie httpOnly
               │  /api/backend/* proxy autenticado: agrega Authorization: Bearer
               └  proxy.ts      protege /dashboard y redirige /ingresar si hay sesión
```

El navegador nunca maneja el token: el JWT vive en una cookie `httpOnly` y el cliente Next.js lo reenvía a la API por la red interna de Docker.

### Flujo operativo

1. **Guía de remisión** (serie `T001`): se crea como *Borrador* con destinatario, punto de partida (sede), punto de llegada, motivo de traslado y bienes.
2. **Emitir**: la guía pasa a *Emitida* y queda disponible para despacho.
3. **Despacho**: se programa con vehículo, conductor y guías emitidas de la misma sede; se valida la capacidad del vehículo.
4. **En carga → En ruta → Completado**: al salir, las guías pasan a *En tránsito*; al completar, a *Entregada*. Cancelar un despacho libera sus guías.

### Endpoints principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Autenticación (rate limit: 5/min por IP) |
| `GET` | `/api/auth/me` | Usuario actual |
| `GET` | `/api/dashboard/summary` | Indicadores de la sede |
| `GET/POST` | `/api/remission-guides` | Listado paginado / creación |
| `PATCH` | `/api/remission-guides/{id}/status` | Emitir o anular |
| `GET/POST` | `/api/dispatches` | Listado / programación |
| `PATCH` | `/api/dispatches/{id}/status` | Avanzar o cancelar |
| `GET` | `/api/clients`, `/api/sites`, `/api/products` | Catálogos |
| `GET/POST` | `/api/vehicles`, `/api/drivers` | Flota (alta: Admin/Supervisor) |
| `POST` | `/api/contact` | Formulario público de contacto |

## Desarrollo sin Docker

```bash
# Base de datos
docker compose --env-file .env -f docker/docker-compose.yml up -d database

# API (requiere .NET 10 SDK con ASP.NET Core)
cd core/server
ConnectionStrings__DefaultConnection="Server=localhost,1433;Database=HpdGgr;User Id=sa;Password=<DB_SA_PASSWORD>;TrustServerCertificate=True" \
Jwt__Key="<JWT_KEY>" SeedAdmin__Email="admin@hpdglass.com" SeedAdmin__Password="<clave>" \
dotnet run

# Cliente
cd core/client
echo "API_URL=http://localhost:5040" > .env.local
npm run dev
```

Nuevas migraciones: `dotnet ef migrations add <Nombre> -o Data/Migrations` en `core/server`. La API aplica las migraciones y siembra datos (sedes, productos, flota, clientes y administrador) al arrancar.

## CI

`.github/workflows/ci.yml` verifica en cada push/PR a `master` que el cliente pase lint, typecheck y build, que el servidor compile, y que las imágenes Docker se construyan. Un job adicional (no bloqueante) audita dependencias vulnerables de npm y NuGet.

## Licencia

[MIT](LICENSE.md)
