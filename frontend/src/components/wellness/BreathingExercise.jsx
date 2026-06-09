import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../design/GlassCard";

const PHASES = [
  { label: "Breathe in", duration: 4000, scale: 1.2 },
  { label: "Hold", duration: 2000, scale: 1.2 },
  { label: "Breathe out", duration: 6000, scale: 0.85 },
  { label: "Rest", duration: 2000, scale: 1 },
];

export default function BreathingExercise() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [active, setActive] = useState(false);
  const phase = PHASES[phaseIndex];

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      setPhaseIndex((i) => (i + 1) % PHASES.length);
    }, phase.duration);
    return () => clearTimeout(timer);
  }, [active, phaseIndex, phase.duration]);

  return (
    <GlassCard id="breathing" className="p-6">
      <h3 className="text-lg font-semibold text-ocean-text-primary mb-1">Guided breathing</h3>
      <p className="text-sm text-ocean-text-secondary mb-6">Follow the ocean circle. No rush.</p>

      <div className="flex flex-col items-center py-6">
        <motion.div
          className="rounded-full bg-gradient-to-br from-ocean-accent/40 to-ocean-primary/30 shadow-glow"
          animate={{ width: 140 * phase.scale, height: 140 * phase.scale }}
          transition={{ duration: phase.duration / 1000, ease: "easeInOut" }}
          style={{ width: 140, height: 140 }}
        />
        <p className="mt-6 text-xl font-medium text-ocean-primary">{active ? phase.label : "Ready when you are"}</p>
      </div>

      <button type="button" onClick={() => setActive((a) => !a)} className="btn-primary w-full">
        {active ? "Pause" : "Begin breathing"}
      </button>
    </GlassCard>
  );
}
