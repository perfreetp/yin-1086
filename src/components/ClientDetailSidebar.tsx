import { useMemo, useState } from "react";
import {
  X,
  User,
  Calendar,
  Clock,
  Moon,
  Sun,
  Target,
  ClipboardList,
  BookOpen,
  Shield,
  History,
  FileText,
  ChevronDown,
  ChevronRight,
  Check,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Phone,
  Tag,
  StickyNote,
  CalendarClock,
  Sparkles,
  File,
  Send,
  RotateCcw,
} from "lucide-react";
import { useSleepCoachStore } from "../store";
import { StatusBadge, IntensityBadge } from "../components/Badges";
import Modal from "../components/Modal";
import type { Client, StageSummary, Appointment, MaterialSendRecord, MaterialSendStatus } from "../types";
import { cn } from "../lib/utils";

export default function ClientDetailSidebar() {
  const sidebar = useSleepCoachStore((s) => s.sidebar);
  const closeSidebar = useSleepCoachStore((s) => s.closeSidebar);
  const clients = useSleepCoachStore((s) => s.clients);
  const getCurrentWeekPlan = useSleepCoachStore((s) => s.getCurrentWeekPlan);
  const getClientDiaries = useSleepCoachStore((s) => s.getClientDiaries);
  const getClientAppointments = useSleepCoachStore((s) => s.getClientAppointments);
  const getClientFlowHistory = useSleepCoachStore((s) => s.getClientFlowHistory);
  const getClientStageSummaries = useSleepCoachStore((s) => s.getClientStageSummaries);
  const getClientMaterialSendRecords = useSleepCoachStore((s) => s.getClientMaterialSendRecords);
  const updateMaterialSendStatus = useSleepCoachStore((s) => s.updateMaterialSendStatus);
  const generateWeekMaterialRecords = useSleepCoachStore((s) => s.generateWeekMaterialRecords);
  const openSidebar = useSleepCoachStore((s) => s.openSidebar);
  const toggleAppointmentCompleted = useSleepCoachStore(
    (s) => s.toggleAppointmentCompleted
  );

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    info: true,
    plan: true,
    diaries: true,
    appointments: true,
    materials: true,
    boundaries: true,
    flowHistory: false,
    summaries: false,
  });

  const [showSummary, setShowSummary] = useState<StageSummary | null>(null);
  const [showAppointment, setShowAppointment] = useState<Appointment | null>(null);

  const client = useMemo(
    () => clients.find((c) => c.id === sidebar.clientId) || null,
    [clients, sidebar.clientId]
  );

  if (!sidebar.open || !client) return null;

  const weekPlan = getCurrentWeekPlan(client.id);
  const recentDiaries = getClientDiaries(client.id).slice(-7);
  const appointments = getClientAppointments(client.id)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);
  const flowHistory = getClientFlowHistory(client.id);
  const summaries = getClientStageSummaries(client.id);
  const materialRecords = getClientMaterialSendRecords(client.id);

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const nextAppointment = appointments.find((a) => !a.completed);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
        onClick={closeSidebar}
      />
      <aside className="fixed right-0 top-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        <header className="p-5 border-b border-slate-100 bg-gradient-to-r from-primary-700 to-primary-600 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-medium",
                  client.gender === "女" ? "bg-white/20" : "bg-white/30"
                )}
              >
                {client.name.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-semibold">{client.name}</h2>
                  <StatusBadge status={client.status} />
                </div>
                <p className="text-white/70 text-sm mt-0.5">
                  {client.gender} · {client.age}岁 · {client.phone}
                </p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-2 rounded-lg bg-white/10 text-center">
              <p className="text-[10px] text-white/60">进度</p>
              <p className="text-sm font-semibold">
                W{client.currentWeek}/{client.programType}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-white/10 text-center">
              <p className="text-[10px] text-white/60">强度</p>
              <IntensityBadge intensity={client.intensity} />
            </div>
            <div className="p-2 rounded-lg bg-white/10 text-center">
              <p className="text-[10px] text-white/60">睡眠窗口</p>
              <p className="text-[11px] font-medium">
                {client.sleepWindowBed}→{client.sleepWindowWake}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {nextAppointment && (
            <div className="p-3 rounded-xl bg-mint-50 border border-mint-200">
              <div className="flex items-center gap-2 mb-1">
                <CalendarClock className="w-4 h-4 text-mint-600" />
                <span className="text-xs font-medium text-mint-700">下次预约</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {nextAppointment.date} {nextAppointment.time}
                  </p>
                  <p className="text-xs text-slate-500">{nextAppointment.type}</p>
                </div>
                <button
                  className="text-xs px-2 py-1 rounded-lg bg-mint-600 text-white hover:bg-mint-500 transition-colors"
                  onClick={() => setShowAppointment(nextAppointment)}
                >
                  查看
                </button>
              </div>
            </div>
          )}

          <SidebarSection
            icon={<User className="w-4 h-4" />}
            title="基本信息"
            expanded={expanded.info}
            onToggle={() => toggle("info")}
          >
            <div className="space-y-2 text-sm">
              <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="电话">
                {client.phone}
              </InfoRow>
              <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="开始日期">
                {client.startDate}
              </InfoRow>
              <InfoRow icon={<Clock className="w-3.5 h-3.5" />} label="最近联系">
                {client.lastContactDate}
              </InfoRow>
              <InfoRow icon={<TrendingUp className="w-3.5 h-3.5" />} label="日记完成率">
                <span className="text-mint-600 font-medium">
                  {client.diaryCompletionRate}%
                </span>
              </InfoRow>
              <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label="标签">
                <div className="flex gap-1 flex-wrap">
                  {client.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </InfoRow>
              {client.notes && (
                <InfoRow icon={<StickyNote className="w-3.5 h-3.5" />} label="备注">
                  {client.notes}
                </InfoRow>
              )}
            </div>
          </SidebarSection>

          {weekPlan && (
            <SidebarSection
              icon={<Target className="w-4 h-4" />}
              title={`本周重点 · W${client.currentWeek}`}
              expanded={expanded.plan}
              onToggle={() => toggle("plan")}
            >
              <div className="bg-primary-50 rounded-lg p-3 mb-2 border border-primary-100">
                <p className="text-sm text-primary-800 font-medium">{weekPlan.focus}</p>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <ClipboardList className="w-3 h-3" />
                    任务清单
                  </p>
                  <div className="space-y-1">
                    {weekPlan.tasks.map((task, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 rounded-lg bg-slate-50"
                      >
                        <span className="text-[10px] w-4 h-4 rounded bg-primary-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-xs text-slate-700">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {weekPlan.materials.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      配套素材
                    </p>
                    <div className="space-y-1">
                      {weekPlan.materials.map((mat, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 rounded-lg bg-slate-50"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                          <span className="text-xs text-slate-700">{mat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SidebarSection>
          )}

          <SidebarSection
            icon={<Moon className="w-4 h-4" />}
            title={`近期日记（最近${recentDiaries.length}天）`}
            expanded={expanded.diaries}
            onToggle={() => toggle("diaries")}
          >
            <div className="space-y-1.5">
              {recentDiaries.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">暂无日记记录</p>
              ) : (
                recentDiaries.map((d) => (
                  <div
                    key={d.id}
                    className={cn(
                      "p-2 rounded-lg flex items-center justify-between",
                      d.submitted ? "bg-slate-50" : "bg-warning-500/10"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {d.submitted ? (
                        <CheckCircle className="w-3.5 h-3.5 text-mint-600" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-warning-500" />
                      )}
                      <span className="text-xs text-slate-700">{d.date}</span>
                    </div>
                    {d.submitted ? (
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-primary-600">
                          {d.sleepEfficiency}%
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-600">{d.totalSleepTime}h</span>
                        {(d.wakeDrift > 30 || d.weekendCatchUp || d.daytimeNap > 30) && (
                          <span className="text-warning-500 ml-1">!</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-warning-600">未提交</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </SidebarSection>

          <SidebarSection
            icon={<CalendarClock className="w-4 h-4" />}
            title="预约记录"
            expanded={expanded.appointments}
            onToggle={() => toggle("appointments")}
          >
            <div className="space-y-1.5">
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">暂无预约记录</p>
              ) : (
                appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      "p-2 rounded-lg border",
                      apt.completed
                        ? "bg-slate-50 border-slate-200 opacity-70"
                        : apt.date < new Date().toISOString().split("T")[0]
                        ? "bg-warning-500/10 border-warning-200"
                        : "bg-white border-slate-100"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAppointmentCompleted(apt.id)}
                          className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center",
                            apt.completed
                              ? "bg-mint-500 border-mint-500"
                              : "border-slate-300"
                          )}
                        >
                          {apt.completed && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </button>
                        <span className="text-xs text-slate-700">{apt.date}</span>
                        <span className="text-[10px] text-slate-500">{apt.time}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-700">
                        {apt.type}
                      </span>
                    </div>
                    {apt.notes && (
                      <p className="text-[10px] text-slate-500 pl-6 line-clamp-1">
                        {apt.notes}
                      </p>
                    )}
                    {apt.source === "review" && (
                      <span className="text-[9px] text-mint-600 ml-6 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        来自周回顾预约
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </SidebarSection>

          <SidebarSection
            icon={<File className="w-4 h-4" />}
            title="本周素材状态"
            expanded={expanded.materials}
            onToggle={() => toggle("materials")}
            headerRight={
              <button
                onClick={() => generateWeekMaterialRecords(client.id)}
                className="text-[10px] text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
              >
                <RotateCcw className="w-3 h-3" />
                刷新
              </button>
            }
          >
            <div className="space-y-1.5">
              {materialRecords.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">暂无素材记录，套用流程后自动生成</p>
              ) : (
                materialRecords.slice(0, 10).map((rec) => (
                  <MaterialRow
                    key={rec.id}
                    record={rec}
                    onStatusChange={(status) => updateMaterialSendStatus(rec.id, status)}
                  />
                ))
              )}
            </div>
          </SidebarSection>

          <SidebarSection
            icon={<Shield className="w-4 h-4" />}
            title="边界设置"
            expanded={expanded.boundaries}
            onToggle={() => toggle("boundaries")}
          >
            {client.boundaries.length > 0 ? (
              <div className="space-y-1.5">
                {client.boundaries.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-primary-50 border border-primary-100"
                  >
                    <Shield className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                    <span className="text-xs text-primary-700">{b}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">无特殊边界设置</p>
            )}
          </SidebarSection>

          {flowHistory.length > 0 && (
            <SidebarSection
              icon={<History className="w-4 h-4" />}
              title={`流程套用历史（${flowHistory.length}次）`}
              expanded={expanded.flowHistory}
              onToggle={() => toggle("flowHistory")}
            >
              <div className="space-y-2">
                {flowHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary-100 flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-primary-600" />
                        </div>
                        <span className="text-xs font-medium text-slate-800">
                          {h.flowName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{h.appliedAt}</span>
                    </div>
                    <div className="flex gap-1.5 pl-8">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-600">
                        {h.intensity}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-mint-50 text-mint-600">
                        {h.programType}
                      </span>
                    </div>
                    {h.note && (
                      <p className="text-[10px] text-slate-500 pl-8 mt-1">{h.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </SidebarSection>
          )}

          {summaries.length > 0 && (
            <SidebarSection
              icon={<FileText className="w-4 h-4" />}
              title={`阶段总结历史（${summaries.length}份）`}
              expanded={expanded.summaries}
              onToggle={() => toggle("summaries")}
            >
              <div className="space-y-1.5">
                {summaries.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setShowSummary(s)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-primary-50 hover:border-primary-100 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-800">
                        {s.title}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {s.generatedAt} · {s.period || ""}
                    </p>
                  </button>
                ))}
              </div>
            </SidebarSection>
          )}
        </div>

        <footer className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex gap-2">
            <button
              className="flex-1 btn-secondary text-sm"
              onClick={() => {
                closeSidebar();
                setTimeout(() => openSidebar(client.id), 100);
              }}
            >
              刷新
            </button>
            <button className="flex-1 btn-primary text-sm" onClick={closeSidebar}>
              关闭
            </button>
          </div>
        </footer>
      </aside>

      <Modal
        open={!!showSummary}
        onClose={() => setShowSummary(null)}
        title={showSummary?.title || "阶段总结"}
        width="w-[600px]"
        footer={
          <button
            className="btn-primary"
            onClick={() => {
              if (showSummary?.fullText) {
                navigator.clipboard.writeText(showSummary.fullText);
              }
            }}
          >
            复制全文
          </button>
        }
      >
        {showSummary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>生成时间：{showSummary.generatedAt}</span>
              {showSummary.period && <span>{showSummary.period}</span>}
            </div>
            <div className="bg-sand-100 rounded-xl p-4 border border-sand-300 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed max-h-[450px] overflow-y-auto">
              {showSummary.fullText || showSummary.content}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!showAppointment}
        onClose={() => setShowAppointment(null)}
        title="预约详情"
        width="w-[500px]"
      >
        {showAppointment && client && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white",
                    client.gender === "女" ? "bg-rose-400" : "bg-primary-500"
                  )}
                >
                  {client.name.slice(0, 1)}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{client.name}</p>
                  <p className="text-xs text-slate-500">
                    {showAppointment.type} · {showAppointment.date} {showAppointment.time}
                  </p>
                </div>
              </div>
            </div>
            {showAppointment.notes && (
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">预约备注</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {showAppointment.notes}
                </p>
              </div>
            )}
            {showAppointment.source && (
              <p className="text-xs text-mint-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {showAppointment.source === "review"
                  ? "从周回顾页面创建"
                  : showAppointment.source === "schedule"
                  ? "从排程面板创建"
                  : "手动创建"}
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function SidebarSection({
  icon,
  title,
  expanded,
  onToggle,
  children,
  headerRight,
}: {
  icon: React.ReactNode;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
      <div
        className="flex items-center gap-2 p-3 hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
          {icon}
        </div>
        <span className="flex-1 text-sm font-medium text-slate-700 text-left">
          {title}
        </span>
        {headerRight && <span onClick={(e) => e.stopPropagation()}>{headerRight}</span>}
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </div>
      {expanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function MaterialRow({
  record,
  onStatusChange,
}: {
  record: MaterialSendRecord;
  onStatusChange: (status: MaterialSendStatus) => void;
}) {
  const statusConfig: Record<MaterialSendStatus, { label: string; color: string; icon: typeof File }> = {
    pending: { label: "待发送", color: "text-amber-600 bg-amber-50 border-amber-200", icon: File },
    sent: { label: "已发送", color: "text-primary-600 bg-primary-50 border-primary-200", icon: Send },
    applied: { label: "已套用", color: "text-mint-600 bg-mint-50 border-mint-200", icon: CheckCircle },
  };
  const cfg = statusConfig[record.status];
  const Icon = cfg.icon;

  return (
    <div className={cn("p-2 rounded-lg border", cfg.color)}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", cfg.color.split(" ")[0])} />
        <span className="text-xs font-medium text-slate-700 flex-1 truncate">{record.materialName}</span>
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", cfg.color)}>
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-500 pl-5.5">
        <span>第{record.weekNumber}周</span>
        {record.sentAt && <span>发送：{record.sentAt}</span>}
        {record.appliedAt && !record.sentAt && <span>套用：{record.appliedAt}</span>}
      </div>
      {record.status !== "applied" && (
        <div className="flex gap-1 mt-2 pl-5.5">
          {record.status === "pending" && (
            <button
              onClick={() => onStatusChange("sent")}
              className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors flex items-center gap-0.5"
            >
              <Send className="w-2.5 h-2.5" />
              标记已发送
            </button>
          )}
          {record.status === "sent" && (
            <button
              onClick={() => onStatusChange("applied")}
              className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-mint-50 hover:text-mint-600 hover:border-mint-200 transition-colors flex items-center gap-0.5"
            >
              <CheckCircle className="w-2.5 h-2.5" />
              标记已套用
            </button>
          )}
          {record.status === "sent" && (
            <button
              onClick={() => onStatusChange("pending")}
              className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
            >
              撤销
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[11px] text-slate-500">{label}</p>
        <div className="text-xs text-slate-700 mt-0.5">{children}</div>
      </div>
    </div>
  );
}
