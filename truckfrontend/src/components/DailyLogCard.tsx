import { useEffect, useRef, useState } from "react";
import type { EventType, DailySegment } from "@/lib/route-mock";

const ROWS: { type: EventType; label: string; short: string }[] = [
  { type: "off_duty", label: "Off Duty", short: "1" },
  { type: "sleeper_berth", label: "Sleeper Berth", short: "2" },
  { type: "driving", label: "Driving", short: "3" },
  { type: "on_duty", label: "On Duty (Not Driving)", short: "4" },
];

const ROW_INDEX: Record<EventType, number> = {
  off_duty: 0,
  sleeper_berth: 1,
  driving: 2,
  on_duty: 3,
};

// Grid geometry (SVG units)
const LEFT = 0;
const RIGHT = 720;
const TOP = 0;
const ROW_H = 34;
const GRID_W = RIGHT - LEFT;
const GRID_H = ROW_H * 4;

const HOUR_LABELS = [
  "Mid",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "Noon",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "Mid",
];

function buildPath(segments: DailySegment[]): string {
  if (!segments.length) return "";
  const rowY = (r: number) => TOP + r * ROW_H + ROW_H / 2;
  const x = (h: number) => LEFT + (h / 24) * GRID_W;
  const sorted = [...segments].sort((a, b) => a.start_hr - b.start_hr);
  let d = "";
  let prevRow = ROW_INDEX[sorted[0].type];
  d += `M ${x(sorted[0].start_hr)} ${rowY(prevRow)} `;
  for (const s of sorted) {
    const row = ROW_INDEX[s.type];
    if (row !== prevRow) {
      // vertical jump at s.start_hr
      d += `L ${x(s.start_hr)} ${rowY(row)} `;
      prevRow = row;
    }
    d += `L ${x(s.end_hr)} ${rowY(row)} `;
  }
  return d.trim();
}

export function DailyLogCard({
  day,
  segments,
  index,
}: {
  day: number;
  segments: DailySegment[];
  index: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, [segments]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const totals = ROWS.map((r) =>
    segments
      .filter((s) => s.type === r.type)
      .reduce((a, s) => a + (s.end_hr - s.start_hr), 0),
  );
  const drivingTotal = totals[2];

  const d = buildPath(segments);

  return (
    <div
      ref={ref}
      className="chrome-card p-5 sm:p-6 animate-rise"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <p className="eyebrow">Day {day}</p>
          <h3 className="text-lg font-semibold mt-1">Driver's Daily Log</h3>
        </div>
        <div className="text-right">
          <p className="eyebrow">Drive</p>
          <p className="font-display text-xl font-bold text-[color:var(--primary-glow)]">
            {drivingTotal.toFixed(1)}h
          </p>
        </div>
      </div>

      <div className="rounded-md border border-[color:var(--border)] bg-[oklch(0.11_0.006_260)] p-3 sm:p-4 overflow-x-auto">
        <div className="min-w-[520px]">
          {/* Grid + labels using CSS grid: [labels | svg | totals] */}
          <div
            className="grid gap-2 items-stretch"
            style={{ gridTemplateColumns: "112px 1fr 44px" }}
          >
            {/* Top-left spacer */}
            <div />
            {/* Hour labels */}
            <div className="relative h-4 text-[9px] font-mono text-chrome/70">
              {HOUR_LABELS.map((l, i) => (
                <span
                  key={i}
                  className="absolute -translate-x-1/2 top-0"
                  style={{ left: `${(i / 24) * 100}%` }}
                >
                  {l}
                </span>
              ))}
            </div>
            <div className="text-[9px] font-mono text-chrome/70 text-center">
              Total
            </div>

            {/* Row labels column */}
            <div className="flex flex-col">
              {ROWS.map((r) => (
                <div
                  key={r.type}
                  className="flex items-center justify-end gap-2 pr-2 text-[11px] text-muted-foreground"
                  style={{ height: ROW_H }}
                >
                  <span className="font-mono text-chrome/50">{r.short}.</span>
                  <span className="text-right leading-tight">{r.label}</span>
                </div>
              ))}
            </div>

            {/* SVG grid */}
            <svg
              viewBox={`0 0 ${GRID_W} ${GRID_H}`}
              preserveAspectRatio="none"
              className="w-full"
              style={{ height: ROW_H * 4 }}
            >
              <defs>
                <linearGradient id={`stepGrad-${day}`} x1="0" x2="1">
                  <stop offset="0%" stopColor="oklch(0.55 0.22 25)" />
                  <stop offset="100%" stopColor="oklch(0.65 0.22 25)" />
                </linearGradient>
                <filter id={`stepGlow-${day}`} x="-5%" y="-20%" width="110%" height="140%">
                  <feGaussianBlur stdDeviation="1.4" />
                </filter>
              </defs>

              {/* Row backgrounds (alternating gunmetal) */}
              {ROWS.map((_, r) => (
                <rect
                  key={r}
                  x={0}
                  y={r * ROW_H}
                  width={GRID_W}
                  height={ROW_H}
                  fill={
                    r % 2 === 0
                      ? "oklch(0.16 0.006 260)"
                      : "oklch(0.19 0.006 260)"
                  }
                />
              ))}

              {/* Row separators */}
              {[0, 1, 2, 3, 4].map((r) => (
                <line
                  key={`h-${r}`}
                  x1={0}
                  x2={GRID_W}
                  y1={r * ROW_H}
                  y2={r * ROW_H}
                  stroke="oklch(0.32 0.006 260 / 0.7)"
                  strokeWidth={1}
                />
              ))}

              {/* Hour tick columns */}
              {Array.from({ length: 25 }).map((_, i) => {
                const x = (i / 24) * GRID_W;
                const isMajor = i % 6 === 0;
                return (
                  <line
                    key={`v-${i}`}
                    x1={x}
                    x2={x}
                    y1={0}
                    y2={GRID_H}
                    stroke={
                      isMajor
                        ? "oklch(0.4 0.006 260 / 0.8)"
                        : "oklch(0.3 0.006 260 / 0.45)"
                    }
                    strokeWidth={isMajor ? 1 : 0.5}
                  />
                );
              })}

              {/* Quarter-hour minor ticks inside each row */}
              {Array.from({ length: 24 * 4 + 1 }).map((_, i) => {
                if (i % 4 === 0) return null;
                const x = (i / (24 * 4)) * GRID_W;
                const isHalf = i % 2 === 0;
                const len = isHalf ? 5 : 3;
                return ROWS.map((_, r) => (
                  <line
                    key={`m-${i}-${r}`}
                    x1={x}
                    x2={x}
                    y1={r * ROW_H}
                    y2={r * ROW_H + len}
                    stroke="oklch(0.36 0.006 260 / 0.5)"
                    strokeWidth={0.5}
                  />
                ));
              })}

              {/* Step line (glow underlay) */}
              <path
                d={d}
                fill="none"
                stroke={`url(#stepGrad-${day})`}
                strokeWidth={4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#stepGlow-${day})`}
                opacity={0.55}
                style={{
                  strokeDasharray: pathLen || 2000,
                  strokeDashoffset: visible ? 0 : pathLen || 2000,
                  transition:
                    "stroke-dashoffset 1.4s cubic-bezier(0.22,0.7,0.2,1)",
                }}
              />
              {/* Step line (crisp) */}
              <path
                ref={pathRef}
                d={d}
                fill="none"
                stroke={`url(#stepGrad-${day})`}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: pathLen || 2000,
                  strokeDashoffset: visible ? 0 : pathLen || 2000,
                  transition:
                    "stroke-dashoffset 1.4s cubic-bezier(0.22,0.7,0.2,1)",
                }}
              />
            </svg>

            {/* Totals column */}
            <div className="flex flex-col">
              {totals.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center text-[11px] font-mono text-chrome"
                  style={{ height: ROW_H }}
                >
                  {t.toFixed(1)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
