import type { FacadeVariant } from "@/app/lib/site-data";

type Point = [number, number];
/** Proyección de una fachada: (u, v) ∈ [0,1]² → punto en pantalla. */
type Projection = (u: number, v: number) => Point;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Cara de un edificio en perspectiva de dos puntos: las aristas verticales quedan a plomo y las
 * líneas de piso convergen al punto de fuga `vp`. u = 0 es la arista cercana (esquina), u = 1 la
 * lejana; v = 0 es la base y v = 1 la coronación. Las columnas se acortan con la distancia.
 */
function perspectiveFace(cornerX: number, topY: number, bottomY: number, farX: number, vp: Point): Projection {
  const lineY = (y0: number, x: number) => y0 + ((vp[1] - y0) * (x - cornerX)) / (vp[0] - cornerX);
  // Relación de profundidad entre la arista lejana y la cercana (distancias al punto de fuga).
  const depth = Math.abs(vp[0] - cornerX) / Math.abs(vp[0] - farX);
  return (u, v) => {
    const s = (u * depth) / (1 + (depth - 1) * u);
    const x = lerp(cornerX, farX, s);
    return [x, lerp(lineY(bottomY, x), lineY(topY, x), v)];
  };
}

/** Cuadrilátero plano (inferior izq., inferior der., superior der., superior izq.) con interpolación bilineal. */
function flatFace([bl, br, tr, tl]: [Point, Point, Point, Point]): Projection {
  return (u, v) => {
    const bottom: Point = [lerp(bl[0], br[0], u), lerp(bl[1], br[1], u)];
    const top: Point = [lerp(tl[0], tr[0], u), lerp(tl[1], tr[1], u)];
    return [lerp(bottom[0], top[0], v), lerp(bottom[1], top[1], v)];
  };
}

function quad(at: Projection, u0: number, v0: number, u1: number, v1: number) {
  return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)].map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");
}

function grid(at: Projection, cols: number, rows: number, gapU = 0.08, gapV = gapU) {
  const cells: { points: string; key: string; shade: number }[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      cells.push({
        points: quad(at, (c + gapU) / cols, (r + gapV) / rows, (c + 1 - gapU) / cols, (r + 1 - gapV) / rows),
        key: `${c}-${r}`,
        shade: (c * 7 + r * 3) % 5,
      });
    }
  }
  return cells;
}

function Sky({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#9fbcd8" />
          <stop offset="0.6" stopColor="#c9d9e8" />
          <stop offset="1" stopColor="#e8eef4" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b9cfe3" />
          <stop offset="0.5" stopColor="#6f8fae" />
          <stop offset="1" stopColor="#3b5370" />
        </linearGradient>
        <linearGradient id={`${id}-dark`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c3743" />
          <stop offset="1" stopColor="#1e252d" />
        </linearGradient>
        <linearGradient id={`${id}-reflect`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#${id}-sky)`} />
    </>
  );
}

const glassShades = ["#a8c2db", "#8eadcc", "#7799bb", "#c3d5e6", "#6886a6"];

// Horizonte bajo (vista desde la calle): los puntos de fuga quedan fuera del lienzo.
const HORIZON = 600;

function Tower({ id }: { id: string }) {
  const cornerX = 215;
  const floors = 12;
  // Cara izquierda: hormigón claro con ventanas; cara derecha: muro cortina oscuro.
  const left = perspectiveFace(cornerX, 48, 560, 15, [-1100, HORIZON]);
  const right = perspectiveFace(cornerX, 48, 560, 430, [1800, HORIZON]);
  const outline = (at: Projection) => quad(at, 0, 0, 1, 1);

  return (
    <>
      <Sky id={id} />
      {/* Cara izquierda */}
      <polygon points={outline(left)} fill="#eceef0" />
      {grid(left, 4, floors, 0.14, 0.2).map((c) => (
        <polygon key={c.key} points={c.points} fill={glassShades[c.shade]} />
      ))}
      {Array.from({ length: floors + 1 }, (_, r) => (
        <polygon key={r} points={quad(left, 0, r / floors - 0.012, 1, r / floors + 0.012)} fill="#d5d9dd" />
      ))}
      {/* Cara derecha */}
      <polygon points={outline(right)} fill={`url(#${id}-dark)`} />
      {grid(right, 6, floors, 0.035, 0.06).map((c) => (
        <polygon key={c.key} points={c.points} fill={glassShades[(c.shade + 2) % 5]} opacity="0.5" />
      ))}
      <polygon points={outline(right)} fill={`url(#${id}-reflect)`} />
      {/* Parapeto de coronación */}
      <polygon points={quad(left, 0, 0.985, 1, 1)} fill="#c9ced3" />
      <polygon points={quad(right, 0, 0.985, 1, 1)} fill="#151b21" />
      {/* Arista de la esquina */}
      <polygon points={quad(right, 0, 0, 0.012, 1)} fill="#f5f6f7" opacity="0.8" />
    </>
  );
}

function Curtain({ id }: { id: string }) {
  // Una sola fachada que fuga hacia la derecha, con las verticales a plomo.
  const face = perspectiveFace(-10, -40, 540, 420, [1500, HORIZON]);
  return (
    <>
      <Sky id={id} />
      <polygon points={quad(face, 0, 0, 1, 1)} fill="#2d3946" />
      {grid(face, 6, 10, 0.04, 0.05).map((c) => (
        <polygon key={c.key} points={c.points} fill={glassShades[c.shade]} />
      ))}
      <polygon points={quad(face, 0, 0, 1, 1)} fill={`url(#${id}-reflect)`} />
    </>
  );
}


function Insulated({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} />
      <rect x="70" y="70" width="210" height="330" rx="6" fill={`url(#${id}-glass)`} opacity="0.55" />
      <rect x="120" y="110" width="210" height="330" rx="6" fill={`url(#${id}-glass)`} opacity="0.85" />
      <rect x="120" y="110" width="210" height="330" rx="6" fill="none" stroke="#26282b" strokeWidth="10" />
      <rect x="70" y="70" width="210" height="330" rx="6" fill="none" stroke="#45484e" strokeWidth="6" opacity="0.7" />
      <polygon points="140,420 300,130 320,130 160,420" fill="#ffffff" opacity="0.35" />
      <polygon points="180,420 315,175 322,190 195,420" fill="#ffffff" opacity="0.2" />
    </>
  );
}

function Window({ id }: { id: string }) {
  return (
    <>
      <rect width="400" height="500" fill="#e9edf1" />
      <Sky id={id} />
      <rect x="40" y="0" width="320" height="500" fill="#f4f5f6" />
      <rect x="80" y="70" width="240" height="340" fill="#26282b" />
      <rect x="92" y="82" width="216" height="150" fill={`url(#${id}-glass)`} />
      <polygon points="92,244 308,244 330,410 70,410" fill="#33363a" />
      <polygon points="104,256 296,256 314,398 86,398" fill={`url(#${id}-glass)`} opacity="0.9" />
      <polygon points="110,96 200,96 120,220 110,220" fill="#ffffff" opacity="0.25" />
      <rect x="60" y="410" width="280" height="14" fill="#c5cad0" />
    </>
  );
}

function Sliding({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} />
      <rect x="30" y="60" width="340" height="380" fill="#26282b" />
      <rect x="44" y="74" width="170" height="352" fill={`url(#${id}-glass)`} />
      <rect x="186" y="74" width="170" height="352" fill={`url(#${id}-glass)`} opacity="0.75" />
      <rect x="182" y="74" width="8" height="352" fill="#45484e" />
      <rect x="196" y="230" width="6" height="44" rx="3" fill="#d2d4d8" />
      <polygon points="60,420 170,90 190,90 80,420" fill="#ffffff" opacity="0.3" />
      <rect x="20" y="440" width="360" height="12" fill="#a9adb4" />
    </>
  );
}

function Panels({ id }: { id: string }) {
  const face = flatFace([[0, 500], [400, 500], [400, 0], [0, 0]]);
  const tones = ["#d2d4d8", "#a9adb4", "#86a9cc", "#e7e8ea", "#7c818a"];
  return (
    <>
      <Sky id={id} />
      <polygon points={quad(face, 0, 0, 1, 1)} fill="#f5f5f6" />
      {grid(face, 4, 6, 0.03).map((c) => (
        <polygon key={c.key} points={c.points} fill={tones[c.shade]} />
      ))}
    </>
  );
}

function Slats({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} />
      <rect x="0" y="80" width="400" height="420" fill="#33363a" />
      <rect x="0" y="80" width="400" height="420" fill={`url(#${id}-glass)`} opacity="0.5" />
      {Array.from({ length: 14 }, (_, i) => (
        <g key={i}>
          <rect x={i * 30 + 4} y="60" width="14" height="440" fill="#e7e8ea" />
          <rect x={i * 30 + 18} y="60" width="5" height="440" fill="#a9adb4" />
        </g>
      ))}
      <rect x="0" y="50" width="400" height="14" fill="#d2d4d8" />
    </>
  );
}

function Mirror({ id }: { id: string }) {
  return (
    <>
      <rect width="400" height="500" fill="#eef0f2" />
      <rect x="0" y="380" width="400" height="120" fill="#d2d4d8" />
      <rect x="95" y="50" width="210" height="360" rx="105" fill="#33363a" />
      <rect x="105" y="60" width="190" height="340" rx="95" fill={`url(#${id}-mirror)`} />
      <defs>
        <linearGradient id={`${id}-mirror`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e4edf5" />
          <stop offset="0.55" stopColor="#a9c3dc" />
          <stop offset="1" stopColor="#6b93bb" />
        </linearGradient>
      </defs>
      <polygon points="140,330 250,90 270,100 160,345" fill="#ffffff" opacity="0.45" />
    </>
  );
}

const variants: Record<FacadeVariant, (props: { id: string }) => React.ReactElement> = {
  tower: Tower,
  curtain: Curtain,
  insulated: Insulated,
  window: Window,
  sliding: Sliding,
  panels: Panels,
  slats: Slats,
  mirror: Mirror,
};

export function FacadeArt({
  variant,
  className = "",
  label,
  anchor = "center",
}: {
  variant: FacadeVariant;
  className?: string;
  label?: string;
  /** Qué parte del dibujo conservar al recortarlo para llenar el contenedor. */
  anchor?: "center" | "top";
}) {
  const Art = variants[variant];
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio={anchor === "top" ? "xMidYMin slice" : "xMidYMid slice"}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Art id={`facade-${variant}`} />
    </svg>
  );
}
