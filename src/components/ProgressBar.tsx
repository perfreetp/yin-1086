interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

export default function ProgressBar({ value, max, className = "" }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  let color = "bg-primary-500";
  if (pct >= 80) color = "bg-mint-500";
  else if (pct < 40) color = "bg-warning-500";

  return (
    <div className={`w-full h-1.5 bg-slate-100 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
