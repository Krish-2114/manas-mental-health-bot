import ManasOrb from "../orb/ManasOrb";

export default function TypingIndicator({ label = "Manas is reflecting..." }) {
  return (
    <div className="flex gap-4 mb-5 message-enter" role="status" aria-live="polite">
      <ManasOrb state="thinking" size="sm" />
      <div className="glass-card px-5 py-4 rounded-3xl rounded-bl-lg">
        <p className="text-sm text-ocean-text-secondary mb-3">{label}</p>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full bg-ocean-accent/70 animate-ripple"
              style={{ animationDelay: `${i * 0.45}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
