import { useEffect } from "react";
import { useStreamText } from "../../hooks/useStreamText";
import ManasOrb from "../orb/ManasOrb";
import MessageContent from "./MessageContent";

function DistressBadge({ level }) {
  const styles = {
    low: "bg-ocean-success/15 text-ocean-success",
    medium: "bg-ocean-warning/15 text-ocean-warning",
    high: "bg-ocean-danger/15 text-ocean-danger",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styles[level] || styles.low}`}>
      {level} distress
    </span>
  );
}

function AssistantMessage({ message, streaming, onStreamComplete }) {
  const { displayed, done } = useStreamText(message.content, streaming);

  useEffect(() => {
    if (streaming && done && onStreamComplete) onStreamComplete();
  }, [streaming, done, onStreamComplete]);

  const isCrisis = message.distress_level === "high";
  const orbState = isCrisis ? "crisis" : streaming ? "responding" : "companion";
  const text = streaming ? displayed : message.content;

  return (
    <div className="flex gap-3 mb-5 message-enter max-w-[90%]">
      <ManasOrb state={orbState} size="sm" className="mt-1 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="glass-card px-5 py-4 rounded-3xl rounded-bl-lg bg-gradient-to-br from-ocean-secondary-soft/50 to-ocean-surface/30">
          <MessageContent content={text} streaming={streaming} />
          {streaming && displayed.length < message.content.length && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-ocean-accent animate-pulse align-middle" />
          )}
        </div>
        {message.distress_level && (
          <div className="mt-2 ml-1">
            <DistressBadge level={message.distress_level} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessageBubble({ message, streaming = false, onStreamComplete }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-5 message-enter">
        <div className="max-w-[80%] px-5 py-3.5 rounded-3xl rounded-br-lg bg-ocean-primary text-white shadow-lift">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return <AssistantMessage message={message} streaming={streaming} onStreamComplete={onStreamComplete} />;
}
