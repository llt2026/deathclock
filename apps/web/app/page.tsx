export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-5xl font-display">More Minutes</h1>
      <p className="text-accent max-w-md text-center">
        10-second life expectancy predictor & live countdown. Your time starts
        now.
      </p>
      <a
        href="/calc"
        className="px-6 py-3 bg-primary text-white rounded-md hover:opacity-90 transition"
      >
        Start Now
      </a>
    </main>
  );
} 