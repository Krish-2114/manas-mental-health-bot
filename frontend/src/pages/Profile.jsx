import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import client from "../api/client";

const DISTRESS_MAP = { low: 0, medium: 1, high: 2 };
const DISTRESS_LABELS = { 0: "Low", 1: "Medium", 2: "High" };

function getInitials(username) {
  return username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("manas_token")) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await client.get("/user/profile");
        setProfile(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const chartData =
    profile?.mood_history.map((entry) => ({
      date: entry.date.slice(5),
      level: DISTRESS_MAP[entry.distress_level] ?? 0,
      label: entry.distress_level,
    })) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-manas-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-manas-600 text-white rounded-xl text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-manas-50 via-white to-purple-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link
          to="/chat"
          className="text-manas-600 hover:underline text-sm font-medium"
        >
          ← Back to chat
        </Link>
        <span className="text-lg font-bold bg-gradient-to-r from-manas-600 to-manas-500 bg-clip-text text-transparent">
          Manas
        </span>
        <div className="w-24" />
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-manas-600 to-manas-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            {getInitials(profile.username)}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
          <p className="text-gray-500 mt-1">
            Joined {new Date(profile.joined_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="mt-6 inline-block bg-manas-50 border border-manas-100 rounded-xl px-6 py-3">
            <p className="text-3xl font-bold text-manas-600">{profile.total_sessions}</p>
            <p className="text-sm text-gray-500">Total sessions</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mood History (30 days)</h2>
          {chartData.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              No mood data yet. Start chatting to see your history.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis
                  domain={[0, 2]}
                  ticks={[0, 1, 2]}
                  tickFormatter={(v) => DISTRESS_LABELS[v]}
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                />
                <Tooltip
                  formatter={(value, _name, props) => [
                    DISTRESS_LABELS[value],
                    "Distress",
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  dot={{ fill: "#7C3AED", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
