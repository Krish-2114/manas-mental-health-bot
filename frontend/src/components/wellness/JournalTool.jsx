import { useEffect, useState } from "react";
import GlassCard from "../design/GlassCard";
import { useWellnessStore } from "../../store/wellnessStore";

const PROMPTS = [
  "Write freely — no one will read this but you.",
  "What's been sitting heavy on your heart?",
  "Describe a moment today that stayed with you.",
  "What would you tell a friend in your situation?",
];

export default function JournalTool() {
  const journalEntries = useWellnessStore((s) => s.journalEntries);
  const saveJournal = useWellnessStore((s) => s.saveJournal);
  const [content, setContent] = useState(journalEntries[0]?.content || "");
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim()) saveJournal(content);
    }, 1200);
    return () => clearTimeout(timer);
  }, [content, saveJournal]);

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-ocean-text-primary mb-1">Journal</h3>
      <p className="text-sm text-ocean-text-secondary mb-4">{prompt}</p>
      <textarea
        className="ocean-input min-h-[200px] resize-y font-mono text-sm leading-relaxed"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing... Markdown supported."
        aria-label="Journal entry"
      />
      <p className="text-xs text-ocean-text-secondary mt-2">Autosaves as you write.</p>
    </GlassCard>
  );
}
