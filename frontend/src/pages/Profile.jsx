import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import client from "../api/client";
import AmbientBackground from "../components/design/AmbientBackground";
import GlassCard from "../components/design/GlassCard";
import ThemeToggle from "../components/design/ThemeToggle";
import BottomNav from "../components/layout/BottomNav";
import ManasOrb from "../components/orb/ManasOrb";
import { useWellnessStore } from "../store/wellnessStore";

const DISTRESS_MAP = { low: 0, medium: 1, high: 2 };
const DISTRESS_LABELS = { 0: "Low", 1: "Medium", 2: "High" };

export default function Profile() {
  const navigate = useNavigate();
  const moodLogs = useWellnessStore((s) => s.moodLogs);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("manas_token")) {
      navigate("/login");
      return;
    }
    client
      .get("/user/profile")
      .then(({ data }) => setProfile(data))
      .catch((err) => setError(err.response?.data?.detail || "Failed to load profile."))
      .finally(() => setLoading(false));
  }, [navigate]);

  const distressChart =
    profile?.mood_history.map((entry) => ({
      date: entry.date.slice(5),
      level: DISTRESS_MAP[entry.distress_level] ?? 0,
    })) || [];

  const moodChart = moodLogs
    .slice()
    .reverse()
    .slice(-14)
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: m.value,
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <ManasOrb state="thinking" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-ocean-danger">{error}</p>
        <button type="button" onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-20 md:pb-10">
      <AmbientBackground intensity="subtle" />

      <header className="sticky top-0 z-30 glass-card border-b border-ocean-border rounded-none px-6 py-4 flex items-center justify-between">
        <Link to="/chat" className="text-sm text-ocean-primary hover:underline">
          ← Chat
        </Link>
        <h1 className="font-display text-xl text-ocean-text-primary">Profile</h1>
        <ThemeToggle compact />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <GlassCard className="p-8 text-center">
          <ManasOrb state="idle" size="md" className="mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-ocean-text-primary">{profile.username}</h2>
          <p className="text-ocean-text-secondary mt-1 text-sm">
            Joined{" "}
            {new Date(profile.joined_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="mt-6 inline-block glass-card px-8 py-4 rounded-2xl">
            <p className="text-3xl font-bold text-ocean-primary">{profile.total_sessions}</p>
            <p className="text-sm text-ocean-text-secondary">Conversations</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-ocean-text-primary mb-4">Session distress (30 days)</h3>
          {distressChart.length === 0 ? (
            <p className="text-center text-ocean-text-secondary py-10 text-sm">
              Start chatting to see emotional patterns from your sessions.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={distressChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                <YAxis
                  domain={[0, 2]}
                  ticks={[0, 1, 2]}
                  tickFormatter={(v) => DISTRESS_LABELS[v]}
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                />
                <Tooltip formatter={(v) => [DISTRESS_LABELS[v], "Distress"]} />
                <Line type="monotone" dataKey="level" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-ocean-text-primary mb-4">Your mood logs</h3>
          {moodChart.length === 0 ? (
            <p className="text-center text-ocean-text-secondary py-10 text-sm">
              Log moods in Wellness to see your personal trend here.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={moodChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
          <Link to="/wellness" className="text-sm text-ocean-primary mt-4 inline-block hover:underline">
            Open wellness tools →
          </Link>
        </GlassCard>
      </main>

      <BottomNav />
    </div>
  );
}
