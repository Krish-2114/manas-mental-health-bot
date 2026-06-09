import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-manas-50 via-white to-purple-50">
      <div className="absolute top-20 left-10 w-64 h-64 bg-manas-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-manas-500/5 rounded-full blur-3xl" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-2xl font-bold bg-gradient-to-r from-manas-600 to-manas-500 bg-clip-text text-transparent">
          Manas
        </span>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-medium text-manas-600 hover:bg-manas-50 rounded-xl transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-manas-600 to-manas-500 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-manas-700 via-manas-600 to-manas-500 bg-clip-text text-transparent mb-6">
          Manas
        </h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          A safe space to talk. Manas is here to listen.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/signup"
            className="px-8 py-3.5 text-white bg-gradient-to-r from-manas-600 to-manas-500 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3.5 text-manas-600 border border-manas-200 bg-white rounded-xl font-semibold hover:bg-manas-50 transition-colors"
          >
            I have an account
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {[
            { title: "Always listening", desc: "Share what's on your mind, anytime." },
            { title: "Private & safe", desc: "Your conversations are yours alone." },
            { title: "Crisis aware", desc: "Built-in safety for when you need help." },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white/80 backdrop-blur rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
