import { Link } from "react-router-dom";
import { BarChart3, BookOpen, Wind } from "lucide-react";
import GlassCard from "../design/GlassCard";
import { useWellnessStore } from "../../store/wellnessStore";

export default function WellnessSidebar({ latestDistress }) {
  const moodLogs = useWellnessStore((s) => s.moodLogs);
  const reflections = useWellnessStore((s) => s.reflections);
  const recentMood = moodLogs[0];

  return (
    <aside className="hidden xl:flex w-80 flex-col h-full border-l border-ocean-border bg-ocean-surface/40 shrink-0 p-5 gap-4 overflow-y-auto">
      <div>
        <h3 className="text-sm font-semibold text-ocean-text-primary mb-1">Mood insights</h3>
        <p className="text-xs text-ocean-text-secondary">A gentle snapshot of how you've been feeling.</p>
      </div>

      <GlassCard className="p-4">
        {recentMood ? (
          <>
            <p className="text-3xl mb-1">{recentMood.emoji}</p>
            <p className="font-medium text-ocean-text-primary">{recentMood.label}</p>
            <p className="text-xs text-ocean-text-secondary mt-1">
              Logged {new Date(recentMood.date).toLocaleDateString()}
            </p>
          </>
        ) : (
          <p className="text-sm text-ocean-text-secondary">
            Log a mood in Wellness to see trends here.
          </p>
        )}
      </GlassCard>

      {latestDistress && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-ocean-text-secondary text-xs mb-2">
            <BarChart3 size={14} /> Session tone
          </div>
          <p className="text-sm text-ocean-text-primary capitalize">{latestDistress} distress detected</p>
        </GlassCard>
      )}

      <GlassCard className="p-4">
        <div className="flex items-center gap-2 text-ocean-text-secondary text-xs mb-2">
          <BookOpen size={14} /> Reflection summary
        </div>
        {reflections[0] ? (
          <p className="text-sm text-ocean-text-primary line-clamp-4">
            {reflections[0].answers.grateful || reflections[0].answers.challenged || "Recent reflection saved."}
          </p>
        ) : (
          <p className="text-sm text-ocean-text-secondary">No reflections yet.</p>
        )}
        <Link to="/wellness" className="text-xs text-ocean-primary mt-3 inline-block hover:underline">
          Open wellness →
        </Link>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-2 text-ocean-text-secondary text-xs mb-2">
          <Wind size={14} /> Quick calm
        </div>
        <p className="text-sm text-ocean-text-secondary mb-3">Take a slow breath before you continue.</p>
        <Link to="/wellness#breathing" className="btn-secondary w-full !py-2 text-sm">
          Breathing exercise
        </Link>
      </GlassCard>
    </aside>
  );
}
