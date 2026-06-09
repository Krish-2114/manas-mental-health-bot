import { useReducedMotion } from "../../hooks/useReducedMotion";

export default function AmbientBackground({ intensity = "normal" }) {
  const reduced = useReducedMotion();
  const opacity = intensity === "subtle" ? "opacity-40" : "opacity-70";

  if (reduced) return null;

  return (
    <div className={`pointer-events-none fixed inset-0 overflow-hidden -z-10 ${opacity}`} aria-hidden>
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-ocean-secondary/20 blur-3xl animate-blob-drift" />
      <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-ocean-accent/15 blur-3xl animate-blob-drift-slow" />
      <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-ocean-primary/10 blur-3xl animate-blob-drift" />

      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-ocean-accent/30 animate-float"
          style={{
            top: `${8 + (i * 7) % 80}%`,
            left: `${5 + (i * 11) % 90}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${5 + (i % 4)}s`,
          }}
        />
      ))}
    </div>
  );
}
