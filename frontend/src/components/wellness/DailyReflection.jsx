import { useState } from "react";
import GlassCard from "../design/GlassCard";
import { useWellnessStore } from "../../store/wellnessStore";

const PROMPTS = [
  { key: "challenged", label: "What challenged you today?" },
  { key: "grateful", label: "What are you grateful for?" },
  { key: "meaningful", label: "What made today meaningful?" },
  { key: "improve", label: "What would you like to improve tomorrow?" },
];

export default function DailyReflection() {
  const saveReflection = useWellnessStore((s) => s.saveReflection);
  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveReflection(answers);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-ocean-text-primary mb-1">Daily reflection</h3>
      <p className="text-sm text-ocean-text-secondary mb-5">Gentle prompts to help you process the day.</p>
      <div className="space-y-4">
        {PROMPTS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-ocean-text-primary mb-1.5">{label}</label>
            <textarea
              className="ocean-input min-h-[72px] resize-y text-sm"
              value={answers[key] || ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <button type="button" onClick={handleSave} className="btn-primary w-full mt-5">
        {saved ? "Saved ✓" : "Save reflection"}
      </button>
    </GlassCard>
  );
}
