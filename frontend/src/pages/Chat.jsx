import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import CrisisBanner from "../components/CrisisBanner";
import MessageBubble from "../components/MessageBubble";
import Sidebar from "../components/Sidebar";

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const username = localStorage.getItem("manas_username") || "User";

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!localStorage.getItem("manas_token")) {
      navigate("/login");
      return;
    }
    fetchSessions();
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const { data } = await client.get("/sessions");
      setSessions(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load sessions.");
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
      const highDistress = data.some((m) => m.distress_level === "high");
      setShowCrisisBanner(highDistress);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load messages.");
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    loadMessages(sessionId);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setShowCrisisBanner(false);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await client.delete(`/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete session.");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setError("");

    const optimisticUser = {
      role: "user",
      content: text,
      distress_level: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const payload = { text };
      if (activeSessionId) payload.session_id = activeSessionId;

      const { data } = await client.post("/chat", payload);

      if (!activeSessionId) {
        setActiveSessionId(data.session_id);
        await fetchSessions();
      } else {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === data.session_id
              ? { ...s, updated_at: new Date().toISOString() }
              : s
          )
        );
      }

      const assistantMsg = {
        role: "assistant",
        content: data.response,
        distress_level: data.distress,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (data.distress === "high") setShowCrisisBanner(true);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError(err.response?.data?.detail || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {showCrisisBanner && (
        <CrisisBanner onDismiss={() => setShowCrisisBanner(false)} />
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          username={username}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          loading={sessionsLoading}
        />

        <main className="flex-1 flex flex-col bg-gray-50">
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
            {messagesLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-manas-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-manas-600 to-manas-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
                  M
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Hi, I'm Manas
                </h2>
                <p className="text-gray-500 max-w-sm">
                  I'm here to listen. Share what's on your mind — there's no judgment here.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} />
                ))}
                {loading && (
                  <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-manas-600 to-manas-500 flex items-center justify-center text-white text-xs font-bold">
                      M
                    </div>
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl shadow-sm flex items-center gap-1">
                      <span className="typing-dot w-2 h-2 bg-manas-400 rounded-full" />
                      <span className="typing-dot w-2 h-2 bg-manas-400 rounded-full" />
                      <span className="typing-dot w-2 h-2 bg-manas-400 rounded-full" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {error && (
            <div className="mx-4 md:mx-8 mb-2 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-600 ml-2"
              >
                ×
              </button>
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="border-t border-gray-100 bg-white px-4 md:px-8 py-4"
          >
            <div className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Share what's on your mind..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-manas-500/30 focus:border-manas-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-manas-600 to-manas-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
              >
                Send
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
