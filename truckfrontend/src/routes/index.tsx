import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TripForm, type TripInput } from "@/components/TripForm";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import type { RouteResult } from "@/lib/route-mock";
import { fetchTrip } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RouteLog — Plan smarter. Drive compliant." },
      {
        name: "description",
        content:
          "Trip planning and Hours-of-Service compliance for professional truck drivers.",
      },
      { property: "og:title", content: "RouteLog — Plan smarter. Drive compliant." },
      {
        property: "og:description",
        content: "Premium HOS trip planning built for the road.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [view, setView] = useState<"hero" | "form" | "results">("hero");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const startPlanning = () => {
    setView("form");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  const [tripResult, setTripResult] = useState<RouteResult | null>(null);
  const [tripInput, setTripInput] = useState<TripInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (v: TripInput) => {
    setLoading(true);
    setError(null);
    setTripInput(v);
    try {
      const data = await fetchTrip({
        current_location: v.current,
        pickup_location: v.pickup,
        dropoff_location: v.dropoff,
        current_cycle_used_hr: v.cycleUsed,
      });
      setTripResult(data);
      setView("results");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to calculate route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-dusk overflow-hidden">
      <NavBar />

      {/* HERO */}
      <section className="relative pt-28 sm:pt-32 pb-20 sm:pb-28 px-4">
        <HeroBackdrop />
        <div className="relative max-w-5xl mx-auto text-center">
          <p className="eyebrow animate-rise" style={{ animationDelay: "80ms" }}>
            HOS-Compliant Trip Planning
          </p>
          <h1
            className="mt-4 font-display font-bold tracking-tight text-5xl sm:text-7xl lg:text-8xl animate-rise"
            style={{ animationDelay: "200ms" }}
          >
            Route<span className="text-[color:var(--primary-glow)]">Log</span>
          </h1>
          <p
            className="mt-5 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto animate-rise"
            style={{ animationDelay: "340ms" }}
          >
            Plan smarter. Drive compliant.
          </p>
          <div
            className="mt-9 flex justify-center animate-rise"
            style={{ animationDelay: "480ms" }}
          >
            <button
              onClick={startPlanning}
              className="group relative overflow-hidden rounded-lg bg-red-gradient text-primary-foreground font-display font-semibold px-8 py-3.5 glow-red transition-transform active:scale-[0.98] hover:scale-[1.02]"
            >
              <span className="relative z-10">Plan a Trip</span>
              <span
                className="absolute inset-y-0 -left-1/3 w-1/3 bg-white/15 blur-md opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{ animation: "shine-sweep 1.1s ease-out" }}
              />
            </button>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section
        ref={formRef}
        className={`relative px-4 pb-20 transition-all duration-700 ${
          view === "hero" ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100"
        }`}
      >
        {view !== "results" && (
          <div className="max-w-2xl mx-auto">
            <TripForm onSubmit={handleSubmit} loading={loading} />
            {error && (
              <p className="mt-4 text-center text-sm text-red-400">
                {error} — is your Django server running on port 8000?
              </p>
            )}
          </div>
        )}
      </section>

      {/* RESULTS */}
      <section
        ref={resultsRef}
        className={`relative px-4 pb-28 transition-all duration-700 ${
          view === "results" ? "opacity-100" : "opacity-0 translate-y-4 pointer-events-none h-0"
        }`}
      >
        {view === "results" && (
          <div className="max-w-6xl mx-auto">
            <ResultsDashboard
              result={tripResult!}
              originName={tripInput?.pickup ?? ""}
              destinationName={tripInput?.dropoff ?? ""}
              onBack={() => {
                setView("form");
                setTimeout(
                  () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
                  60,
                );
              }}
            />
          </div>
        )}
      </section>

      <footer className="relative border-t border-[color:var(--border)] py-8 px-4 text-center text-xs text-muted-foreground">
        <p className="eyebrow">RouteLog</p>
        <p className="mt-2">© {new Date().getFullYear()} · Built for the long haul.</p>
      </footer>
    </main>
  );
}

function NavBar() {
  return (
    <header className="absolute top-0 inset-x-0 z-20 px-4 sm:px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="relative h-7 w-7 rounded-md bg-red-gradient glow-red flex items-center justify-center">
          <span className="text-primary-foreground font-display font-bold text-sm">R</span>
        </div>
        <span className="font-display font-semibold tracking-tight text-lg">
          Route<span className="text-[color:var(--primary-glow)]">Log</span>
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-6 text-xs">
        <span className="eyebrow">HOS Compliance</span>
        <span className="h-4 w-px bg-[color:var(--border)]" />
        <span className="text-muted-foreground font-mono">v1.0</span>
      </div>
    </header>
  );
}

function HeroBackdrop() {
  // Animated glowing route line across the dusk sky
  const [play, setPlay] = useState(false);
  const ref = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(1400);
  useEffect(() => {
    if (ref.current) setLen(ref.current.getTotalLength());
    const id = requestAnimationFrame(() => setPlay(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-[70%] opacity-80"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="heroRoute" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.6 0.22 25 / 0)" />
            <stop offset="20%" stopColor="oklch(0.6 0.22 25 / 0.9)" />
            <stop offset="80%" stopColor="oklch(0.6 0.22 25 / 0.9)" />
            <stop offset="100%" stopColor="oklch(0.6 0.22 25 / 0)" />
          </linearGradient>
          <filter id="heroGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <path
          d="M -20 340 C 200 320, 320 220, 500 240 S 780 340, 950 260 S 1150 180, 1250 200"
          fill="none"
          stroke="url(#heroRoute)"
          strokeWidth="14"
          strokeLinecap="round"
          filter="url(#heroGlow)"
          opacity="0.55"
          style={{
            strokeDasharray: len,
            strokeDashoffset: play ? 0 : len,
            transition: "stroke-dashoffset 2.4s cubic-bezier(0.22,0.7,0.2,1)",
          }}
        />
        <path
          ref={ref}
          d="M -20 340 C 200 320, 320 220, 500 240 S 780 340, 950 260 S 1150 180, 1250 200"
          fill="none"
          stroke="url(#heroRoute)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            strokeDasharray: len,
            strokeDashoffset: play ? 0 : len,
            transition: "stroke-dashoffset 2.4s cubic-bezier(0.22,0.7,0.2,1)",
          }}
        />
      </svg>
    </div>
  );
}
