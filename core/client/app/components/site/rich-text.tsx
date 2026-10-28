import type { ReactNode } from "react";

type Block = { type: "heading" | "paragraph"; text: string } | { type: "list"; items: string[] };

/**
 * Formato de los artículos: párrafos separados por una línea en blanco, "## " para subtítulos y
 * "- " para listas. Todo se renderiza como texto: no se interpreta HTML.
 */
export function parseRichText(source: string): Block[] {
  return source
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk): Block => {
      if (chunk.startsWith("## ")) return { type: "heading", text: chunk.slice(3).trim() };
      const lines = chunk.split("\n");
      if (lines.every((line) => line.trim().startsWith("- "))) {
        return { type: "list", items: lines.map((line) => line.trim().slice(2).trim()) };
      }
      return { type: "paragraph", text: lines.join(" ") };
    });
}

export function RichText({ source, className = "" }: { source: string; className?: string }) {
  const blocks = parseRichText(source);
  const nodes: ReactNode[] = blocks.map((block, i) => {
    if (block.type === "heading") {
      return (
        <h2 key={i} className="mt-10 text-2xl font-bold tracking-tight first:mt-0">
          {block.text}
        </h2>
      );
    }
    if (block.type === "list") {
      return (
        <ul key={i} className="mt-5 list-disc space-y-2 pl-6 marker:text-sky-400">
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mt-5 first:mt-0">
        {block.text}
      </p>
    );
  });
  return <div className={`text-base leading-relaxed text-ink-600 ${className}`}>{nodes}</div>;
}
