import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  hover = false,
  onClick,
  as = "div",
}) {
  const Component = motion[as] || motion.div;

  return (
    <Component
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`glass-card rounded-3xl shadow-lift ${hover ? "cursor-pointer hover:shadow-glow-sm" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}
