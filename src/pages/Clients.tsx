import { useState, useMemo } from "react";
import { Search, Plus, Phone, AlertTriangle, CalendarDays, Target, ChevronRight, Users } from "lucide-react";
import { useSleepCoachStore } from "../store";
import PageHeader from "../components/PageHeader";
import { StatusBadge, IntensityBadge, CompletionBadge } from "../components/Badges";
import ProgressBar from "../components/ProgressBar";
import type { Client, ClientStatus, ProgramType, Intensity } from "../types";
import { cn } from "../lib/utils";

function ClientCard({ client, onClick }: { client: Client; onClick: () => void }) {
  const totalWeeks = client.programType === "6周" ? 6 : 8;
  const alertCount = useSleepCoachStore((s) =>
    s.getClientAlerts(client.id).filter((a) => !a.resolved).length
  );

  return (
    <div
      className="card card-hover p-5 cursor-pointer animate-slide-up"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center text-white font-medium text-sm",
              client.gender === "女" ? "bg-rose-400" : "bg-primary-500"
            )}
          >
            {client.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-semibold text-slate-800">
                {client.name}
              </h3>
              {alertCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-warning-500 animate-pulse" />
              )}
            </div>
            <p className="text-xs text-slate-500">
              {client.gender} · {client.age}岁 · {client.phone}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={client.status} />
          <IntensityBadge intensity={client.intensity} />
          <CompletionBadge rate={client.diaryCompletionRate} />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-slate-500 text-xs">
              第 {client.currentWeek}/{totalWeeks} 周 · {client.programType}
            </span>
            <span className="font-mono text-xs text-primary-600 font-medium">
              {client.sleepWindowBed} - {client.sleepWindowWake}
            </span>
          </div>
          <ProgressBar value={client.currentWeek} max={totalWeeks} />
        </div>

        {client.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap pt-1">
            {client.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
          <CalendarDays className="w-3 h-3" />
          <span>最近联系 {client.lastContactDate}</span>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const clients = useSleepCoachStore((s) => s.clients);
  const setSelectedClient = useSleepCoachStore((s) => s.setSelectedClient);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ClientStatus | "全部">("全部");
  const [filterProgram, setFilterProgram] = useState<ProgramType | "全部">("全部");
  const [filterIntensity, setFilterIntensity] = useState<Intensity | "全部">("全部");

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (search && !c.name.includes(search) && !c.tags.some((t) => t.includes(search)))
        return false;
      if (filterStatus !== "全部" && c.status !== filterStatus) return false;
      if (filterProgram !== "全部" && c.programType !== filterProgram) return false;
      if (filterIntensity !== "全部" && c.intensity !== filterIntensity) return false;
      return true;
    });
  }, [clients, search, filterStatus, filterProgram, filterIntensity]);

  const stats = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter((c) => c.status === "进行中").length,
      alert: clients.filter((c) => c.status === "预警").length,
      avgRate: Math.round(
        clients.reduce((sum, c) => sum + c.diaryCompletionRate, 0) / clients.length
      ),
    };
  }, [clients]);

  return (
    <div>
      <PageHeader
        title="个案列表"
        subtitle="管理所有来访者的干预进度与状态追踪"
        actions={
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建个案
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">总个案数</p>
              <p className="font-serif text-2xl font-semibold text-primary-800">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-mint-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-mint-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">进行中</p>
              <p className="font-serif text-2xl font-semibold text-primary-800">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">需预警</p>
              <p className="font-serif text-2xl font-semibold text-warning-600">{stats.alert}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">平均日记完成率</p>
              <p className="font-serif text-2xl font-semibold text-primary-800">{stats.avgRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索姓名或标签..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ClientStatus | "全部")}
          >
            <option value="全部">全部状态</option>
            <option value="进行中">进行中</option>
            <option value="待跟进">待跟进</option>
            <option value="预警">预警</option>
            <option value="已结案">已结案</option>
          </select>
          <select
            className="input-field w-auto"
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value as ProgramType | "全部")}
          >
            <option value="全部">全部周期</option>
            <option value="6周">6周</option>
            <option value="8周">8周</option>
          </select>
          <select
            className="input-field w-auto"
            value={filterIntensity}
            onChange={(e) => setFilterIntensity(e.target.value as Intensity | "全部")}
          >
            <option value="全部">全部强度</option>
            <option value="入门">入门</option>
            <option value="标准">标准</option>
            <option value="强化">强化</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
        {filtered.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onClick={() => {
              setSelectedClient(client.id);
            }}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>没有找到匹配的个案</p>
        </div>
      )}
    </div>
  );
}
