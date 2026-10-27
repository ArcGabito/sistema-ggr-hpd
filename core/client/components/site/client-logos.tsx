import Image from "next/image";
import { clients } from "@/lib/site-data";
import logoSizes from "@/lib/client-logos.json";

type Client = (typeof clients)[number];

// Todos los logos ocupan aproximadamente la misma área visual: los anchos quedan más bajos y los
// compactos más altos. Así ninguno domina la fila aunque sus proporciones sean muy distintas.
const LOGO_AREA = 3200;
const MAX_WIDTH = 150;
const MAX_HEIGHT = 44;

function displaySize(client: Client) {
  const { width, height } = (logoSizes as Record<string, { width: number; height: number }>)[client.logo];
  const ratio = width / height;
  let w = Math.sqrt(LOGO_AREA * ratio);
  let h = w / ratio;
  if (w > MAX_WIDTH) [w, h] = [MAX_WIDTH, MAX_WIDTH / ratio];
  if (h > MAX_HEIGHT) [w, h] = [MAX_HEIGHT * ratio, MAX_HEIGHT];
  return { width: Math.round(w), height: Math.round(h) };
}

function Logo({ client, hidden = false, eager = false }: { client: Client; hidden?: boolean; eager?: boolean }) {
  const { width, height } = displaySize(client);
  return (
    <Image
      src={`/assets/clients/${client.logo}`}
      alt={hidden ? "" : client.name}
      width={width}
      height={height}
      style={{ width, height }}
      // En el carrusel los logos fuera del recorte no cargarían en modo lazy y aparecerían de golpe.
      loading={eager ? "eager" : "lazy"}
      className="object-contain grayscale opacity-60 transition duration-300 hover:grayscale-0 hover:opacity-100"
    />
  );
}

/** Fila de logos en desplazamiento continuo; con movimiento reducido se muestra estática. */
export function ClientMarquee() {
  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <ul className="flex w-max animate-marquee items-center gap-14 group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-8">
        {clients.map((client) => (
          <li key={client.logo} className="flex h-14 shrink-0 items-center">
            <Logo client={client} eager />
          </li>
        ))}
        {/* Copia para que el bucle no tenga saltos; se oculta a lectores de pantalla. */}
        {clients.map((client) => (
          <li key={`copy-${client.logo}`} aria-hidden className="flex h-14 shrink-0 items-center motion-reduce:hidden">
            <Logo client={client} hidden eager />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClientGrid() {
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-ink-100 sm:grid-cols-4 lg:grid-cols-8">
      {clients.map((client) => (
        <li key={client.logo} className="grid h-24 place-items-center bg-white px-4">
          <Logo client={client} />
        </li>
      ))}
    </ul>
  );
}
