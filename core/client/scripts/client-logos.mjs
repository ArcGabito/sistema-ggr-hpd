// Genera los logos de clientes que usa el sitio a partir de los originales (.svg / .webp) de
// public/assets/clients: rasteriza, recorta el margen vacío y escribe un .png por cliente, más
// app/lib/client-logos.json con sus dimensiones. Los originales no se modifican.
// Uso: npm run logos
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, basename, join } from "node:path";
import sharp from "sharp";

const dir = "public/assets/clients";
const sources = readdirSync(dir).filter((file) => [".svg", ".webp"].includes(extname(file))).sort();
const manifest = {};

for (const file of sources) {
  const input = join(dir, file);
  let image;
  if (extname(file) === ".svg") {
    // Los SVG envuelven un raster grande: se renderizan a 4x su viewBox.
    const svg = readFileSync(input);
    const [, , width, height] = svg.toString().match(/viewBox="(\S+) (\S+) (\S+) (\S+)"/).slice(1).map(Number);
    image = sharp(svg, { density: 72 * 4 }).resize(Math.round(width * 4), Math.round(height * 4));
  } else {
    image = sharp(input);
  }

  const trimmed = await image.png().toBuffer().then((buffer) => sharp(buffer).trim({ threshold: 12 }).png({ compressionLevel: 9 }).toBuffer());
  const { width, height } = await sharp(trimmed).metadata();
  const output = `${basename(file, extname(file))}.png`;
  writeFileSync(join(dir, output), trimmed);
  manifest[output] = { width, height };
  console.log(`${file.padEnd(26)} → ${output} ${width}x${height}`);
}

writeFileSync("app/lib/client-logos.json", `${JSON.stringify(manifest, null, 2)}\n`);
