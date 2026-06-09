import { motion } from "framer-motion";
import { MOODS } from "../../store/wellnessStore";
import ManasOrb from "../orb/ManasOrb";
import GlassCard from "../design/GlassCard";

const MOOD_ORDER = ["happy", "calm", "sad", "anxious", "tired", "frustrated", "confused", "lonely"];

export default function MoodEmptyState({ onSelectMood }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <ManasOrb state="idle" size="lg" className="mx-auto mb-6" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="font-display text-3xl text-ocean-text-primary mb-2"
      >
        How are you feeling today?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-ocean-text-secondary max-w-md mb-8"
      >
        Choose a mood to begin — or type your own thoughts below. There is no wrong way to start.
      </motion.p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
        {MOOD_ORDER.map((key, i) => {
          const mood = MOODS[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <GlassCard
                hover
                onClick={() => onSelectMood(key, mood)}
                className="p-4 text-center"
              >
                <span className="text-2xl block mb-1" role="img" aria-hidden>
                  {mood.emoji}
                </span>
                <span className="text-sm font-medium text-ocean-text-primary">{mood.label}</span>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
