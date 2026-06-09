import { parseMessageContent, parseStreamingContent } from "../../utils/messageContent";
import WarmGesture from "./WarmGesture";

function ActionAside({ text }) {
  return (
    <em className="text-ocean-text-secondary not-italic text-sm font-medium">{text}</em>
  );
}

function TextBlock({ text }) {
  const trimmed = text.replace(/^\s+/, "");
  if (!trimmed) return null;
  return <span className="whitespace-pre-wrap">{text}</span>;
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
