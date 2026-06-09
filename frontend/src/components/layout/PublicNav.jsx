import { Link } from "react-router-dom";
import ThemeToggle from "../design/ThemeToggle";

export default function PublicNav() {
  return (
    <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
      <Link to="/" className="font-display text-2xl text-ocean-primary tracking-tight">
        Manas
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/about" className="hidden sm:inline px-4 py-2 text-sm font-medium text-ocean-text-secondary hover:text-ocean-primary transition-colors">
          About
        </Link>
        <ThemeToggle compact />
        <Link to="/login" className="px-4 py-2 text-sm font-medium text-ocean-primary hover:bg-ocean-secondary-soft rounded-xl transition-colors">
          Login
        </Link>
        <Link to="/signup" className="btn-primary !py-2 !px-5 text-sm">
          Begin gently
        </Link>
      </div>
    </nav>
  );
}
