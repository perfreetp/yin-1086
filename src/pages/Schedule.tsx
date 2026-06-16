import { useMemo, useState } from "react";
import { Calendar, Clock, Sun, Moon, ChevronLeft, ChevronRight, Plus, User } from "lucide-react";
import { useSleepCoachStore } from "../store";
import PageHeader from "../components/PageHeader";
import { StatusBadge } from "../components/Badges";
import type { Client } from "../types";
import { cn } from "../lib/utils";

export default function SchedulePage() {
  const clients = useSleepCoachStore((s) => s.clients);
  const appointments = useSleepCoachStore((s) => s.appointments);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date("2026-06-16");
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return d;
  });

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

  return (
    <div>
      <PageHeader
        title="排程面板"
        subtitle="干预周历视图与睡眠窗口管理"
        actions={
          <button className="btn-secondary flex items-center gap-2">
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
                  <div className="text-xs mt-0.5 opacity-70">
                    {weekDays[i].getDate()}
                  </div>
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
                        className="mb-1.5 p-2 rounded-lg bg-primary-50 border border-primary-100"
                      >
                        <div className="flex items-center gap-1 text-xs font-medium text-primary-700 mb-0.5">
                          <Clock className="w-3 h-3" />
                          {apt.time}
                        </div>
                        <div className="text-xs text-slate-600">
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
                    <ClientWeekRow key={c.id} client={c} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="col-span-4 space-y-6">
          <div className="card p-5">
            <h2 className="section-title mb-4">今日预约</h2>
            <div className="space-y-3">
              {appointments
                .filter((a) => !a.completed)
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-primary-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-800">
                          {getClientName(apt.clientId)}
                        </span>
                        <StatusBadge
                          status={
                            clients.find((c) => c.id === apt.clientId)?.status || "进行中"
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {apt.date}
                        <Clock className="w-3 h-3 ml-2" />
                        {apt.time}
                      </div>
                      {apt.notes && (
                        <p className="text-xs text-slate-400 mt-1">{apt.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              {appointments.filter((a) => !a.completed).length === 0 && (
                <p className="text-center py-6 text-slate-400 text-sm">今日暂无预约</p>
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
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: "70%" }} />
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
    </div>
  );
}

function ClientWeekRow({ client }: { client: Client }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-mint-50 transition-colors">
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
          {client.tags.join(" · ") || "暂无标签"}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-slate-400">睡眠窗口</p>
        <p className="text-xs font-mono text-primary-600 font-medium">
          {client.sleepWindowBed}
        </p>
      </div>
    </div>
  );
}
