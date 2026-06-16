import { useMemo, useState } from "react";
import {
  Bell,
  AlertTriangle,
  PhoneOff,
  TrendingDown,
  Moon,
  Check,
  Settings,
  Clock,
  Shield,
  ChevronRight,
  Save,
  CheckCircle,
} from "lucide-react";
import { useSleepCoachStore } from "../store";
import PageHeader from "../components/PageHeader";
import { AlertLevelBadge, StatusBadge } from "../components/Badges";
import type { Alert, Client, BoundarySettings } from "../types";
import { cn } from "../lib/utils";

const alertTypeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  失联预警: { icon: PhoneOff, color: "text-warning-600", label: "失联预警" },
  执行率预警: { icon: TrendingDown, color: "text-amber-600", label: "执行率预警" },
  夜班变动: { icon: Moon, color: "text-primary-600", label: "夜班变动" },
};

export default function AlertsPage() {
  const alerts = useSleepCoachStore((s) => s.alerts);
  const clients = useSleepCoachStore((s) => s.clients);
  const resolveAlert = useSleepCoachStore((s) => s.resolveAlert);
  const boundarySettings = useSleepCoachStore((s) => s.boundarySettings);
  const saveBoundarySettings = useSleepCoachStore((s) => s.saveBoundarySettings);

  const [filter, setFilter] = useState<"全部" | "未处理" | "已处理">("未处理");
  const [showSettings, setShowSettings] = useState(false);
  const [form, setForm] = useState<BoundarySettings>(boundarySettings);
  const [saved, setSaved] = useState(false);

  const filteredAlerts = useMemo(() => {
    let list = [...alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (filter === "未处理") list = list.filter((a) => !a.resolved);
    if (filter === "已处理") list = list.filter((a) => a.resolved);
    return list;
  }, [alerts, filter]);

  const getClient = (id: string) => clients.find((c) => c.id === id);

  const stats = useMemo(() => {
    return {
      total: alerts.filter((a) => !a.resolved).length,
      high: alerts.filter((a) => !a.resolved && a.level === "high").length,
      medium: alerts.filter((a) => !a.resolved && a.level === "medium").length,
      low: alerts.filter((a) => !a.resolved && a.level === "low").length,
    };
  }, [alerts]);

  const handleSave = () => {
    saveBoundarySettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openSettings = () => {
    setForm(boundarySettings);
    setShowSettings(!showSettings);
  };

  return (
    <div>
      <PageHeader
        title="提醒中心"
        subtitle="失联预警、执行率预警、夜班变动等情况的统一管理"
        actions={
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={openSettings}
          >
            <Settings className="w-4 h-4" />
            边界设置
          </button>
        }
      />

      {showSettings && (
        <div className="card p-6 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-primary-800">
                  个案边界设置
                </h3>
                <p className="text-sm text-slate-500">设置提醒频率与边界，避免过度打扰来访者</p>
              </div>
            </div>
            <button
              className={cn(
                "btn-primary flex items-center gap-2",
                saved && "bg-mint-500 hover:bg-mint-500"
              )}
              onClick={handleSave}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  保存设置
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50">
              <h4 className="text-sm font-medium text-slate-700 mb-3">提醒频率</h4>
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.remindDiaryUnsubmitted}
                    onChange={(e) =>
                      setForm({ ...form, remindDiaryUnsubmitted: e.target.checked })
                    }
                    className="rounded border-slate-300 text-primary-600"
                  />
                  <span className="text-slate-600">日记未提交时自动提醒</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.emailAlerts}
                    onChange={(e) => setForm({ ...form, emailAlerts: e.target.checked })}
                    className="rounded border-slate-300 text-primary-600"
                  />
                  <span className="text-slate-600">预警信息邮件通知</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.dailySummary}
                    onChange={(e) => setForm({ ...form, dailySummary: e.target.checked })}
                    className="rounded border-slate-300 text-primary-600"
                  />
                  <span className="text-slate-600">每日总结推送</span>
                </label>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50">
              <h4 className="text-sm font-medium text-slate-700 mb-3">勿扰时段</h4>
              <div className="space-y-2.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>开始时间</span>
                  <input
                    type="time"
                    value={form.dndStartTime}
                    onChange={(e) => setForm({ ...form, dndStartTime: e.target.value })}
                    className="ml-auto input-field w-28 py-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>结束时间</span>
                  <input
                    type="time"
                    value={form.dndEndTime}
                    onChange={(e) => setForm({ ...form, dndEndTime: e.target.value })}
                    className="ml-auto input-field w-28 py-1"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.weekendReduced}
                    onChange={(e) => setForm({ ...form, weekendReduced: e.target.checked })}
                    className="rounded border-slate-300 text-primary-600"
                  />
                  <span>周末减少提醒频率</span>
                </label>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50">
              <h4 className="text-sm font-medium text-slate-700 mb-3">预警阈值</h4>
              <div className="space-y-2.5 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>失联预警</span>
                  <select
                    className="input-field w-20 py-1"
                    value={form.lostContactDays}
                    onChange={(e) =>
                      setForm({ ...form, lostContactDays: Number(e.target.value) })
                    }
                  >
                    <option value={3}>3天</option>
                    <option value={5}>5天</option>
                    <option value={7}>7天</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span>执行率预警</span>
                  <select
                    className="input-field w-20 py-1"
                    value={form.lowComplianceRate}
                    onChange={(e) =>
                      setForm({ ...form, lowComplianceRate: Number(e.target.value) })
                    }
                  >
                    <option value={30}>30%</option>
                    <option value={50}>50%</option>
                    <option value={70}>70%</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span>起床漂移</span>
                  <select
                    className="input-field w-20 py-1"
                    value={form.wakeDriftMinutes}
                    onChange={(e) =>
                      setForm({ ...form, wakeDriftMinutes: Number(e.target.value) })
                    }
                  >
                    <option value={15}>15分</option>
                    <option value={30}>30分</option>
                    <option value={60}>60分</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {saved && (
            <div className="mt-4 p-3 rounded-xl bg-mint-50 border border-mint-200 flex items-center gap-2 text-sm text-mint-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              边界设置已保存，刷新页面后仍然生效
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">待处理预警</p>
              <p className="font-serif text-2xl font-semibold text-primary-800">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">紧急</p>
              <p className="font-serif text-2xl font-semibold text-warning-600">{stats.high}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">需注意</p>
              <p className="font-serif text-2xl font-semibold text-amber-600">{stats.medium}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">一般</p>
              <p className="font-serif text-2xl font-semibold text-slate-600">{stats.low}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-slate-100">
          {(["未处理", "全部", "已处理"] as const).map((f) => (
            <button
              key={f}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === f
                  ? "bg-primary-700 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
              onClick={() => setFilter(f)}
            >
              {f}
              {f === "未处理" && stats.total > 0 && (
                <span className="ml-1.5 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {stats.total}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAlerts.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              client={getClient(alert.clientId)}
              onResolve={() => resolveAlert(alert.id)}
            />
          ))}
          {filteredAlerts.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂无预警记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertRow({
  alert,
  client,
  onResolve,
}: {
  alert: Alert;
  client?: Client;
  onResolve: () => void;
}) {
  const typeConfig = alertTypeConfig[alert.type] || alertTypeConfig["失联预警"];
  const Icon = typeConfig.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-5 transition-colors",
        alert.resolved ? "bg-slate-50 opacity-60" : "hover:bg-slate-50"
      )}
    >
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
          alert.level === "high" && "bg-warning-500/10",
          alert.level === "medium" && "bg-amber-50",
          alert.level === "low" && "bg-slate-100"
        )}
      >
        <Icon className={cn("w-5 h-5", typeConfig.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <AlertLevelBadge level={alert.level} />
          <span className={cn("text-sm font-medium", typeConfig.color)}>
            {typeConfig.label}
          </span>
          {alert.resolved && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              已处理
            </span>
          )}
        </div>
        <p className="text-sm text-slate-700">{alert.message}</p>
        <p className="text-xs text-slate-400 mt-1">{alert.createdAt}</p>
      </div>
      {client && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100/80">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium",
              client.gender === "女" ? "bg-rose-400" : "bg-primary-500"
            )}
          >
            {client.name.slice(0, 1)}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">{client.name}</p>
            <div className="flex items-center gap-1.5">
              <StatusBadge status={client.status} />
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 ml-2" />
        </div>
      )}
      {!alert.resolved && (
        <button
          onClick={onResolve}
          className="btn-secondary flex items-center gap-1.5 text-sm"
        >
          <Check className="w-4 h-4" />
          标记处理
        </button>
      )}
    </div>
  );
}
