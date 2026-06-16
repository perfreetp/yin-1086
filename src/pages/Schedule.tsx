import { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  Check,
  Edit,
  CalendarClock,
} from "lucide-react";
import { useSleepCoachStore } from "../store";
import PageHeader from "../components/PageHeader";
import { StatusBadge } from "../components/Badges";
import AppointmentModal from "../components/AppointmentModal";
import type { Client, Appointment } from "../types";
import { cn } from "../lib/utils";

export default function SchedulePage() {
  const clients = useSleepCoachStore((s) => s.clients);
  const appointments = useSleepCoachStore((s) => s.appointments);
  const toggleAppointmentCompleted = useSleepCoachStore(
    (s) => s.toggleAppointmentCompleted
  );
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return d;
  });
  const [showModal, setShowModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [modalClientId, setModalClientId] = useState<string | undefined>(undefined);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentWeekStart]);

  const shiftWeek = (delta: number) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + delta * 7);
    setCurrentWeekStart(d);
  };

  const getClientsByWeek = (weekNum: number) =>
    clients.filter((c) => c.currentWeek === weekNum && c.status !== "已结案");

  const getAppointmentsForDate = (dateStr: string) =>
    appointments.filter((a) => a.date === dateStr);

  const getClientName = (id: string) => clients.find((c) => c.id === id)?.name || "";

  const openNew = () => {
    setEditingAppt(null);
    setModalClientId(undefined);
    setShowModal(true);
  };

  const openEdit = (apt: Appointment) => {
    setEditingAppt(apt);
    setShowModal(true);
  };

  const pendingAppts = appointments.filter((a) => !a.completed);

  return (
    <div>
      <PageHeader
        title="排程面板"
        subtitle="干预周历视图与睡眠窗口管理"
        actions={
          <button className="btn-primary flex items-center gap-2" onClick={openNew}>
            <Plus className="w-4 h-4" />
            预约复盘
          </button>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-title mb-1">干预周历</h2>
                <p className="text-sm text-slate-500">
                  {weekDays[0].toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}{" "}
                  -{" "}
                  {weekDays[6].toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                  onClick={() => shiftWeek(-1)}
                >
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  className="px-3 py-1.5 text-sm text-primary-700 font-medium hover:bg-primary-50 rounded-lg transition-colors"
                  onClick={() => {
                    const d = new Date();
                    const day = d.getDay();
                    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
                    setCurrentWeekStart(d);
                  }}
                >
                  本周
                </button>
                <button
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                  onClick={() => shiftWeek(1)}
                >
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((d, i) => (
                <div
                  key={d}
                  className={cn(
                    "text-center py-2 rounded-lg text-sm font-medium",
                    i >= 5 ? "text-warning-500" : "text-slate-500"
                  )}
                >
                  {d}
                  <div className="text-xs mt-0.5 opacity-70">{weekDays[i].getDate()}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((date, idx) => {
                const dateStr = date.toISOString().split("T")[0];
                const dayAppts = getAppointmentsForDate(dateStr);
                const isWeekend = idx >= 5;
                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "min-h-[120px] rounded-xl border p-2 transition-colors",
                      isWeekend ? "bg-sand-100 border-sand-300" : "bg-white border-slate-100"
                    )}
                  >
                    {dayAppts.map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          "mb-1.5 p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                          apt.completed
                            ? "bg-slate-50 border-slate-200 opacity-60"
                            : "bg-primary-50 border-primary-100 hover:bg-primary-100"
                        )}
                        onClick={() => openEdit(apt)}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1 text-xs font-medium text-primary-700">
                            <Clock className="w-3 h-3" />
                            {apt.time}
                          </div>
                          {apt.completed && (
                            <Check className="w-3 h-3 text-mint-600" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "text-xs",
                            apt.completed ? "text-slate-500 line-through" : "text-slate-600"
                          )}
                        >
                          {getClientName(apt.clientId)}
                        </div>
                        <div className="text-[10px] text-slate-400">{apt.type}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => {
            const weekClients = getClientsByWeek(week);
            if (weekClients.length === 0) return null;
            return (
              <div key={week} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-700 flex items-center justify-center">
                    <span className="text-white font-serif font-semibold">W{week}</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-primary-800">
                      第 {week} 周 · {weekClients.length} 位来访者
                    </h3>
                    <p className="text-xs text-slate-500">本周需关注的干预重点</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {weekClients.map((c) => (
                    <ClientWeekRow
                      key={c.id}
                      client={c}
                      onSchedule={() => {
                        setEditingAppt(null);
                        setModalClientId(c.id);
                        setShowModal(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="col-span-4 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <CalendarClock className="w-5 h-5" />
                预约列表
                <span className="text-xs font-normal text-slate-400 ml-1">
                  待处理 {pendingAppts.length}
                </span>
              </h2>
              <button
                className="text-xs text-primary-600 hover:text-primary-700"
                onClick={openNew}
              >
                + 新增
              </button>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {appointments
                .slice()
                .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
                .map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    apt={apt}
                    clientName={getClientName(apt.clientId)}
                    clientStatus={
                      clients.find((c) => c.id === apt.clientId)?.status || "进行中"
                    }
                    onToggle={() => toggleAppointmentCompleted(apt.id)}
                    onEdit={() => openEdit(apt)}
                  />
                ))}
              {appointments.length === 0 && (
                <p className="text-center py-6 text-slate-400 text-sm">暂无预约</p>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="section-title mb-4">睡眠窗口速览</h2>
            <div className="space-y-3">
              {clients
                .filter((c) => c.status !== "已结案")
                .slice(0, 6)
                .map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{c.name}</span>
                        <span className="text-xs text-slate-400">W{c.currentWeek}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-primary-600">
                          <Moon className="w-3 h-3" />
                          {c.sleepWindowBed}
                        </div>
                        <div className="flex-1 h-1.5 bg-primary-100 rounded-full">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: "70%" }}
                          />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-mint-600">
                          <Sun className="w-3 h-3" />
                          {c.sleepWindowWake}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <AppointmentModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAppt(null);
        }}
        initialClientId={modalClientId}
        editing={editingAppt}
      />
    </div>
  );
}

function ClientWeekRow({
  client,
  onSchedule,
}: {
  client: Client;
  onSchedule: () => void;
}) {
  const getCurrentWeekPlan = useSleepCoachStore((s) => s.getCurrentWeekPlan);
  const plan = getCurrentWeekPlan(client.id);

  return (
    <div className="p-3 rounded-xl bg-slate-50 hover:bg-mint-50 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0",
            client.gender === "女" ? "bg-rose-400" : "bg-primary-500"
          )}
        >
          {client.name.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800">{client.name}</span>
            <StatusBadge status={client.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {plan ? plan.focus : client.tags.join(" · ") || "暂无标签"}
          </p>
        </div>
        <button
          className="text-xs px-2 py-1 rounded-lg bg-primary-700 text-white hover:bg-primary-600 transition-colors"
          onClick={onSchedule}
        >
          约复盘
        </button>
      </div>
      {plan && plan.tasks.length > 0 && (
        <p className="text-[11px] text-slate-500 pl-12 line-clamp-1">
          本周任务：{plan.tasks.slice(0, 2).join("；")}
        </p>
      )}
    </div>
  );
}

function AppointmentCard({
  apt,
  clientName,
  clientStatus,
  onToggle,
  onEdit,
}: {
  apt: Appointment;
  clientName: string;
  clientStatus: Client["status"];
  onToggle: () => void;
  onEdit: () => void;
}) {
  const isPast = apt.date < new Date().toISOString().split("T")[0];
  return (
    <div
      className={cn(
        "p-3 rounded-xl border transition-all group",
        apt.completed
          ? "bg-slate-50 border-slate-200 opacity-70"
          : isPast
          ? "bg-warning-500/5 border-warning-200"
          : "bg-white border-slate-100 hover:border-primary-200 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
            apt.completed
              ? "bg-mint-500 border-mint-500"
              : "border-slate-300 hover:border-primary-400"
          )}
        >
          {apt.completed && <Check className="w-3.5 h-3.5 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-sm font-medium",
                apt.completed ? "text-slate-500 line-through" : "text-slate-800"
              )}
            >
              {clientName}
            </span>
            <StatusBadge status={clientStatus} />
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-700">
              {apt.type}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {apt.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {apt.time}
            </span>
          </div>
          {apt.notes && (
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{apt.notes}</p>
          )}
        </div>
        <button
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all"
        >
          <Edit className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
    </div>
  );
}
