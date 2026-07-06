import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import client from "../api/client";
import ChatSidebar from "../components/chat/ChatSidebar";
import MessageBubble from "../components/chat/MessageBubble";
import MoodEmptyState from "../components/chat/MoodEmptyState";
import TypingIndicator from "../components/chat/TypingIndicator";
import WellnessSidebar from "../components/chat/WellnessSidebar";
import CrisisSupport from "../components/crisis/CrisisSupport";
import BottomNav from "../components/layout/BottomNav";
import { useWellnessStore } from "../store/wellnessStore";
import { getErrorMessage } from "../utils/errors";

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const username = localStorage.getItem("manas_username") || "User";
  const logMood = useWellnessStore((s) => s.logMood);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCrisis, setShowCrisis] = useState(false);
  const [orbState, setOrbState] = useState("idle");

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!localStorage.getItem("manas_token")) navigate("/login");
    else fetchSessions();
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, streamingId]);

  useEffect(() => {
    if (loading) setOrbState("thinking");
    else if (showCrisis) setOrbState("crisis");
    else setOrbState("idle");
  }, [loading, showCrisis]);

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const { data } = await client.get("/sessions");
      setSessions(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load sessions."));
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadMessages = useCallback(async (sessionId) => {
    setMessagesLoading(true);
    setError("");
    try {
      const { data } = await client.get(`/sessions/${sessionId}`);
      setMessages(data);
      setShowCrisis(data.some((m) => m.distress_level === "high"));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load messages."));
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setLoading(true);
    setOrbState("listening");
    setError("");

    const optimisticUser = {
      role: "user",
      content: trimmed,
      distress_level: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const payload = { text: trimmed };
      if (activeSessionId) payload.session_id = activeSessionId;

      const { data } = await client.post("/chat", payload);

      if (!activeSessionId) {
        setActiveSessionId(data.session_id);
        await fetchSessions();
      } else {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === data.session_id ? { ...s, updated_at: new Date().toISOString() } : s
          )
        );
      }

      const assistantMsg = {
        role: "assistant",
        content: data.response ?? "",
        distress_level: data.distress,
        created_at: new Date().toISOString(),
        _id: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingId(assistantMsg._id);
      if (data.distress === "high") setShowCrisis(true);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError(getErrorMessage(err, "Failed to send message."));
    } finally {
      setLoading(false);
      setOrbState("idle");
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleMoodSelect = (key, mood) => {
    logMood(key);
    sendMessage(`I'm feeling ${mood.label.toLowerCase()} today. I'd like to talk about it.`);
  };

  const latestDistress = [...messages].reverse().find((m) => m.distress_level)?.distress_level;

  return (
    <div className="h-screen flex flex-col pb-16 md:pb-0">
      <CrisisSupport open={showCrisis} onDismiss={() => setShowCrisis(false)} />

      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar
          username={username}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={() => {
            setActiveSessionId(null);
            setMessages([]);
            setShowCrisis(false);
            setStreamingId(null);
          }}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setStreamingId(null);
            loadMessages(id);
          }}
          onDeleteSession={async (id) => {
            try {
              await client.delete(`/sessions/${id}`);
              setSessions((prev) => prev.filter((s) => s.id !== id));
              if (activeSessionId === id) {
                setActiveSessionId(null);
                setMessages([]);
                setShowCrisis(false);
              }
            } catch (err) {
              setError(getErrorMessage(err, "Failed to delete session."));
            }
          }}
          loading={sessionsLoading}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-ocean-bg/50">
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
            {messagesLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-ocean-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <MoodEmptyState onSelectMood={handleMoodSelect} />
            ) : (
              <div className="max-w-3xl mx-auto">
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={msg._id || msg.id || i}
                    message={msg}
                    streaming={msg._id === streamingId && msg.role === "assistant"}
                    onStreamComplete={() => setStreamingId(null)}
                  />
                ))}
                {loading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {error && (
            <div className="mx-4 md:mx-8 mb-2 p-3 glass-card text-ocean-danger text-sm rounded-2xl flex justify-between">
              <span>{typeof error === "string" ? error : String(error)}</span>
              <button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button>
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="border-t border-ocean-border glass-card rounded-none px-4 md:px-8 py-4"
          >
            <div className="flex gap-3 max-w-3xl mx-auto items-end">
              <label htmlFor="chat-input" className="sr-only">Message Manas</label>
              <textarea
                id="chat-input"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                disabled={loading}
                placeholder="Share what's on your mind..."
                className="ocean-input flex-1 resize-none min-h-[48px] max-h-32"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary !px-4 !py-3 shrink-0 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </main>

        <WellnessSidebar latestDistress={latestDistress} />
      </div>

      <BottomNav />
    </div>
  );
}
