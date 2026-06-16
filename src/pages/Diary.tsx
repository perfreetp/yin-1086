import { useMemo, useState } from "react";
import {
  FileText,
  Search,
  AlertCircle,
  Sun,
  Moon,
  Coffee,
  TrendingUp,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import { useSleepCoachStore } from "../store";
import PageHeader from "../components/PageHeader";
import { CompletionBadge } from "../components/Badges";
import type { SleepDiary, Client } from "../types";
import { cn } from "../lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DiaryPage() {
  const clients = useSleepCoachStore((s) => s.clients);
  const diaries = useSleepCoachStore((s) => s.diaries);
  const [search, setSearch] = useState("");
  const [showAbnormal, setShowAbnormal] = useState(false);

  const clientDiaryStats = useMemo(() => {
    return clients
      .filter((c) => c.status !== "已结案")
      .map((c) => {
        const cDiaries = diaries.filter((d) => d.clientId === c.id);
        const last7 = cDiaries.slice(-7);
        const submitted = last7.filter((d) => d.submitted).length;
        const rate = Math.round((submitted / 7) * 100);
        const hasAbnormal = last7.some(
          (d) =>
            d.wakeDrift > 30 ||
            d.weekendCatchUp ||
            d.daytimeNap > 30 ||
            d.sleepEfficiency < 70
        );
        const avgEfficiency =
          last7.filter((d) => d.submitted).length > 0
            ? Math.round(
                last7
                  .filter((d) => d.submitted)
                  .reduce((s, d) => s + d.sleepEfficiency, 0) /
                  last7.filter((d) => d.submitted).length
              )
            : 0;
        return {
          client: c,
          rate,
          submitted,
          hasAbnormal,
          avgEfficiency,
          lastDiaries: last7,
        };
      })
      .filter((s) => {
        if (search && !s.client.name.includes(search)) return false;
        if (showAbnormal && !s.hasAbnormal) return false;
        return true;
      });
  }, [clients, diaries, search, showAbnormal]);

  const overallStats = useMemo(() => {
    const activeClients = clients.filter((c) => c.status !== "已结案");
    const totalExpected = activeClients.length * 7;
    const totalSubmitted = activeClients.reduce((sum, c) => {
      const last7 = diaries.filter((d) => d.clientId === c.id).slice(-7);
      return sum + last7.filter((d) => d.submitted).length;
    }, 0);
    const abnormalCount = clientDiaryStats.filter((s) => s.hasAbnormal).length;
    return {
      totalExpected,
      totalSubmitted,
      overallRate: Math.round((totalSubmitted / totalExpected) * 100),
      abnormalCount,
    };
  }, [clients, diaries, clientDiaryStats]);

  return (
    <div>
      <PageHeader
        title="日记审阅"
        subtitle="批量查看睡眠日记提交状态与异常指标"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-mint-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-mint-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">本周提交数</p>
              <p className="font-serif text-2xl font-semibold text-primary-800">
                {overallStats.totalSubmitted}
                <span className="text-sm font-normal text-slate-400">/{overallStats.totalExpected}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">整体完成率</p>
              <p className="font-serif text-2xl font-semibold text-primary-800">
                {overallStats.overallRate}%
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">异常指标</p>
              <p className="font-serif text-2xl font-semibold text-warning-600">
                {overallStats.abnormalCount} 人
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">活跃个案</p>
              <p className="font-serif text-2xl font-semibold text-primary-800">
                {clientDiaryStats.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索来访者..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className={cn(
              "btn-secondary flex items-center gap-2",
              showAbnormal && "bg-warning-50 border-warning-200 text-warning-600"
            )}
            onClick={() => setShowAbnormal(!showAbnormal)}
          >
            <Filter className="w-4 h-4" />
            {showAbnormal ? "仅显示异常" : "全部显示"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {clientDiaryStats.map(({ client, rate, submitted, hasAbnormal, avgEfficiency, lastDiaries }) => (
          <ClientDiaryRow
            key={client.id}
            client={client}
            rate={rate}
            submitted={submitted}
            hasAbnormal={hasAbnormal}
            avgEfficiency={avgEfficiency}
            lastDiaries={lastDiaries}
          />
        ))}
      </div>
    </div>
  );
}

function ClientDiaryRow({
  client,
  rate,
  submitted,
  hasAbnormal,
  avgEfficiency,
  lastDiaries,
}: {
  client: Client;
  rate: number;
  submitted: number;
  hasAbnormal: boolean;
  avgEfficiency: number;
  lastDiaries: SleepDiary[];
}) {
  const [expanded, setExpanded] = useState(false);
  const chartData = lastDiaries.map((d) => ({
    day: d.date.slice(5),
    效率: d.submitted ? d.sleepEfficiency : null,
  }));

  return (
    <div className="card overflow-hidden">
      <div
        className={cn(
          "flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors",
          hasAbnormal && "bg-warning-500/5"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0",
            client.gender === "女" ? "bg-rose-400" : "bg-primary-500"
          )}
        >
          {client.name.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base font-semibold text-slate-800">
              {client.name}
            </span>
            {hasAbnormal && (
              <span className="flex items-center gap-1 text-xs text-warning-600 bg-warning-500/10 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" />
                存在异常
              </span>
            )}
            <span className="text-xs text-slate-400">W{client.currentWeek}</span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-slate-500">
              本周提交 {submitted}/7 天
            </span>
            {avgEfficiency > 0 && (
              <span className="text-xs text-slate-500">
                平均睡眠效率 {avgEfficiency}%
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="flex gap-1">
            {lastDiaries.map((d) => (
              <DiaryDot key={d.id} diary={d} />
            ))}
          </div>
          <CompletionBadge rate={rate} />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-5 bg-slate-50/50">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-5">
              <h4 className="text-sm font-medium text-slate-700 mb-3">睡眠效率趋势</h4>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="效率"
                    stroke="#4ecdc4"
                    strokeWidth={2}
                    dot={{ fill: "#4ecdc4", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="col-span-7">
              <h4 className="text-sm font-medium text-slate-700 mb-3">每日明细</h4>
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {lastDiaries
                  .slice()
                  .reverse()
                  .map((d) => (
                    <DiaryDetailRow key={d.id} diary={d} />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DiaryDot({ diary }: { diary: SleepDiary }) {
  if (!diary.submitted) {
    return <div className="w-6 h-6 rounded-md bg-slate-100 border border-dashed border-slate-300" />;
  }
  const hasIssue =
    diary.wakeDrift > 30 || diary.weekendCatchUp || diary.daytimeNap > 30;
  return (
    <div
      className={cn(
        "w-6 h-6 rounded-md flex items-center justify-center",
        hasIssue ? "bg-warning-500/20 border border-warning-300" : "bg-mint-100"
      )}
    >
      {hasIssue && <AlertCircle className="w-3 h-3 text-warning-500" />}
    </div>
  );
}

function DiaryDetailRow({ diary }: { diary: SleepDiary }) {
  if (!diary.submitted) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-100 text-slate-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm flex-1">{diary.date}</span>
        <span className="text-xs">未提交</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-100">
      <div className="w-6 text-xs font-mono text-slate-500">{diary.date.slice(5)}</div>
      <div className="flex items-center gap-1 text-xs text-primary-600">
        <Moon className="w-3 h-3" />
        {diary.bedTime}
      </div>
      <span className="text-slate-300">→</span>
      <div className="flex items-center gap-1 text-xs text-mint-600">
        <Sun className="w-3 h-3" />
        {diary.wakeTime}
      </div>
      <span className="text-xs text-slate-500 ml-2">效率 {diary.sleepEfficiency}%</span>
      <div className="flex items-center gap-1 ml-auto">
        {diary.wakeDrift > 30 && (
          <span className="text-[10px] bg-warning-500/15 text-warning-600 px-1.5 py-0.5 rounded">
            起床漂移{diary.wakeDrift}分
          </span>
        )}
        {diary.weekendCatchUp && (
          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
            周末补觉
          </span>
        )}
        {diary.daytimeNap > 30 && (
          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Coffee className="w-2.5 h-2.5" />
            白天补眠{diary.daytimeNap}分
          </span>
        )}
      </div>
    </div>
  );
}
