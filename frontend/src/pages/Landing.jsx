import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Lock, MessageCircle, Shield, Sparkles, Waves } from "lucide-react";
import AmbientBackground from "../components/design/AmbientBackground";
import GlassCard from "../components/design/GlassCard";
import PublicNav from "../components/layout/PublicNav";
import ManasOrb from "../components/orb/ManasOrb";

const FEATURES = [
  { icon: MessageCircle, title: "Always Listening", desc: "Share what's on your mind, anytime — without judgment." },
  { icon: Lock, title: "Private & Secure", desc: "Your conversations stay yours. SOS alerts never share message content." },
  { icon: Shield, title: "Crisis-Aware Support", desc: "Compassionate safety responses and helplines when you need them most." },
  { icon: Heart, title: "Personalized Conversations", desc: "Manas learns your tone, interests, and what helps you cope." },
  { icon: Sparkles, title: "Mood Tracking", desc: "Gently notice patterns in how you've been feeling over time." },
  { icon: Waves, title: "Guided Reflection", desc: "Daily prompts to help you process, breathe, and grow." },
];

const STEPS = [
  { n: "01", title: "Share how you're feeling", desc: "Start with a mood, a thought, or simply hello." },
  { n: "02", title: "Talk naturally", desc: "No scripts. Manas listens and responds with warmth." },
  { n: "03", title: "Reflect and grow", desc: "Journal, breathe, and track your emotional journey." },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <AmbientBackground />
      <PublicNav />

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
          <ManasOrb state="idle" size="xl" className="mx-auto mb-10" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="font-display text-5xl md:text-7xl text-ocean-text-primary mb-5 leading-tight"
        >
          Hello. I'm Manas.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="text-xl md:text-2xl text-ocean-text-secondary max-w-2xl mx-auto mb-4"
        >
          A calm space for your thoughts.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-ocean-text-secondary max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Manas is an AI companion for emotional support, reflection, journaling, and wellness conversations.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/signup" className="btn-primary text-base">
            Begin your journey
          </Link>
          <Link to="/about" className="btn-secondary text-base">
            Learn about Manas
          </Link>
        </motion.div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <motion.div {...fadeUp} className="glass-card rounded-3xl p-8 md:p-10 grid md:grid-cols-4 gap-6 text-center">
          {[
            { stat: "Private", label: "End-to-end emotional privacy" },
            { stat: "24/7", label: "Always here when you need to talk" },
            { stat: "Crisis-aware", label: "Safety built into every conversation" },
            { stat: "Personal", label: "Support that adapts to you" },
          ].map((item) => (
            <div key={item.stat}>
              <p className="text-2xl font-semibold text-ocean-primary mb-1">{item.stat}</p>
              <p className="text-sm text-ocean-text-secondary">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.h2 {...fadeUp} className="font-display text-4xl text-center text-ocean-text-primary mb-12">
          Designed for emotional wellness
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fadeUp} transition={{ delay: i * 0.05 }}>
              <GlassCard hover className="p-6 h-full">
                <f.icon className="text-ocean-primary mb-4" size={24} />
                <h3 className="font-semibold text-ocean-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-ocean-text-secondary leading-relaxed">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <motion.h2 {...fadeUp} className="font-display text-4xl text-center text-ocean-text-primary mb-14">
          How it works
        </motion.h2>
        <div className="space-y-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              {...fadeUp}
              transition={{ delay: i * 0.1 }}
              className="flex gap-6 items-start"
            >
              <span className="text-3xl font-display text-ocean-accent shrink-0">{step.n}</span>
              <GlassCard className="flex-1 p-6">
                <h3 className="font-semibold text-ocean-text-primary text-lg mb-1">{step.title}</h3>
                <p className="text-ocean-text-secondary">{step.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center">
        <motion.div {...fadeUp}>
          <ManasOrb state="listening" size="md" className="mx-auto mb-6" />
          <h2 className="font-display text-3xl text-ocean-text-primary mb-4">
            You don't have to carry everything alone.
          </h2>
          <p className="text-ocean-text-secondary mb-8">Take the first gentle step. Manas is ready to listen.</p>
          <Link to="/signup" className="btn-primary">Create your safe space</Link>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-ocean-border py-8 text-center text-sm text-ocean-text-secondary">
        Manas · A compassionate AI companion · Not a substitute for professional care
      </footer>
    </div>
  );
}
