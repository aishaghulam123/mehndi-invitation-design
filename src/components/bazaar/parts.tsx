import { useMemo } from "react";

/** Splits text into masked words for kinetic reveals (animate `.w`). */
export function Split({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="wm" aria-hidden="true">
          <span className="w">{word}</span>
          {"\u00A0"}
        </span>
      ))}
    </span>
  );
}

export function Lantern({ className = "", size = 60, off = false }: { className?: string; size?: number; off?: boolean }) {
  return (
    <svg
      viewBox="0 0 60 120"
      width={size}
      height={size * 2}
      className={`lantern ${off ? "lantern-off" : "lantern-glow"} ${className}`}
      aria-hidden="true"
    >
      <line x1="30" y1="0" x2="30" y2="22" className="stroke-brass" strokeWidth="1.5" />
      <path d="M22 22h16l4 8H18z" className="lantern-body" strokeWidth="1.5" />
      <path d="M18 30h24l6 18-6 40H18l-6-40z" className="lantern-light" opacity="0.92" />
      <path d="M18 30h24l6 18-6 40H18l-6-40z M30 30v58 M12 48h36 M14 70h32" className="lantern-body" fill="none" strokeWidth="1.5" />
      <path d="M18 88h24l-4 10H22z" className="lantern-body" strokeWidth="1.5" />
      <circle cx="30" cy="106" r="3" className="fill-brass" />
    </svg>
  );
}

/** Deterministic petals so SSR and client markup match. */
export function Petals({ count = 18, className = "" }: { count?: number; className?: string }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37) % 100,
        top: (i * 53) % 100,
        rot: (i * 47) % 360,
        tone: i % 3 === 0 ? "m" : i % 3 === 1 ? "r" : "",
        s: 0.6 + ((i * 13) % 10) / 10,
      })),
    [count],
  );
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className={`petal ${p.tone}`}
          style={{ left: `${p.left}%`, top: `${p.top}%`, transform: `rotate(${p.rot}deg) scale(${p.s})` }}
        />
      ))}
    </div>
  );
}

export function Motes({ count = 24 }: { count?: number }) {
  const motes = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ left: (i * 29) % 100, top: (i * 61) % 100, o: 0.3 + ((i * 7) % 7) / 10 })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {motes.map((m, i) => (
        <span key={i} className="mote" style={{ left: `${m.left}%`, top: `${m.top}%`, opacity: m.o }} />
      ))}
    </div>
  );
}

export function Ornament({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 24" className={className} aria-hidden="true">
      <path d="M0 12h96M144 12h96" className="stroke-brass" strokeWidth="1" />
      <path d="M120 2l10 10-10 10-10-10z" className="stroke-amber" fill="none" strokeWidth="1.2" />
      <circle cx="102" cy="12" r="2" className="fill-brass" />
      <circle cx="138" cy="12" r="2" className="fill-brass" />
    </svg>
  );
}
