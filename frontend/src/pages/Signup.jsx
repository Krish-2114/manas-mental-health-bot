import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import AmbientBackground from "../components/design/AmbientBackground";
import GlassCard from "../components/design/GlassCard";
import ThemeToggle from "../components/design/ThemeToggle";
import ManasOrb from "../components/orb/ManasOrb";
import { startOnboarding } from "../utils/onboarding";

export default function Signup() {
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
      const { data } = await client.post("/auth/register", { username, password });
      localStorage.setItem("manas_token", data.token);
      localStorage.setItem("manas_username", data.username);
      startOnboarding();
      navigate("/settings");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
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
          <ManasOrb state={loading ? "thinking" : "listening"} size="md" className="mx-auto mb-5" />
          <h1 className="font-display text-3xl text-ocean-text-primary">Begin gently</h1>
          <p className="text-ocean-text-secondary mt-2">
            Create your account — we'll personalize your space together.
          </p>
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
              minLength={3}
              className="ocean-input"
              placeholder="Choose a username"
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
              minLength={6}
              className="ocean-input"
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Creating your space..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-ocean-text-secondary mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-ocean-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
