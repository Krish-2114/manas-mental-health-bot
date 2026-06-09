import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import AmbientBackground from "../components/design/AmbientBackground";
import GlassCard from "../components/design/GlassCard";
import ThemeToggle from "../components/design/ThemeToggle";
import BottomNav from "../components/layout/BottomNav";
import ManasOrb from "../components/orb/ManasOrb";
import { completeOnboarding, needsOnboarding } from "../utils/onboarding";

const EMPTY_PORTFOLIO = {
  display_name: "",
  age: "",
  pronouns: "",
  bio: "",
  interests: "",
  coping_strategies: "",
  current_struggles: "",
  goals: "",
  preferred_tone: "warm",
  sos_enabled: false,
};

const EMPTY_CONTACT = { name: "", relationship_type: "", email: "", phone: "" };

export default function Settings() {
  const navigate = useNavigate();
  const isOnboarding = needsOnboarding();
  const username = localStorage.getItem("manas_username") || "";
  const [portfolio, setPortfolio] = useState(EMPTY_PORTFOLIO);
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState(EMPTY_CONTACT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("manas_token")) {
      navigate("/login");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [portfolioRes, contactsRes] = await Promise.all([
        client.get("/user/portfolio"),
        client.get("/user/emergency-contacts"),
      ]);
      const data = portfolioRes.data;
      setPortfolio({
        ...EMPTY_PORTFOLIO,
        ...data,
        age: data.age ?? "",
        display_name: data.display_name || (isOnboarding ? username : ""),
      });
      setContacts(contactsRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const savePortfolio = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...portfolio,
        age: portfolio.age ? Number(portfolio.age) : null,
      };
      const { data } = await client.put("/user/portfolio", payload);
      setPortfolio({ ...portfolio, ...data, age: data.age ?? "" });
      setSuccess("Personal profile saved. Manas will use this to personalize your chats.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const addContact = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const { data } = await client.post("/user/emergency-contacts", newContact);
      setContacts((prev) => [...prev, data]);
      setNewContact(EMPTY_CONTACT);
      setSuccess("Emergency contact added.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add contact.");
    }
  };

  const removeContact = async (id) => {
    try {
      await client.delete(`/user/emergency-contacts/${id}`);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to remove contact.");
    }
  };

  const finishOnboarding = async (skipSave = false) => {
    setError("");
    setSaving(true);
    if (!skipSave) {
      try {
        const payload = {
          ...portfolio,
          age: portfolio.age ? Number(portfolio.age) : null,
        };
        await client.put("/user/portfolio", payload);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to save profile. You can update it later in Settings.");
        setSaving(false);
        return;
      }
    }
    completeOnboarding();
    navigate("/chat");
  };

  const toggleSos = async () => {
    setError("");
    try {
      const { data } = await client.put("/user/portfolio", {
        sos_enabled: !portfolio.sos_enabled,
      });
      setPortfolio((prev) => ({ ...prev, sos_enabled: data.sos_enabled }));
      setSuccess(
        data.sos_enabled
          ? "SOS alerts enabled. Trusted contacts will be notified in a crisis."
          : "SOS alerts disabled."
      );
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update SOS setting.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <ManasOrb state="thinking" size="lg" />
        <p className="text-ocean-text-secondary text-sm">Preparing your space...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-20 md:pb-8">
      <AmbientBackground intensity="subtle" />
      <nav className="relative z-10 glass-card border-b border-ocean-border rounded-none px-6 py-4 flex items-center justify-between">
        {isOnboarding ? (
          <Link to="/about" className="text-ocean-primary hover:underline text-sm font-medium">
            About Manas
          </Link>
        ) : (
          <Link to="/chat" className="text-ocean-primary hover:underline text-sm font-medium">
            ← Back to chat
          </Link>
        )}
        <span className="font-display text-xl text-ocean-text-primary">
          {isOnboarding ? "Welcome to Manas" : "Settings"}
        </span>
        <ThemeToggle compact />
      </nav>

      <div className={`relative z-10 max-w-2xl mx-auto px-6 py-8 space-y-8 ${isOnboarding ? "pb-28" : ""}`}>
        {isOnboarding && (
          <section className="rounded-3xl p-6 text-white shadow-glow bg-gradient-to-r from-ocean-primary to-ocean-accent">
            <div className="flex items-center gap-4 mb-3">
              <ManasOrb state="listening" size="sm" />
              <p className="text-sm font-medium text-white/80">Step 1 of 2 — Quick setup</p>
            </div>
            <h2 className="text-xl font-bold mb-2">Let's personalize your space</h2>
            <p className="text-white/85 text-sm leading-relaxed">
              A few details help Manas support you better. Emergency contacts are optional — you can
              add them now or later. When you're ready, continue to your first chat.
            </p>
            <div className="flex gap-2 mt-4">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-medium">Profile</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-manas-100">
                SOS (optional)
              </span>
            </div>
          </section>
        )}
        {error && (
          <div className="p-3 glass-card text-ocean-danger text-sm rounded-2xl border border-ocean-danger/20">{error}</div>
        )}
        {success && (
          <div className="p-3 glass-card text-ocean-success text-sm rounded-2xl border border-ocean-success/20">{success}</div>
        )}

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-ocean-text-primary mb-1">
            {isOnboarding ? "Tell Manas about you" : "Personal Profile"}
          </h2>
          <p className="text-sm text-ocean-text-secondary mb-6">
            {isOnboarding
              ? "Start with your preferred name — everything else is optional and can be filled in later."
              : "Help Manas know you better for more personalized support."}
          </p>
          <form onSubmit={savePortfolio} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ocean-text-primary mb-1">Preferred name</label>
                <input
                  className="ocean-input text-sm !py-2"
                  value={portfolio.display_name}
                  onChange={(e) => setPortfolio({ ...portfolio, display_name: e.target.value })}
                  placeholder="Krish"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ocean-text-primary mb-1">Pronouns</label>
                <input
                  className="ocean-input text-sm !py-2"
                  value={portfolio.pronouns}
                  onChange={(e) => setPortfolio({ ...portfolio, pronouns: e.target.value })}
                  placeholder="he/him, she/her, they/them"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-text-primary mb-1">About you</label>
              <textarea
                className="ocean-input text-sm !py-2 min-h-[72px]"
                rows={2}
                value={portfolio.bio}
                onChange={(e) => setPortfolio({ ...portfolio, bio: e.target.value })}
                placeholder="A little about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-text-primary mb-1">Interests & hobbies</label>
              <input
                className="ocean-input text-sm !py-2"
                value={portfolio.interests}
                onChange={(e) => setPortfolio({ ...portfolio, interests: e.target.value })}
                placeholder="Music, reading, football..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-text-primary mb-1">What helps you cope</label>
              <textarea
                className="ocean-input text-sm !py-2 min-h-[72px]"
                rows={2}
                value={portfolio.coping_strategies}
                onChange={(e) => setPortfolio({ ...portfolio, coping_strategies: e.target.value })}
                placeholder="Walking, journaling, talking to friends..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-text-primary mb-1">Current struggles</label>
              <textarea
                className="ocean-input text-sm !py-2 min-h-[72px]"
                rows={2}
                value={portfolio.current_struggles}
                onChange={(e) => setPortfolio({ ...portfolio, current_struggles: e.target.value })}
                placeholder="Anxiety, sleep, work stress..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-text-primary mb-1">Personal goals</label>
              <textarea
                className="ocean-input text-sm !py-2 min-h-[72px]"
                rows={2}
                value={portfolio.goals}
                onChange={(e) => setPortfolio({ ...portfolio, goals: e.target.value })}
                placeholder="Better sleep, more confidence..."
              />
            </div>
            {!isOnboarding && (
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            )}
          </form>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-ocean-text-primary mb-1">
            {isOnboarding ? "SOS contacts (optional)" : "SOS Emergency Contacts"}
          </h2>
          <p className="text-sm text-ocean-text-secondary mb-4">
            Add up to 3 trusted people. When Manas detects a crisis (same as the red
            helpline banner — via safety check + distress classifier) and{" "}
            <strong>SOS Alerts are ON</strong>, they receive an email and/or SMS asking
            them to check on you. No message content is shared.
          </p>

          {contacts.length > 0 && (
            <div className="space-y-2 mb-4">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 bg-ocean-secondary-soft/50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-sm text-ocean-text-primary">{c.name}</p>
                    <p className="text-xs text-ocean-text-secondary">
                      {[c.relationship_type, c.email, c.phone].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button
                    onClick={() => removeContact(c.id)}
                    className="text-ocean-danger hover:opacity-80 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {contacts.length < 3 && (
            <form onSubmit={addContact} className="space-y-3 border-t border-ocean-border pt-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  className="ocean-input text-sm !py-2"
                  placeholder="Contact name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                />
                <input
                  className="ocean-input text-sm !py-2"
                  placeholder="Relationship (e.g. Mom, Friend)"
                  value={newContact.relationship_type}
                  onChange={(e) => setNewContact({ ...newContact, relationship_type: e.target.value })}
                />
              </div>
              <input
                type="email"
                className="ocean-input text-sm !py-2"
                placeholder="Email address"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />
              <input
                type="tel"
                className="ocean-input text-sm !py-2"
                placeholder="Phone number (e.g. +919876543210)"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />
              <button
                type="submit"
                className="btn-secondary w-full !py-2 text-sm"
              >
                Add Contact
              </button>
            </form>
          )}

          <div className={`mt-6 p-4 rounded-2xl border ${portfolio.sos_enabled ? "bg-ocean-warning/10 border-ocean-warning/30" : "bg-ocean-secondary-soft/30 border-ocean-border"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ocean-text-primary text-sm">
                  SOS Alerts: {portfolio.sos_enabled ? "ON" : "OFF"}
                </p>
                <p className="text-xs text-ocean-text-secondary mt-0.5">
                  {portfolio.sos_enabled
                    ? "Contacts notified when crisis banner appears"
                    : "Turn ON to email/SMS contacts when a crisis is detected"}
                </p>
              </div>
              <button
                onClick={toggleSos}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  portfolio.sos_enabled ? "bg-ocean-primary" : "bg-ocean-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    portfolio.sos_enabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>

      {isOnboarding && (
        <div className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-ocean-border rounded-none px-6 py-4 shadow-lg md:bottom-0">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => finishOnboarding(false)}
              disabled={saving}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save & continue to chat"}
            </button>
            <button
              onClick={() => finishOnboarding(true)}
              className="btn-secondary"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
