export function StatCard({
  label,
  value,
  suffix,
  delay = 0,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  delay?: number;
}) {
  return (
    <div
      className="chrome-card p-5 sm:p-6 animate-rise"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="eyebrow">{label}</p>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[color:var(--primary-glow)]"
          style={{ textShadow: "0 0 24px oklch(0.55 0.22 25 / 0.35)" }}
        >
          {value}
        </span>
        {suffix ? (
          <span className="text-sm text-chrome/80 font-medium">{suffix}</span>
        ) : null}
      </div>
    </div>
  );
}
