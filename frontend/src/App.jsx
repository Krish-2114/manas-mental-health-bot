import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ManasOrb from "./components/orb/ManasOrb";
import { needsOnboarding } from "./utils/onboarding";

const Landing = lazy(() => import("./pages/Landing"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Chat = lazy(() => import("./pages/Chat"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Wellness = lazy(() => import("./pages/Wellness"));

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <ManasOrb state="thinking" size="lg" />
      <p className="text-ocean-text-secondary text-sm">Loading your calm space...</p>
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("manas_token");
  return token ? children : <Navigate to="/login" replace />;
}

function ChatRoute({ children }) {
  const token = localStorage.getItem("manas_token");
  if (!token) return <Navigate to="/login" replace />;
  if (needsOnboarding()) return <Navigate to="/settings" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/chat"
            element={
              <ChatRoute>
                <Chat />
              </ChatRoute>
            }
          />
          <Route
            path="/wellness"
            element={
              <PrivateRoute>
                <Wellness />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
