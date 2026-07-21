import { computeSummary, type RouteResult } from "@/lib/route-mock";
import { StatCard } from "./StatCard";
import { RouteMap } from "./RouteMap";
import { DailyLogCard } from "./DailyLogCard";
import { ArrowLeft } from "lucide-react";

export function ResultsDashboard({
  result,
  onBack,
  originName,
  destinationName,
}: {
  result: RouteResult;
  onBack: () => void;
  originName?: string;
  destinationName?: string;
}) {
  const s = computeSummary(result);
  const eta = new Date(Date.now() + s.driveHours * 3600 * 1000);
  const etaStr = eta.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-rise">
        <div>
          <p className="eyebrow">HOS Compliance</p>
          <h2 className="text-3xl sm:text-4xl font-bold mt-1">Route ready</h2>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-chrome hover:text-foreground transition-colors border border-[color:var(--border)] rounded-md px-3 py-2 bg-black/30"
        >
          <ArrowLeft className="h-4 w-4" /> New trip
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Distance" value={s.distance.toLocaleString()} suffix="mi" delay={0} />
        <StatCard label="Total Drive Time" value={s.driveHours.toFixed(1)} suffix="hrs" delay={90} />
        <StatCard label="Rest Stops" value={s.stops} delay={180} />
        <StatCard label="Est. Arrival" value={etaStr} delay={270} />
      </div>

      <div className="animate-rise" style={{ animationDelay: "200ms" }}>
        <RouteMap
          routeGeometry={result.route_geometry}
          start={[result.pickup_coords[1], result.pickup_coords[0]]}
          end={[result.dropoff_coords[1], result.dropoff_coords[0]]}
          stops={buildStopMarkers(result)}
          originName={originName || "Origin"}
          destinationName={destinationName || "Destination"}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="eyebrow">Daily Logs</p>
            <h3 className="text-2xl font-bold mt-1">{s.days}-day breakdown</h3>
          </div>
          <p className="text-xs text-muted-foreground">Compliant with 70/8 cycle</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {result.daily_logs.map((log, i) => (
            <DailyLogCard
              key={log.day_number}
              day={log.day_number}
              segments={log.segments}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


import { decodePolyline } from "@/lib/polyline";

function buildStopMarkers(result: RouteResult) {
  const path = decodePolyline(result.route_geometry);
  if (path.length < 2) return [];

  const markerEvents = result.events.filter(
    (e) => e.mile_marker !== null && (e.label === "Fuel stop" || e.label.includes("break") || e.label.includes("Required rest"))
  );

  return markerEvents.map((e) => {
    const proportion = Math.min(1, Math.max(0, (e.mile_marker ?? 0) / result.total_distance_miles));
    const idx = Math.round(proportion * (path.length - 1));
    return {
      position: path[idx] as [number, number],
      label: e.label,
      type: e.label === "Fuel stop" ? "fuel" as const : "rest" as const,
    };
  });
}
