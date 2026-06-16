import { useState } from "react";
import { UserPlus, Sparkles } from "lucide-react";
import Modal from "./Modal";
import { useSleepCoachStore } from "../store";
import type { ProgramType, Intensity } from "../types";
import { getFlowByProgram } from "../data/programFlows";

interface NewClientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NewClientModal({ open, onClose, onSuccess }: NewClientModalProps) {
  const createClient = useSleepCoachStore((s) => s.createClient);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "女" as "男" | "女",
    age: 30,
    programType: "8周" as ProgramType,
    intensity: "标准" as Intensity,
    initialBed: "23:30",
    initialWake: "07:00",
    tagInput: "",
    tags: [] as string[],
    boundaryInput: "",
    boundaries: [] as string[],
    notes: "",
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm({ ...form, [key]: value });
  };

  const addTag = () => {
    const t = form.tagInput.trim();
    if (t && !form.tags.includes(t)) {
      update("tags", [...form.tags, t]);
      update("tagInput", "");
    }
  };
  const removeTag = (t: string) => update("tags", form.tags.filter((x) => x !== t));

  const addBoundary = () => {
    const b = form.boundaryInput.trim();
    if (b && !form.boundaries.includes(b)) {
      update("boundaries", [...form.boundaries, b]);
      update("boundaryInput", "");
    }
  };
  const removeBoundary = (b: string) =>
    update("boundaries", form.boundaries.filter((x) => x !== b));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    createClient({
      name: form.name.trim(),
      phone: form.phone || "未填写",
      gender: form.gender,
      age: form.age,
      programType: form.programType,
      intensity: form.intensity,
      initialBed: form.initialBed,
      initialWake: form.initialWake,
      tags: form.tags,
      boundaries: form.boundaries,
      notes: form.notes.trim() || undefined,
    });
    setStep(1);
    setForm({
      name: "",
      phone: "",
      gender: "女",
      age: 30,
      programType: "8周",
      intensity: "标准",
      initialBed: "23:30",
      initialWake: "07:00",
      tagInput: "",
      tags: [],
      boundaryInput: "",
      boundaries: [],
      notes: "",
    });
    onClose();
    onSuccess?.();
  };

  const previewFlow = getFlowByProgram(form.programType, form.intensity);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="新建个案"
      subtitle={step === 1 ? "第一步：填写基本信息" : "第二步：干预方案与节奏"}
      width="w-[600px]"
      footer={
        step === 1 ? (
          <>
            <button className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button
              className="btn-primary"
              onClick={() => setStep(2)}
              disabled={!form.name.trim()}
            >
              下一步
            </button>
          </>
        ) : (
          <>
            <button className="btn-secondary" onClick={() => setStep(1)}>
              上一步
            </button>
            <button className="btn-primary flex items-center gap-2" onClick={handleSubmit}>
              <Sparkles className="w-4 h-4" />
              创建并生成初始节奏
            </button>
          </>
        )
      }
    >
      {step === 1 ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                姓名 *
              </label>
              <input
                className="input-field"
                placeholder="来访者姓名"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                联系电话
              </label>
              <input
                className="input-field"
                placeholder="选填"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                性别
              </label>
              <div className="flex gap-2">
                {(["女", "男"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => update("gender", g)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.gender === g
                        ? "bg-primary-700 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                年龄
              </label>
              <input
                type="number"
                className="input-field"
                value={form.age}
                min={10}
                max={100}
                onChange={(e) => update("age", Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              标签（回车添加，可选）
            </label>
            <div className="flex gap-2 mb-2">
              <input
                className="input-field"
                placeholder="如：职场焦虑、产后失眠"
                value={form.tagInput}
                onChange={(e) => update("tagInput", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button type="button" className="btn-secondary" onClick={addTag}>
                添加
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {form.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              备注
            </label>
            <textarea
              className="input-field h-20 resize-none"
              placeholder="过敏史、用药情况、重要个人信息等"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                干预周期
              </label>
              <div className="flex gap-2">
                {(["6周", "8周"] as ProgramType[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => update("programType", p)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.programType === p
                        ? "bg-primary-700 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                流程强度
              </label>
              <div className="flex gap-2">
                {(["入门", "标准", "强化"] as Intensity[]).map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => update("intensity", i)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                      form.intensity === i
                        ? "bg-mint-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                初始入睡时间
              </label>
              <input
                type="time"
                className="input-field"
                value={form.initialBed}
                onChange={(e) => update("initialBed", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                初始起床时间
              </label>
              <input
                type="time"
                className="input-field"
                value={form.initialWake}
                onChange={(e) => update("initialWake", e.target.value)}
              />
            </div>
          </div>

          {previewFlow && (
            <div className="p-4 rounded-xl bg-mint-50 border border-mint-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-mint-600" />
                <span className="text-sm font-medium text-mint-700">
                  将套用：{previewFlow.name}
                </span>
              </div>
              <p className="text-xs text-mint-600 mb-3">{previewFlow.description}</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {previewFlow.weeks.slice(0, 3).map((w) => (
                  <div key={w.weekNumber} className="flex items-start gap-2">
                    <span className="text-xs font-mono font-semibold text-mint-600 w-8 flex-shrink-0">
                      W{w.weekNumber}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-slate-700">{w.focus}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {w.tasks.slice(0, 2).join("；")}
                      </p>
                    </div>
                  </div>
                ))}
                {previewFlow.weeks.length > 3 && (
                  <p className="text-[10px] text-slate-400 pl-10">
                    还有 {previewFlow.weeks.length - 3} 周计划...
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              边界设置（可选，回车添加）
            </label>
            <div className="flex gap-2 mb-2">
              <input
                className="input-field"
                placeholder="如：工作日仅晚间回复、周末不发消息"
                value={form.boundaryInput}
                onChange={(e) => update("boundaryInput", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBoundary();
                  }
                }}
              />
              <button type="button" className="btn-secondary" onClick={addBoundary}>
                添加
              </button>
            </div>
            {form.boundaries.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {form.boundaries.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700"
                  >
                    {b}
                    <button type="button" onClick={() => removeBoundary(b)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="hidden">
        <UserPlus />
      </div>
    </Modal>
  );
}
