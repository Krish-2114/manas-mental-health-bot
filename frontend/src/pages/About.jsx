import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AmbientBackground from "../components/design/AmbientBackground";
import GlassCard from "../components/design/GlassCard";
import PublicNav from "../components/layout/PublicNav";
import ManasOrb from "../components/orb/ManasOrb";

export default function About() {
  return (
    <div className="min-h-screen relative">
      <AmbientBackground />
      <PublicNav />

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <ManasOrb state="idle" size="lg" className="mx-auto mb-6" />
          <h1 className="font-display text-4xl md:text-5xl text-ocean-text-primary mb-4">
            Manas listens with care
          </h1>
          <p className="text-lg text-ocean-text-secondary max-w-2xl mx-auto leading-relaxed">
            Manas is a digital emotional companion — not a chatbot, not a doctor. A calm place to
            talk, reflect, and feel supported when life feels heavy.
          </p>
        </motion.div>

        <div className="space-y-6">
          <GlassCard className="p-8">
            <h2 className="font-display text-2xl text-ocean-text-primary mb-3">What Manas offers</h2>
            <ul className="space-y-3 text-ocean-text-secondary text-sm leading-relaxed">
              <li>• Emotional support conversations that remember your story across sessions</li>
              <li>• Personalized responses based on your profile, tone, and coping strategies</li>
              <li>• Wellness tools: mood tracking, journaling, breathing, and daily reflection</li>
              <li>• Evidence-informed guidance woven in when relevant resources apply</li>
              <li>• Crisis-aware safety with compassionate helpline support and optional SOS alerts</li>
            </ul>
          </GlassCard>

          <GlassCard className="p-8 border-ocean-warning/20">
            <h2 className="font-display text-2xl text-ocean-text-primary mb-3">Crisis support & SOS</h2>
            <p className="text-ocean-text-secondary text-sm leading-relaxed mb-4">
              If Manas detects you may be in crisis, you'll see gentle support options — never abrupt
              alarms. You can enable SOS in Settings to notify trusted contacts with a check-in request.
              No message content is ever shared.
            </p>
            <p className="text-xs text-ocean-text-secondary">
              India: iCall 9152987821 · Vandrevala 1860-2662-345 · Emergency 112
            </p>
          </GlassCard>

          <GlassCard className="p-8">
            <h2 className="font-display text-2xl text-ocean-text-primary mb-3">Important</h2>
            <p className="text-ocean-text-secondary text-sm leading-relaxed">
              Manas cannot diagnose, prescribe medication, or replace therapy or emergency services.
              If you are in immediate danger, please contact emergency services or a crisis helpline.
            </p>
          </GlassCard>
        </div>

        <div className="text-center mt-14">
          <Link to="/signup" className="btn-primary mr-3">Create your safe space</Link>
          <Link to="/" className="btn-secondary">Back home</Link>
        </div>
      </main>
    </div>
  );
}
