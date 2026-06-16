import { useState, useEffect } from "react";
import { Calendar, Clock, User, Check, CalendarClock, Trash2 } from "lucide-react";
import Modal from "./Modal";
import { useSleepCoachStore } from "../store";
import type { Appointment, AppointmentType } from "../types";
import { cn } from "../lib/utils";

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  initialClientId?: string;
  initialNotes?: string;
  editing?: Appointment | null;
  onSuccess?: () => void;
  source?: Appointment["source"];
  linkedReviewId?: string;
}

const APPT_TYPES: AppointmentType[] = ["初次评估", "周复盘", "阶段总结", "紧急跟进"];

export default function AppointmentModal({
  open,
  onClose,
  initialClientId,
  initialNotes,
  editing,
  onSuccess,
  source,
  linkedReviewId,
}: AppointmentModalProps) {
  const clients = useSleepCoachStore((s) => s.clients);
  const createAppointment = useSleepCoachStore((s) => s.createAppointment);
  const updateAppointment = useSleepCoachStore((s) => s.updateAppointment);
  const deleteAppointment = useSleepCoachStore((s) => s.deleteAppointment);

  const activeClients = clients.filter((c) => c.status !== "已结案");

  const [form, setForm] = useState({
    clientId: "",
    date: new Date().toISOString().split("T")[0],
    time: "19:30",
    type: "周复盘" as AppointmentType | string,
    notes: "",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        clientId: editing.clientId,
        date: editing.date,
        time: editing.time,
        type: editing.type,
        notes: editing.notes || "",
      });
    } else {
      setForm({
        clientId: initialClientId || activeClients[0]?.id || "",
        date: new Date().toISOString().split("T")[0],
        time: "19:30",
        type: "周复盘",
        notes: initialNotes || "",
      });
    }
  }, [editing, initialClientId, open, initialNotes]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    if (!form.clientId || !form.date || !form.time) return;
    if (editing) {
      updateAppointment(editing.id, {
        clientId: form.clientId,
        date: form.date,
        time: form.time,
        type: form.type,
        notes: form.notes || undefined,
      });
    } else {
      createAppointment({
        clientId: form.clientId,
        date: form.date,
        time: form.time,
        type: form.type,
        notes: form.notes || undefined,
        source: source || "manual",
        linkedReviewId,
      });
    }
    onClose();
    onSuccess?.();
  };

  const handleDelete = () => {
    if (editing) {
      deleteAppointment(editing.id);
      onClose();
      onSuccess?.();
    }
  };

  const client = clients.find((c) => c.id === form.clientId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "改期预约" : "预约复盘"}
      subtitle={editing ? "调整预约时间或内容" : "选择来访者与时间安排复盘"}
      width="w-[480px]"
      footer={
        <>
          {editing && (
            <button
              className="btn-danger mr-auto flex items-center gap-1.5"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>
            取消
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={handleSubmit}>
            <Check className="w-4 h-4" />
            {editing ? "保存修改" : "确认预约"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <User className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            选择来访者
          </label>
          <select
            className="input-field"
            value={form.clientId}
            onChange={(e) => update("clientId", e.target.value)}
          >
            {activeClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.gender}{c.age} · W{c.currentWeek}/{c.programType}
              </option>
            ))}
          </select>
          {client && (
            <div className="mt-2 p-3 rounded-lg bg-primary-50 flex items-center gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium",
                  client.gender === "女" ? "bg-rose-400" : "bg-primary-500"
                )}
              >
                {client.name.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{client.name}</p>
                <p className="text-xs text-slate-500">
                  睡眠窗口 {client.sleepWindowBed} - {client.sleepWindowWake} · 日记完成率 {client.diaryCompletionRate}%
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              日期
            </label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              时间
            </label>
            <input
              type="time"
              className="input-field"
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <CalendarClock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            复盘类型
          </label>
          <div className="grid grid-cols-4 gap-2">
            {APPT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update("type", t)}
                className={cn(
                  "py-2 rounded-lg text-xs font-medium transition-colors",
                  form.type === t
                    ? "bg-primary-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            备注
          </label>
          <textarea
            className="input-field h-20 resize-none"
            placeholder="本次复盘重点、需准备的材料等"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
