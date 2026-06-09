import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Phone, X } from "lucide-react";
import ManasOrb from "../orb/ManasOrb";
import GlassCard from "../design/GlassCard";

export default function CrisisSupport({ open, onDismiss }) {
  const [showResources, setShowResources] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="px-4 md:px-6 pt-4"
          role="alert"
          aria-live="assertive"
        >
          <GlassCard className="p-5 border-ocean-primary/20 bg-gradient-to-r from-ocean-secondary-soft/80 to-ocean-surface/60">
            <div className="flex gap-4">
              <ManasOrb state="crisis" size="sm" className="shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ocean-text-primary leading-relaxed">
                  I'm concerned about what you've shared. You don't have to face this alone — would it help if we
                  explored support options together?
                </p>
                {!showResources ? (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button type="button" onClick={() => setShowResources(true)} className="btn-primary !py-2 !px-4 text-sm">
                      <Heart size={16} /> Yes, show me support
                    </button>
                    <button type="button" onClick={onDismiss} className="btn-secondary !py-2 !px-4 text-sm">
                      Continue talking
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2">
                    <p className="text-sm text-ocean-text-secondary">Reach out — someone is ready to listen.</p>
                    <a href="tel:9152987821" className="flex items-center gap-2 text-sm text-ocean-primary font-medium">
                      <Phone size={16} /> iCall: 9152987821
                    </a>
                    <a href="tel:18602662345" className="flex items-center gap-2 text-sm text-ocean-primary font-medium">
                      <Phone size={16} /> Vandrevala Foundation: 1860-2662-345
                    </a>
                    <a href="tel:112" className="flex items-center gap-2 text-sm text-ocean-danger font-medium">
                      <Phone size={16} /> Emergency: 112
                    </a>
                  </motion.div>
                )}
              </div>
              <button
                type="button"
                onClick={onDismiss}
                className="text-ocean-text-secondary hover:text-ocean-text-primary shrink-0"
                aria-label="Dismiss"
              >
                <X size={20} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
