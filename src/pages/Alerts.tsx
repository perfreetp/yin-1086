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
  CalendarClock,
  CalendarX,
  User,
  CalendarDays,
  Plus,
} from "lucide-react";
import { useSleepCoachStore } from "../store";
import PageHeader from "../components/PageHeader";
import { AlertLevelBadge, StatusBadge } from "../components/Badges";
import type { Alert, Client, BoundarySettings, Appointment } from "../types";
import { cn } from "../lib/utils";

const alertTypeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  失联预警: { icon: PhoneOff, color: "text-warning-600", label: "失联预警" },
  执行率预警: { icon: TrendingDown, color: "text-amber-600", label: "执行率预警" },
  夜班变动: { icon: Moon, color: "text-primary-600", label: "夜班变动" },
};

export default function AlertsPage() {
  const alerts = useSleepCoachStore((s) => s.alerts);
  const clients = useSleepCoachStore((s) => s.clients);
  const appointments = useSleepCoachStore((s) => s.appointments);
  const resolveAlert = useSleepCoachStore((s) => s.resolveAlert);
  const boundarySettings = useSleepCoachStore((s) => s.boundarySettings);
  const saveBoundarySettings = useSleepCoachStore((s) => s.saveBoundarySettings);
  const getUpcomingFollowUps = useSleepCoachStore((s) => s.getUpcomingFollowUps);
  const getOverdueFollowUps = useSleepCoachStore((s) => s.getOverdueFollowUps);
  const toggleAppointmentCompleted = useSleepCoachStore((s) => s.toggleAppointmentCompleted);
  const updateAppointment = useSleepCoachStore((s) => s.updateAppointment);
  const createAppointment = useSleepCoachStore((s) => s.createAppointment);
  const openSidebar = useSleepCoachStore((s) => s.openSidebar);
  const getClientAppointments = useSleepCoachStore((s) => s.getClientAppointments);

  const [filter, setFilter] = useState<"全部" | "未处理" | "已处理">("未处理");
  const [showSettings, setShowSettings] = useState(false);
  const [form, setForm] = useState<BoundarySettings>(boundarySettings);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"alerts" | "followup">("alerts");
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [addFollowUpClientId, setAddFollowUpClientId] = useState("");
  const [addFollowUpDate, setAddFollowUpDate] = useState("");
  const [addFollowUpTime, setAddFollowUpTime] = useState("10:00");
  const [addFollowUpNotes, setAddFollowUpNotes] = useState("");

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

  const upcomingFollowUps = useMemo(() => getUpcomingFollowUps(7), [getUpcomingFollowUps]);
  const overdueFollowUps = useMemo(() => getOverdueFollowUps(), [getOverdueFollowUps]);

  const completedFollowUps = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return appointments
      .filter((a) => a.completed && (a.type === "周复盘" || a.type === "阶段总结") && a.date >= sevenDaysAgo && a.date <= today)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }, [appointments]);

  const followUpStats = useMemo(() => {
    return {
      upcoming: upcomingFollowUps.length,
      overdue: overdueFollowUps.length,
      completed: completedFollowUps.length,
    };
  }, [upcomingFollowUps, overdueFollowUps, completedFollowUps]);

  const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

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
        {activeTab === "alerts" ? (
          <>
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
          </>
        ) : (
          <>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">复盘预约总计</p>
                  <p className="font-serif text-2xl font-semibold text-primary-800">
                    {followUpStats.upcoming + followUpStats.overdue}
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-mint-50 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5 text-mint-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">近7天</p>
                  <p className="font-serif text-2xl font-semibold text-mint-700">{followUpStats.upcoming}</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning-500/10 flex items-center justify-center">
                  <CalendarX className="w-5 h-5 text-warning-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">已逾期</p>
                  <p className="font-serif text-2xl font-semibold text-warning-600">{followUpStats.overdue}</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">涉及来访者</p>
                  <p className="font-serif text-2xl font-semibold text-slate-600">
                    {new Set([...upcomingFollowUps, ...overdueFollowUps].map((a) => a.clientId)).size}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="card overflow-hidden mb-6">
        <div className="flex items-center gap-2 p-2 border-b border-slate-100">
          {([
            { key: "alerts", label: "预警提醒", icon: Bell, count: stats.total },
            { key: "followup", label: "随访复盘台账", icon: CalendarDays, count: followUpStats.upcoming + followUpStats.overdue },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-primary-700 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "alerts" && (
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
      )}

      {activeTab === "followup" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => {
                setAddFollowUpDate(new Date().toISOString().split("T")[0]);
                setAddFollowUpClientId("");
                setAddFollowUpNotes("");
                setShowAddFollowUp(true);
              }}
            >
              <Plus className="w-4 h-4" />
              补录复盘
            </button>
          </div>

          {overdueFollowUps.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-warning-500/5">
                <div className="flex items-center gap-2">
                  <CalendarX className="w-5 h-5 text-warning-600" />
                  <h3 className="font-serif text-base font-semibold text-warning-700">
                    已逾期（{overdueFollowUps.length}）
                  </h3>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {overdueFollowUps.map((appt) => {
                  const client = getClient(appt.clientId);
                  if (!client) return null;
                  const lastCompleted = getClientAppointments(appt.clientId)
                    .filter((a) => a.completed)
                    .sort((a, b) => b.date.localeCompare(a.date))[0];
                  return (
                    <FollowUpRow
                      key={appt.id}
                      appointment={appt}
                      client={client}
                      daysDiff={getDaysDiff(appt.date)}
                      lastCompleted={lastCompleted}
                      onComplete={() => toggleAppointmentCompleted(appt.id)}
                      onOpenSidebar={() => openSidebar(client.id)}
                      onReschedule={() => {
                        setRescheduleAppt(appt);
                        setRescheduleDate(appt.date);
                        setRescheduleTime(appt.time);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-mint-600" />
                <h3 className="font-serif text-base font-semibold text-slate-800">
                  近7天待复盘（{upcomingFollowUps.length}）
                </h3>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingFollowUps.length > 0 ? (
                upcomingFollowUps.map((appt) => {
                  const client = getClient(appt.clientId);
                  if (!client) return null;
                  const lastCompleted = getClientAppointments(appt.clientId)
                    .filter((a) => a.completed)
                    .sort((a, b) => b.date.localeCompare(a.date))[0];
                  return (
                    <FollowUpRow
                      key={appt.id}
                      appointment={appt}
                      client={client}
                      daysDiff={getDaysDiff(appt.date)}
                      lastCompleted={lastCompleted}
                      onComplete={() => toggleAppointmentCompleted(appt.id)}
                      onOpenSidebar={() => openSidebar(client.id)}
                      onReschedule={() => {
                        setRescheduleAppt(appt);
                        setRescheduleDate(appt.date);
                        setRescheduleTime(appt.time);
                      }}
                    />
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">近7天暂无待复盘预约</p>
                </div>
              )}
            </div>
          </div>

          {completedFollowUps.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-mint-50">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-mint-600" />
                  <h3 className="font-serif text-base font-semibold text-mint-700">
                    近7天已完成（{completedFollowUps.length}）
                  </h3>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {completedFollowUps.map((appt) => {
                  const client = getClient(appt.clientId);
                  if (!client) return null;
                  return (
                    <div key={appt.id} className="flex items-center gap-4 p-4 bg-slate-50/50 opacity-75">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium",
                        client.gender === "女" ? "bg-rose-400" : "bg-primary-500"
                      )}>
                        {client.name.slice(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">{client.name}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            W{client.currentWeek}/{client.programType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{appt.date} {appt.time} · {appt.type}</p>
                      </div>
                      <span className="text-xs text-mint-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        已完成
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {rescheduleAppt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setRescheduleAppt(null)} />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-serif text-lg font-semibold text-slate-800">改期复盘</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {getClient(rescheduleAppt.clientId)?.name} · 原定 {rescheduleAppt.date} {rescheduleAppt.time}
                  </p>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">新日期</label>
                    <input type="date" className="input-field" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">新时间</label>
                    <input type="time" className="input-field" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
                  </div>
                </div>
                <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
                  <button className="btn-secondary" onClick={() => setRescheduleAppt(null)}>取消</button>
                  <button className="btn-primary" onClick={() => {
                    updateAppointment(rescheduleAppt.id, { date: rescheduleDate, time: rescheduleTime });
                    setRescheduleAppt(null);
                  }}>确认改期</button>
                </div>
              </div>
            </div>
          )}

          {showAddFollowUp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddFollowUp(false)} />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-serif text-lg font-semibold text-slate-800">补录复盘预约</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">来访者</label>
                    <select className="input-field" value={addFollowUpClientId} onChange={(e) => setAddFollowUpClientId(e.target.value)}>
                      <option value="">选择来访者...</option>
                      {clients.filter((c) => c.status !== "已结案").map((c) => (
                        <option key={c.id} value={c.id}>{c.name} (W{c.currentWeek}/{c.programType})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">日期</label>
                      <input type="date" className="input-field" value={addFollowUpDate} onChange={(e) => setAddFollowUpDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">时间</label>
                      <input type="time" className="input-field" value={addFollowUpTime} onChange={(e) => setAddFollowUpTime(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">备注</label>
                    <textarea className="input-field h-20 resize-none" placeholder="可选备注..." value={addFollowUpNotes} onChange={(e) => setAddFollowUpNotes(e.target.value)} />
                  </div>
                </div>
                <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
                  <button className="btn-secondary" onClick={() => setShowAddFollowUp(false)}>取消</button>
                  <button
                    className={cn("btn-primary", !addFollowUpClientId && "opacity-50 cursor-not-allowed")}
                    disabled={!addFollowUpClientId}
                    onClick={() => {
                      if (!addFollowUpClientId) return;
                      createAppointment({
                        clientId: addFollowUpClientId,
                        date: addFollowUpDate,
                        time: addFollowUpTime,
                        type: "周复盘",
                        notes: addFollowUpNotes || undefined,
                        source: "manual",
                      });
                      setShowAddFollowUp(false);
                    }}
                  >保存预约</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FollowUpRow({
  appointment,
  client,
  daysDiff,
  lastCompleted,
  onComplete,
  onOpenSidebar,
  onReschedule,
}: {
  appointment: Appointment;
  client: Client;
  daysDiff: number;
  lastCompleted?: Appointment;
  onComplete: () => void;
  onOpenSidebar: () => void;
  onReschedule: () => void;
}) {
  const isOverdue = daysDiff < 0;
  const isToday = daysDiff === 0;
  const isTomorrow = daysDiff === 1;

  return (
    <div className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenSidebar();
        }}
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-white text-base font-medium flex-shrink-0 hover:ring-2 hover:ring-primary-300 transition-all",
          client.gender === "女" ? "bg-rose-400" : "bg-primary-500"
        )}
      >
        {client.name.slice(0, 1)}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSidebar();
            }}
            className="font-serif text-base font-semibold text-slate-800 hover:text-primary-600 hover:underline transition-colors"
          >
            {client.name}
          </button>
          <StatusBadge status={client.status} />
          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            W{client.currentWeek}/{client.programType}
          </span>
          {appointment.source === "review" && (
            <span className="text-[10px] text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
              来自周回顾
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className={cn(
            "flex items-center gap-1 font-medium",
            isOverdue && "text-warning-600",
            isToday && "text-mint-600",
            !isOverdue && !isToday && "text-slate-600"
          )}>
            <CalendarClock className="w-4 h-4" />
            {isOverdue && `逾期 ${Math.abs(daysDiff)} 天`}
            {isToday && "今天"}
            {isTomorrow && "明天"}
            {daysDiff > 1 && `${daysDiff} 天后`}
            {" · "}{appointment.date} {appointment.time}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">{appointment.type || "周复盘"}</span>
        </div>
        {lastCompleted && (
          <p className="text-xs text-slate-400 mt-1">
            上次完成：{lastCompleted.date}
          </p>
        )}
        {appointment.notes && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            备注：{appointment.notes}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onReschedule}
          className="btn-secondary flex items-center gap-1.5 text-sm"
        >
          <CalendarDays className="w-4 h-4" />
          改期
        </button>
        <button
          onClick={onComplete}
          className="btn-primary flex items-center gap-1.5 text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          完成
        </button>
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
