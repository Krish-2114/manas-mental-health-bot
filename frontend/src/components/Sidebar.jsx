import { Link } from "react-router-dom";

function getInitials(username) {
  return username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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

export default function Sidebar({
  username,
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  loading,
}) {
  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-manas-600 to-manas-500 flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(username)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{username}</p>
            <Link to="/profile" className="text-xs text-manas-600 hover:underline">
              View profile
            </Link>
          </div>
        </div>
        <button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-manas-600 to-manas-500 text-white py-2.5 px-4 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-manas-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8 px-4">
            No conversations yet. Start a new chat!
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`group relative rounded-xl mb-1 ${
                activeSessionId === session.id
                  ? "bg-manas-50 border border-manas-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <button
                onClick={() => onSelectSession(session.id)}
                className="w-full text-left px-3 py-2.5 pr-8"
              >
                <p className="text-sm font-medium text-gray-800 truncate">
                  {session.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {relativeTime(session.updated_at)}
                </p>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                aria-label="Delete session"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
