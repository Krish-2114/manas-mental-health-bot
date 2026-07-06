import { parseMessageContent, parseStreamingContent } from "../../utils/messageContent";
import WarmGesture from "./WarmGesture";

function ActionAside({ text }) {
  return (
    <em className="text-ocean-text-secondary not-italic text-sm font-medium">{text}</em>
  );
}

function formatInlineEmphasis(line) {
  const segments = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let match;

  while ((match = re.exec(line)) !== null) {
    if (match.index > last) segments.push({ type: "text", value: line.slice(last, match.index) });
    segments.push({ type: "em", value: match[1] });
    last = match.index + match[0].length;
  }

  if (last < line.length) segments.push({ type: "text", value: line.slice(last) });
  if (!segments.length) return line;

  return segments.map((seg, i) =>
    seg.type === "em" ? (
      <em key={i} className="text-ocean-text-primary not-italic font-medium">
        {seg.value}
      </em>
    ) : (
      seg.value
    )
  );
}

function TextBlock({ text }) {
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return i < lines.length - 1 ? <br key={i} /> : null;

        const isListItem = /^\d+\.\s/.test(trimmed);
        return (
          <span
            key={i}
            className={`block whitespace-pre-wrap ${isListItem ? "mt-3 first:mt-0" : ""}`}
          >
            {formatInlineEmphasis(trimmed)}
          </span>
        );
      })}
    </>
  );
}

export default function MessageContent({ content, streaming = false }) {
  const parts = streaming ? parseStreamingContent(content) : parseMessageContent(content);

  return (
    <span className="text-[15px] leading-relaxed text-ocean-text-primary">
      {parts.map((part, i) => {
        if (part.kind === "gesture") {
          return (
            <span key={`g-${i}`} className="block mb-2.5">
              <WarmGesture label={part.label} type={part.type} />
            </span>
          );
        }
        if (part.kind === "action") {
          return (
            <span key={`a-${i}`} className="inline-block mr-1">
              <ActionAside text={part.text} />
            </span>
          );
        }
        return <TextBlock key={`t-${i}`} text={part.text} />;
      })}
    </span>
  );
}
