const STYLES = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const LABELS = {
  low: "Calm",
  medium: "Moderate",
  high: "High distress",
};

export default function DistressBadge({ level }) {
  if (!level) return null;

  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${STYLES[level] || STYLES.low}`}
    >
      {LABELS[level] || level}
    </span>
  );
}
