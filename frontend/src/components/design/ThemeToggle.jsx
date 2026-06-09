import { Moon, Sun, Monitor } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

const OPTIONS = [
  { id: "light", icon: Sun, label: "Light" },
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "system", icon: Monitor, label: "System" },
];

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useThemeStore();

  if (compact) {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        className="p-2.5 rounded-xl border border-ocean-border bg-ocean-surface/80 text-ocean-text-secondary hover:text-ocean-primary transition-colors"
        aria-label={`Theme: ${theme}. Click to change.`}
      >
        <Icon size={18} />
      </button>
    );
  }

  return (
    <div className="inline-flex p-1 rounded-2xl border border-ocean-border bg-ocean-surface/60" role="group" aria-label="Theme">
      {OPTIONS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => setTheme(id)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            theme === id
              ? "bg-ocean-primary text-white shadow-glow-sm"
              : "text-ocean-text-secondary hover:text-ocean-primary"
          }`}
          aria-pressed={theme === id}
        >
          <Icon size={16} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
