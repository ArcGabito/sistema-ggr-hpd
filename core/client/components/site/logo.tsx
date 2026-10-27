export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden>
      <rect x="2" y="12" width="9" height="22" rx="1.5" className="fill-ink-300" />
      <rect x="13" y="2" width="10" height="32" rx="1.5" className="fill-ink-900" />
      <rect x="25" y="8" width="9" height="26" rx="1.5" className="fill-sky-400" />
      {[6, 12, 18, 24].map((y) => (
        <rect key={y} x="15" y={y} width="6" height="3" rx="0.5" className="fill-white/80" />
      ))}
      {[12, 18, 24].map((y) => (
        <rect key={y} x="27" y={y} width="5" height="3" rx="0.5" className="fill-white/70" />
      ))}
    </svg>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span className={`block text-lg font-bold tracking-tight ${inverted ? "text-white" : "text-ink-900"}`}>HPD Glass Group</span>
        <span className={`mt-1 block text-[10px] font-medium tracking-wide ${inverted ? "text-ink-300" : "text-ink-400"}`}>
          vidrio y aluminio arquitectónico
        </span>
      </span>
    </span>
  );
}
