import { Link, useLocation } from "react-router-dom";
import { Heart, MessageCircle, Settings, User } from "lucide-react";

const TABS = [
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/wellness", icon: Heart, label: "Wellness" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-card border-t border-ocean-border rounded-none px-2 py-2 safe-area-pb"
      aria-label="Main navigation"
    >
      <div className="flex justify-around">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[4.5rem] transition-colors ${
                active ? "text-ocean-primary" : "text-ocean-text-secondary"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
