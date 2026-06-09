import { create } from "zustand";
import { persist } from "zustand/middleware";

const MOODS = {
  happy: { label: "Happy", emoji: "😊", value: 8 },
  sad: { label: "Sad", emoji: "😔", value: 3 },
  anxious: { label: "Anxious", emoji: "😟", value: 2 },
  tired: { label: "Tired", emoji: "😴", value: 4 },
  frustrated: { label: "Frustrated", emoji: "😡", value: 3 },
  confused: { label: "Confused", emoji: "😕", value: 4 },
  calm: { label: "Calm", emoji: "😌", value: 7 },
  lonely: { label: "Lonely", emoji: "😔", value: 2 },
};

function userKey() {
  return localStorage.getItem("manas_username") || "guest";
}

export { MOODS };

export const useWellnessStore = create(
  persist(
    (set, get) => ({
      moodLogs: [],
      reflections: [],
      journalEntries: [],

      logMood: (moodKey, note = "") => {
        const mood = MOODS[moodKey];
        if (!mood) return;
        const entry = {
          id: crypto.randomUUID(),
          moodKey,
          label: mood.label,
          emoji: mood.emoji,
          value: mood.value,
          note,
          date: new Date().toISOString(),
        };
        set((s) => ({ moodLogs: [entry, ...s.moodLogs].slice(0, 200) }));
        return entry;
      },

      saveReflection: (answers) => {
        const entry = {
          id: crypto.randomUUID(),
          answers,
          date: new Date().toISOString(),
        };
        set((s) => ({ reflections: [entry, ...s.reflections].slice(0, 100) }));
      },

      saveJournal: (content) => {
        const trimmed = content.trim();
        if (!trimmed) return;
        const existing = get().journalEntries[0];
        if (existing && existing.content === trimmed) return;
        const entry = {
          id: crypto.randomUUID(),
          content: trimmed,
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ journalEntries: [entry, ...s.journalEntries].slice(0, 50) }));
      },

      getWeeklyMoods: () => {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return get().moodLogs.filter((m) => new Date(m.date).getTime() >= weekAgo);
      },

      getMonthlyMoods: () => {
        const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return get().moodLogs.filter((m) => new Date(m.date).getTime() >= monthAgo);
      },
    }),
    {
      name: "manas_wellness",
      partialize: (state) => ({
        moodLogs: state.moodLogs,
        reflections: state.reflections,
        journalEntries: state.journalEntries,
      }),
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(`${name}_${userKey()}`);
          return raw ? JSON.parse(raw) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(`${name}_${userKey()}`, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(`${name}_${userKey()}`),
      },
    }
  )
);
