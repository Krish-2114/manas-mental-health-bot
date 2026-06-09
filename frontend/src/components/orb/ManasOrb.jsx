import { motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const SIZES = { sm: 48, md: 80, lg: 120, xl: 160 };

export default function ManasOrb({ state = "idle", size = "md", className = "" }) {
  const reduced = useReducedMotion();
  const px = SIZES[size] || SIZES.md;
  const isCrisis = state === "crisis";
  const isThinking = state === "thinking" || state === "responding";
  const isListening = state === "listening";
  const isCompanion = state === "companion" || state === "speaking";

  const breathe = reduced
    ? {}
    : {
        scale: [1, 1.1, 1],
        transition: { duration: isCompanion ? 5 : 8, repeat: Infinity, ease: "easeInOut" },
      };

  const pulse = reduced
    ? {}
    : {
        scale: [1, 1.08, 1],
        transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
      };

  const float = reduced
    ? {}
    : {
        y: [0, -5, 0, 4, 0],
        transition: { duration: isCompanion ? 5 : 7, repeat: Infinity, ease: "easeInOut" },
      };

  const coreMotion = isListening ? pulse : isThinking ? pulse : breathe;

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      animate={float}
      role="img"
      aria-label={`Manas ${state}`}
    >
      {(isThinking || state === "responding") && !reduced && (
        <motion.div
          className="absolute inset-0 rounded-full border border-ocean-accent/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      )}

      {isCompanion && !reduced && (
        <motion.span
          className="absolute inset-0 rounded-full border border-ocean-accent/20"
          animate={{ scale: [0.9, 1.35, 0.9], opacity: [0.35, 0.08, 0.35] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {state === "responding" &&
        !reduced &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-ocean-accent/25"
            initial={{ scale: 0.7, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
          />
        ))}

      <motion.div
        className="absolute inset-[10%] rounded-full blur-xl"
        style={{
          background: isCrisis
            ? "radial-gradient(circle, rgba(231,111,81,0.35), rgba(46,125,138,0.25))"
            : "var(--orb-glow)",
        }}
        animate={coreMotion}
      />

      <motion.div
        className="relative rounded-full shadow-glow"
        style={{
          width: px * 0.58,
          height: px * 0.58,
          background: isCrisis
            ? "radial-gradient(circle at 35% 35%, #f4a261, #2e7d8a 70%)"
            : `radial-gradient(circle at 32% 28%, var(--orb-core), var(--primary) 55%, var(--secondary) 85%)`,
        }}
        animate={coreMotion}
      />

      {!reduced &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={`p-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-ocean-accent/60"
            style={{
              top: `${18 + i * 22}%`,
              left: `${72 - i * 12}%`,
            }}
            animate={
              isThinking || isCompanion
                ? { y: [0, -8, 0], x: [0, i % 2 ? 3 : -3, 0], opacity: [0.35, 1, 0.35] }
                : { opacity: [0.25, 0.7, 0.25], scale: [0.8, 1.1, 0.8] }
            }
            transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.35 }}
          />
        ))}
    </motion.div>
  );
}
