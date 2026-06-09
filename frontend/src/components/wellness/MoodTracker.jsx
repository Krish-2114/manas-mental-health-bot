import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import GlassCard from "../design/GlassCard";
import { MOODS, useWellnessStore } from "../../store/wellnessStore";

const MOOD_ORDER = Object.keys(MOODS);

export default function MoodTracker({ onLogMood }) {
  const moodLogs = useWellnessStore((s) => s.moodLogs);
  const getWeeklyMoods = useWellnessStore((s) => s.getWeeklyMoods);
  const getMonthlyMoods = useWellnessStore((s) => s.getMonthlyMoods);

  const weekly = getWeeklyMoods()
    .slice()
    .reverse()
    .map((m) => ({
      day: new Date(m.date).toLocaleDateString("en-US", { weekday: "short" }),
      value: m.value,
      label: m.label,
    }));

  const monthly = getMonthlyMoods()
    .slice()
    .reverse()
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: m.value,
    }));

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-ocean-text-primary mb-1">Log your mood</h3>
        <p className="text-sm text-ocean-text-secondary mb-4">How are you feeling right now?</p>
        <div className="grid grid-cols-4 gap-2">
          {MOOD_ORDER.map((key) => {
            const m = MOODS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onLogMood?.(key)}
                className="glass-card p-3 rounded-2xl hover:scale-[1.02] transition-transform text-center"
              >
                <span className="text-xl block">{m.emoji}</span>
                <span className="text-[10px] text-ocean-text-secondary">{m.label}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-ocean-text-primary mb-4">Weekly trend</h3>
        {weekly.length === 0 ? (
          <p className="text-sm text-ocean-text-secondary text-center py-8">Log moods to see your week.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-ocean-text-primary mb-4">Monthly overview</h3>
        {monthly.length === 0 ? (
          <p className="text-sm text-ocean-text-secondary text-center py-8">Your monthly mood map will grow here.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      {moodLogs.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-ocean-text-primary mb-3">Reflection history</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {moodLogs.slice(0, 10).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm py-2 border-b border-ocean-border last:border-0">
                <span>
                  {m.emoji} {m.label}
                </span>
                <span className="text-ocean-text-secondary text-xs">
                  {new Date(m.date).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
