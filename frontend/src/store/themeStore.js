import { create } from "zustand";

const STORAGE_KEY = "manas_theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
const initial = stored || "system";
applyTheme(initial);

export const useThemeStore = create((set) => ({
  theme: initial,
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
  resolvedTheme: () => {
    const t = useThemeStore.getState().theme;
    return t === "system" ? getSystemTheme() : t;
  },
}));

if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (useThemeStore.getState().theme === "system") applyTheme("system");
  });
}
