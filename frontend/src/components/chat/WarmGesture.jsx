import { HandHeart, Heart, Sparkles } from "lucide-react";

const ICONS = {
  hug: HandHeart,
  warmth: Sparkles,
  support: Heart,
};

export default function WarmGesture({ label, type = "hug" }) {
  const Icon = ICONS[type] || HandHeart;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 mr-1.5 mb-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm align-middle"
      style={{
        background: "color-mix(in srgb, var(--secondary-soft) 90%, var(--accent))",
        borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)",
        color: "var(--primary)",
      }}
      role="note"
      aria-label={label}
    >
      <Icon size={14} strokeWidth={2.25} className="shrink-0" aria-hidden />
      {label}
    </span>
  );
}
