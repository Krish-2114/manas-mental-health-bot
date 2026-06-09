export default function CrisisBanner({ onDismiss }) {
  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-3 flex items-start gap-3 shadow-md">
      <div className="flex-1">
        <p className="font-semibold">We're concerned about you. Please reach out for help.</p>
        <p className="text-sm mt-1 opacity-90">
          iCall: <a href="tel:9152987821" className="underline font-medium">9152987821</a>
          {" · "}
          Vandrevala Foundation: <a href="tel:18602662345" className="underline font-medium">1860-2662-345</a>
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-white/80 hover:text-white text-xl leading-none px-1"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
