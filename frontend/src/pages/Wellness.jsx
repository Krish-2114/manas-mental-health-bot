import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AmbientBackground from "../components/design/AmbientBackground";
import ThemeToggle from "../components/design/ThemeToggle";
import BottomNav from "../components/layout/BottomNav";
import BreathingExercise from "../components/wellness/BreathingExercise";
import DailyReflection from "../components/wellness/DailyReflection";
import JournalTool from "../components/wellness/JournalTool";
import MoodTracker from "../components/wellness/MoodTracker";
import { useWellnessStore } from "../store/wellnessStore";

export default function Wellness() {
  const navigate = useNavigate();
  const logMood = useWellnessStore((s) => s.logMood);

  useEffect(() => {
    if (!localStorage.getItem("manas_token")) navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen relative pb-20 md:pb-10">
      <AmbientBackground intensity="subtle" />

      <header className="sticky top-0 z-30 glass-card border-b border-ocean-border rounded-none px-6 py-4 flex items-center justify-between">
        <Link to="/chat" className="text-sm text-ocean-primary hover:underline">
          ← Chat
        </Link>
        <h1 className="font-display text-xl text-ocean-text-primary">Wellness</h1>
        <ThemeToggle compact />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div className="text-center mb-4">
          <p className="text-ocean-text-secondary">
            Tools to help you breathe, reflect, and understand your emotional rhythm.
          </p>
        </div>

        <MoodTracker onLogMood={(key) => logMood(key)} />
        <DailyReflection />
        <BreathingExercise />
        <JournalTool />
      </main>

      <BottomNav />
    </div>
  );
}
