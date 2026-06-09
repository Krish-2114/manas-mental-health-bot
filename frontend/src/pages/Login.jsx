import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import AmbientBackground from "../components/design/AmbientBackground";
import GlassCard from "../components/design/GlassCard";
import ThemeToggle from "../components/design/ThemeToggle";
import ManasOrb from "../components/orb/ManasOrb";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await client.post("/auth/login", { username, password });
      localStorage.setItem("manas_token", data.token);
      localStorage.setItem("manas_username", data.username);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
      <AmbientBackground />
      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle compact />
      </div>

      <GlassCard className="relative z-10 w-full max-w-md p-8 md:p-10">
        <div className="text-center mb-8">
          <ManasOrb state={loading ? "thinking" : "idle"} size="md" className="mx-auto mb-5" />
          <h1 className="font-display text-3xl text-ocean-text-primary">Welcome back</h1>
          <p className="text-ocean-text-secondary mt-2">Your calm space is waiting.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-ocean-danger/10 text-ocean-danger text-sm border border-ocean-danger/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-ocean-text-primary mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="ocean-input"
              placeholder="Your username"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ocean-text-primary mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="ocean-input"
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in gently"}
          </button>
        </form>

        <p className="text-center text-sm text-ocean-text-secondary mt-6">
          New here?{" "}
          <Link to="/signup" className="text-ocean-primary font-medium hover:underline">
            Create account
          </Link>
          {" · "}
          <Link to="/about" className="text-ocean-primary font-medium hover:underline">
            About Manas
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
