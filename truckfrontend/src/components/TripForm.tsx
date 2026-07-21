import { useState, type FormEvent } from "react";
import { MapPin, Navigation, Flag, ArrowRight } from "lucide-react";

export interface TripInput {
  current: string;
  pickup: string;
  dropoff: string;
  cycleUsed: number;
}

export function TripForm({
  onSubmit,
  loading,
}: {
  onSubmit: (v: TripInput) => void;
  loading: boolean;
}) {
  const [current, setCurrent] = useState("Chicago, IL");
  const [pickup, setPickup] = useState("Chicago, IL");
  const [dropoff, setDropoff] = useState("Denver, CO");
  const [cycle, setCycle] = useState(0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ current, pickup, dropoff, cycleUsed: cycle });
  };

  const pct = (cycle / 70) * 100;

  return (
    <form
      onSubmit={submit}
      className="chrome-card w-full max-w-2xl mx-auto p-6 sm:p-8 backdrop-blur-xl"
      style={{ background: "linear-gradient(180deg, oklch(0.19 0.006 260 / 0.85), oklch(0.14 0.006 260 / 0.85))" }}
    >
      <div className="mb-6">
        <p className="eyebrow">Trip Planner</p>
        <h2 className="text-2xl font-bold mt-1">Enter your run</h2>
      </div>

      <div className="space-y-4">
        <Field
          icon={<Navigation className="h-4 w-4" />}
          label="Current Location"
          value={current}
          onChange={setCurrent}
        />
        <Field
          icon={<MapPin className="h-4 w-4" />}
          label="Pickup Location"
          value={pickup}
          onChange={setPickup}
        />
        <Field
          icon={<Flag className="h-4 w-4" />}
          label="Dropoff Location"
          value={dropoff}
          onChange={setDropoff}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="eyebrow">Current Cycle Used</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCycle((c) => Math.max(0, Math.round((c - 0.5) * 10) / 10))}
                className="h-6 w-6 flex items-center justify-center rounded-md border border-[color:var(--border)] bg-black/40 text-chrome hover:text-foreground hover:border-[color:var(--primary-glow)] transition-colors"
              >
                −
              </button>
              <span className="text-xs font-mono px-2 py-1 rounded-md border border-[color:var(--border)] bg-black/40 text-chrome min-w-[72px] text-center">
                {cycle} / 70 hrs
              </span>
              <button
                type="button"
                onClick={() => setCycle((c) => Math.min(70, Math.round((c + 0.5) * 10) / 10))}
                className="h-6 w-6 flex items-center justify-center rounded-md border border-[color:var(--border)] bg-black/40 text-chrome hover:text-foreground hover:border-[color:var(--primary-glow)] transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <div className="relative h-2 rounded-full bg-[oklch(0.2_0.006_260)] border border-[color:var(--border)] overflow-visible">
            <div
              className="absolute inset-y-0 left-0 bg-red-gradient rounded-full"
              style={{
                width: `${pct}%`,
                boxShadow: "0 0 12px oklch(0.55 0.22 25 / 0.6)",
              }}
            />
            <div
              className="absolute top-1/2 h-4 w-4 rounded-full bg-white border-2 border-[color:var(--primary)] shadow-[0_0_10px_oklch(0.55_0.22_25/0.7)] pointer-events-none"
              style={{
                left: `${pct}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={70}
            step={0.5}
            value={cycle}
            onChange={(e) => setCycle(Number(e.target.value))}
            className="w-full mt-1 accent-[color:var(--primary)] opacity-0 h-6 -mt-4 relative cursor-pointer"
          />
          <p className="mt-2 text-[11px] text-muted-foreground/70 text-center">
            Drag the handle or use −/+ to adjust
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative mt-8 w-full overflow-hidden rounded-lg py-3.5 font-display font-semibold tracking-wide text-primary-foreground bg-red-gradient glow-red transition-transform active:scale-[0.98] disabled:opacity-70"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? "Calculating…" : "Calculate Route"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
        <span
          className="absolute inset-y-0 -left-1/3 w-1/3 bg-white/15 blur-md pointer-events-none opacity-0 group-hover:opacity-100"
          style={{ animation: "shine-sweep 1.1s ease-out" }}
        />
      </button>
    </form>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block group">
      <span className="eyebrow">{label}</span>
      <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-[oklch(0.13_0.006_260)] px-4 py-3 transition-colors focus-within:border-[color:var(--primary-glow)] focus-within:shadow-[0_0_0_3px_oklch(0.55_0.22_25/0.15)]">
        <span className="text-chrome/80">{icon}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 text-sm"
          placeholder="City, State"
        />
      </div>
    </label>
  );
}
