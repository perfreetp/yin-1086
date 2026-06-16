import type { ClientStatus, AlertLevel, Intensity } from "../types";
import { cn } from "../lib/utils";

export function StatusBadge({ status }: { status: ClientStatus }) {
  const styles: Record<ClientStatus, string> = {
    进行中: "bg-mint-100 text-mint-700",
    待跟进: "bg-primary-100 text-primary-700",
    已结案: "bg-slate-100 text-slate-600",
    预警: "bg-warning-500/10 text-warning-600",
  };
  return <span className={cn("badge", styles[status])}>{status}</span>;
}

export function IntensityBadge({ intensity }: { intensity: Intensity | "通用" }) {
  const styles: Record<Intensity | "通用", string> = {
    入门: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    标准: "bg-primary-50 text-primary-700 border border-primary-200",
    强化: "bg-warning-500/10 text-warning-600 border border-warning-200",
    通用: "bg-slate-50 text-slate-600 border border-slate-200",
  };
  return <span className={cn("badge border", styles[intensity])}>{intensity}</span>;
}

export function AlertLevelBadge({ level }: { level: AlertLevel }) {
  const styles: Record<AlertLevel, string> = {
    low: "bg-slate-100 text-slate-600",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-warning-500/15 text-warning-600",
  };
  const labels: Record<AlertLevel, string> = {
    low: "一般",
    medium: "注意",
    high: "紧急",
  };
  return <span className={cn("badge", styles[level])}>{labels[level]}</span>;
}

export function CompletionBadge({ rate }: { rate: number }) {
  let color = "bg-warning-500/15 text-warning-600";
  if (rate >= 80) color = "bg-mint-100 text-mint-700";
  else if (rate >= 50) color = "bg-amber-100 text-amber-700";
  return (
    <span className={cn("badge font-mono", color)}>
      {rate}%
    </span>
  );
}
