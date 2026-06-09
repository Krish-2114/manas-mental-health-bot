import { Link } from "react-router-dom";
import { LogOut, Plus, Search, Settings, Sparkles } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "../design/ThemeToggle";

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ChatSidebar({
  username,
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  loading,
}) {
  const [query, setQuery] = useState("");
  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  const logout = () => {
    localStorage.removeItem("manas_token");
    localStorage.removeItem("manas_username");
    window.location.href = "/login";
  };

  return (
    <aside className="hidden md:flex w-72 lg:w-80 flex-col h-full glass-card border-r border-ocean-border rounded-none shrink-0">
      <div className="p-5 border-b border-ocean-border">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="font-display text-xl text-ocean-primary">
            Manas
          </Link>
          <ThemeToggle compact />
        </div>
        <p className="text-sm text-ocean-text-secondary mb-4">
          Hello, <span className="text-ocean-text-primary font-medium">{username}</span>
        </p>
        <button type="button" onClick={onNewChat} className="btn-primary w-full !py-2.5 text-sm">
          <Plus size={18} /> New conversation
        </button>
        <div className="relative mt-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ocean-text-secondary" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="ocean-input !py-2 !pl-9 text-sm"
            aria-label="Search conversations"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-ocean-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-ocean-text-secondary text-sm py-10 px-3">
            {query ? "No matching conversations." : "Your conversations will appear here."}
          </p>
        ) : (
          filtered.map((session) => (
            <div
              key={session.id}
              className={`group relative rounded-2xl mb-1 transition-colors ${
                activeSessionId === session.id ? "bg-ocean-secondary-soft" : "hover:bg-ocean-surface/60"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectSession(session.id)}
                className="w-full text-left px-3 py-3 pr-9"
              >
                <p className="text-sm font-medium text-ocean-text-primary truncate">{session.title}</p>
                <p className="text-xs text-ocean-text-secondary mt-0.5">{relativeTime(session.updated_at)}</p>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-ocean-text-secondary hover:text-ocean-danger text-xs px-2"
                aria-label="Delete conversation"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-ocean-border space-y-1">
        <Link
          to="/wellness"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-ocean-text-secondary hover:text-ocean-primary hover:bg-ocean-secondary-soft transition-colors"
        >
          <Sparkles size={18} /> Wellness tools
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-ocean-text-secondary hover:text-ocean-primary hover:bg-ocean-secondary-soft transition-colors"
        >
          <Settings size={18} /> Settings
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-ocean-text-secondary hover:text-ocean-danger hover:bg-ocean-secondary-soft transition-colors"
        >
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </aside>
  );
}
