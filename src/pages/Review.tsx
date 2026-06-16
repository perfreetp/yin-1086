import { useMemo, useState } from "react";
import {
  BarChart3,
  Plus,
  ClipboardList,
  AlertTriangle,
  FileDown,
  Copy,
  Check,
  TrendingUp,
  Moon,
  Sun,
  Sparkles,
  Target,
  BookOpen,
  Calendar,
  Download,
  FileText,
  RefreshCw,
  User,
  CalendarClock,
  Clock,
  History,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { useSleepCoachStore } from "../store";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import AppointmentModal from "../components/AppointmentModal";
import { StatusBadge, IntensityBadge } from "../components/Badges";
import type { Client, WeeklyReview, StageSummary as StageSummaryType } from "../types";
import { cn } from "../lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function ReviewPage() {
  const clients = useSleepCoachStore((s) => s.clients);
  const reviews = useSleepCoachStore((s) => s.reviews);
  const obstacles = useSleepCoachStore((s) => s.obstacles);
  const getClientDiaries = useSleepCoachStore((s) => s.getClientDiaries);
  const addObstacle = useSleepCoachStore((s) => s.addObstacle);
  const addReview = useSleepCoachStore((s) => s.addReview);
  const generateSmartReview = useSleepCoachStore((s) => s.generateSmartReview);
  const getCurrentWeekPlan = useSleepCoachStore((s) => s.getCurrentWeekPlan);
  const generateStageSummary = useSleepCoachStore((s) => s.generateStageSummary);
  const getClientStageSummaries = useSleepCoachStore((s) => s.getClientStageSummaries);
  const getClientFlowHistory = useSleepCoachStore((s) => s.getClientFlowHistory);
  const openSidebar = useSleepCoachStore((s) => s.openSidebar);
  const createAppointment = useSleepCoachStore((s) => s.createAppointment);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    clients[0]?.id || null
  );
  const [copied, setCopied] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [newObstacle, setNewObstacle] = useState({ category: "", description: "" });
  const [showObstacleForm, setShowObstacleForm] = useState(false);
  const [smartReview, setSmartReview] = useState<WeeklyReview | null>(null);
  const [stageSummary, setStageSummary] = useState<StageSummaryType | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [viewingSummary, setViewingSummary] = useState<StageSummaryType | null>(null);
  const [reviewSaved, setReviewSaved] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const clientReviews = selectedClient
    ? reviews.filter((r) => r.clientId === selectedClient.id)
    : [];
  const clientObstacles = selectedClient
    ? obstacles.filter((o) => o.clientId === selectedClient.id)
    : [];
  const latestReview = smartReview || clientReviews[clientReviews.length - 1];
  const currentWeekPlan = selectedClient ? getCurrentWeekPlan(selectedClient.id) : null;
  const clientSummaries = selectedClient ? getClientStageSummaries(selectedClient.id) : [];
  const clientFlowHistory = selectedClient ? getClientFlowHistory(selectedClient.id) : [];

  const weeklyData = useMemo(() => {
    if (!selectedClient) return [];
    const diaries = getClientDiaries(selectedClient.id);
    const weeks: { week: string; 效率: number; 时长: number }[] = [];
    for (let i = 0; i < selectedClient.currentWeek; i++) {
      const weekDiaries = diaries.slice(i * 7, (i + 1) * 7).filter((d) => d.submitted);
      if (weekDiaries.length > 0) {
        weeks.push({
          week: `W${i + 1}`,
          效率: Math.round(
            weekDiaries.reduce((s, d) => s + d.sleepEfficiency, 0) / weekDiaries.length
          ),
          时长: Number(
            (
              weekDiaries.reduce((s, d) => s + d.totalSleepTime, 0) / weekDiaries.length
            ).toFixed(1)
          ),
        });
      }
    }
    return weeks;
  }, [selectedClient, getClientDiaries]);

  const handleAddObstacle = () => {
    if (!selectedClient || !newObstacle.category || !newObstacle.description) return;
    addObstacle({
      clientId: selectedClient.id,
      date: new Date().toISOString().split("T")[0],
      category: newObstacle.category,
      description: newObstacle.description,
    });
    setNewObstacle({ category: "", description: "" });
    setShowObstacleForm(false);
  };

  const handleGenerateSmart = () => {
    if (!selectedClient) return;
    const review = generateSmartReview(selectedClient.id);
    if (review) {
      setSmartReview(review);
      setReviewSaved(false);
      setAppointmentNotes(generateAppointmentNotes(review));
    }
  };

  const handleSaveReview = () => {
    if (!smartReview) return;
    const saved = addReview(smartReview);
    setSmartReview(saved);
    setReviewSaved(true);
    setTimeout(() => setReviewSaved(false), 2000);
  };

  const handleGenerateSummary = () => {
    if (!selectedClient) return;
    const summary = generateStageSummary(selectedClient.id);
    setStageSummary(summary);
    setShowSummaryModal(true);
  };

  const generateAppointmentNotes = (review: WeeklyReview) => {
    let notes = "【本次周回顾摘要】\n";
    notes += `· 睡眠效率：${review.avgSleepEfficiency}%\n`;
    notes += `· 睡眠时长：${review.avgTotalSleep}h\n`;
    notes += `· 窗口调整：${review.sleepWindowAdjust}\n`;
    if (review.nextWindowBed && review.nextWindowWake) {
      notes += `· 建议窗口：${review.nextWindowBed} - ${review.nextWindowWake}\n`;
    }
    notes += `\n【下周核心任务】\n`;
    review.tasks.slice(0, 5).forEach((t, i) => {
      notes += `${i + 1}. ${t}\n`;
    });
    notes += `\n【执行建议】\n${review.summary}`;
    return notes;
  };

  const handleQuickAppointment = () => {
    if (!latestReview || !selectedClient) return;
    const notes = generateAppointmentNotes(latestReview);
    setAppointmentNotes(notes);
    setShowAppointmentModal(true);
  };

  const generateWeeklyTask = () => {
    if (!selectedClient || !latestReview) return "";
    return `【${selectedClient.name} · 第${latestReview.weekNumber}周睡眠任务单】

📊 本周数据汇总
· 平均睡眠效率：${latestReview.avgSleepEfficiency}%
· 平均睡眠时长：${latestReview.avgTotalSleep}小时
· 睡眠窗口调整：${latestReview.sleepWindowAdjust}
${smartReview?.nextWindowBed && smartReview?.nextWindowWake ? `· 下周睡眠窗口：${smartReview.nextWindowBed} - ${smartReview.nextWindowWake}` : ""}

🎯 下周核心任务
${latestReview.tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}

${smartReview?.reasoning ? `💡 调整说明
${smartReview.reasoning}

` : ""}📝 教练备注
${latestReview.summary}

🌙 睡眠窗口：${smartReview?.nextWindowBed || selectedClient.sleepWindowBed} - ${smartReview?.nextWindowWake || selectedClient.sleepWindowWake}
如有任何困难请及时沟通，我们一起调整。`;
  };

  const handleCopyTask = () => {
    navigator.clipboard.writeText(generateWeeklyTask());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySummary = () => {
    if (!stageSummary) return;
    navigator.clipboard.writeText(stageSummary.fullText || stageSummary.content);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const activeClients = clients.filter((c) => c.status !== "已结案");

  return (
    <div>
      <PageHeader
        title="周回顾"
        subtitle="生成周任务单、记录执行障碍、输出阶段总结"
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 space-y-3">
          <div className="card p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">选择来访者</h3>
            <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
              {activeClients.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    selectedClientId === c.id
                      ? "bg-primary-700 text-white"
                      : "hover:bg-slate-100 cursor-pointer"
                  )}
                  onClick={() => {
                    setSelectedClientId(c.id);
                    setSmartReview(null);
                    setReviewSaved(false);
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSidebar(c.id);
                    }}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 hover:ring-2 hover:ring-white/50 transition-all",
                      selectedClientId === c.id
                        ? "bg-white/20 text-white"
                        : c.gender === "女"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-primary-100 text-primary-600"
                    )}
                  >
                    {c.name.slice(0, 1)}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        selectedClientId === c.id ? "text-white" : "text-slate-800"
                      )}
                    >
                      {c.name}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        selectedClientId === c.id ? "text-white/70" : "text-slate-500"
                      )}
                    >
                      W{c.currentWeek}/{c.programType}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4",
                      selectedClientId === c.id ? "text-white/60" : "text-slate-300"
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-9 space-y-6">
          {selectedClient && (
            <>
              <ClientOverviewCard client={selectedClient} />

              {currentWeekPlan && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="section-title flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      本周干预重点 · W{selectedClient.currentWeek}
                      <span className="text-xs font-normal text-slate-400 ml-2">
                        {selectedClient.intensity} · {selectedClient.programType}
                      </span>
                    </h3>
                  </div>
                  <div className="bg-mint-50 rounded-xl p-4 border border-mint-100 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-mint-600" />
                      <span className="text-sm font-medium text-mint-700">本周焦点</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {currentWeekPlan.focus}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                        <ClipboardList className="w-3.5 h-3.5" />
                        本周任务清单
                      </h4>
                      <div className="space-y-1.5">
                        {currentWeekPlan.tasks.map((task, i) => (
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
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        配套素材
                      </h4>
                      <div className="space-y-1.5">
                        {currentWeekPlan.materials.map((mat, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded-lg bg-slate-50"
                          >
                            <FileText className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                            <span className="text-xs text-slate-700">{mat}</span>
                          </div>
                        ))}
                        {currentWeekPlan.materials.length === 0 && (
                          <p className="text-xs text-slate-400 p-2">暂无配套素材</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {clientFlowHistory.length > 0 && (
                <div className="card p-5">
                  <h3 className="section-title flex items-center gap-2 mb-4">
                    <History className="w-5 h-5" />
                    流程套用历史
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      共 {clientFlowHistory.length} 次
                    </span>
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {clientFlowHistory.slice(0, 3).map((h) => (
                      <div
                        key={h.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded bg-primary-100 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-primary-600" />
                          </div>
                          <span className="text-xs font-medium text-slate-800">
                            {h.flowName}
                          </span>
                        </div>
                        <div className="flex gap-1.5 mb-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-600">
                            {h.intensity}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-mint-50 text-mint-600">
                            {h.programType}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{h.appliedAt}</p>
                        {h.note && (
                          <p className="text-[10px] text-slate-500 mt-1">{h.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    干预进度趋势
                  </h3>
                  <span className="text-xs text-slate-500">睡眠效率 & 时长</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                      domain={[0, 100]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                      domain={[0, 10]}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      y={85}
                      stroke="#4ecdc4"
                      strokeDasharray="5 5"
                      label={{ value: "达标线", fontSize: 10, fill: "#4ecdc4" }}
                    />
                    <Tooltip />
                    <Bar
                      yAxisId="left"
                      dataKey="效率"
                      fill="#1e3a5f"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="时长"
                      fill="#4ecdc4"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="section-title flex items-center gap-2">
                      <ClipboardList className="w-5 h-5" />
                      周任务单
                    </h3>
                    <div className="flex gap-2">
                      <button
                        className="btn-secondary flex items-center gap-2"
                        onClick={handleGenerateSmart}
                      >
                        <Sparkles className="w-4 h-4" />
                        智能生成
                      </button>
                      {smartReview && !reviewSaved && (
                        <button
                          className="btn-primary flex items-center gap-2"
                          onClick={handleSaveReview}
                        >
                          <Check className="w-4 h-4" />
                          保存
                        </button>
                      )}
                      {reviewSaved && (
                        <span className="px-3 py-1.5 text-xs rounded-lg bg-mint-100 text-mint-700 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          已保存
                        </span>
                      )}
                      <button
                        className="btn-primary flex items-center gap-2"
                        onClick={handleCopyTask}
                        disabled={!latestReview}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            复制发送
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {smartReview && smartReview.reasoning && (
                    <div className="mb-3 p-3 rounded-xl bg-warning-500/10 border border-warning-200">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-warning-600" />
                        <span className="text-xs font-medium text-warning-700">
                          睡眠窗口调整建议
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {smartReview.reasoning}
                      </p>
                      {smartReview.nextWindowBed && smartReview.nextWindowWake && (
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-primary-700 font-medium">
                            <Moon className="w-3 h-3" />
                            {smartReview.nextWindowBed}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="flex items-center gap-1 text-mint-700 font-medium">
                            <Sun className="w-3 h-3" />
                            {smartReview.nextWindowWake}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-mint-100 text-mint-700">
                            已建议
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {latestReview ? (
                    <>
                      <div className="bg-sand-100 rounded-xl p-4 border border-sand-300 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed max-h-[280px] overflow-y-auto">
                        {generateWeeklyTask()}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          className="btn-secondary flex-1 flex items-center justify-center gap-2"
                          onClick={handleQuickAppointment}
                          disabled={!latestReview}
                        >
                          <CalendarClock className="w-4 h-4" />
                          约下次复盘
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      点击「智能生成」基于最近7天日记创建周任务单
                    </div>
                  )}
                </div>

                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="section-title flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      执行障碍记录
                    </h3>
                    <button
                      className="btn-secondary flex items-center gap-2"
                      onClick={() => setShowObstacleForm(!showObstacleForm)}
                    >
                      <Plus className="w-4 h-4" />
                      添加
                    </button>
                  </div>

                  {showObstacleForm && (
                    <div className="mb-4 p-4 bg-slate-50 rounded-xl space-y-3">
                      <select
                        className="input-field"
                        value={newObstacle.category}
                        onChange={(e) =>
                          setNewObstacle({
                            ...newObstacle,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="">选择障碍类别</option>
                        <option value="工作安排">工作安排</option>
                        <option value="动机不足">动机不足</option>
                        <option value="情绪困扰">情绪困扰</option>
                        <option value="身体不适">身体不适</option>
                        <option value="环境因素">环境因素</option>
                        <option value="其他">其他</option>
                      </select>
                      <textarea
                        className="input-field h-20 resize-none"
                        placeholder="描述具体障碍..."
                        value={newObstacle.description}
                        onChange={(e) =>
                          setNewObstacle({
                            ...newObstacle,
                            description: e.target.value,
                          })
                        }
                      />
                      <div className="flex gap-2">
                        <button className="btn-primary flex-1" onClick={handleAddObstacle}>
                          保存
                        </button>
                        <button
                          className="btn-secondary flex-1"
                          onClick={() => setShowObstacleForm(false)}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-[340px] overflow-y-auto">
                    {clientObstacles.map((o) => (
                      <div
                        key={o.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning-500/15 text-warning-600">
                            {o.category}
                          </span>
                          <span className="text-[10px] text-slate-400">{o.date}</span>
                        </div>
                        <p className="text-sm text-slate-700">{o.description}</p>
                        {o.solution && (
                          <p className="text-xs text-mint-600 mt-2 pt-2 border-t border-slate-200">
                            ✓ {o.solution}
                          </p>
                        )}
                      </div>
                    ))}
                    {clientObstacles.length === 0 && !showObstacleForm && (
                      <div className="text-center py-6 text-slate-400 text-sm">
                        暂无执行障碍记录
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title flex items-center gap-2">
                    <FileDown className="w-5 h-5" />
                    阶段总结
                  </h3>
                  <div className="flex gap-2">
                    {clientSummaries.length > 0 && (
                      <div className="text-xs text-slate-500 mr-2 flex items-center gap-1">
                        <History className="w-3 h-3" />
                        已生成 {clientSummaries.length} 份
                      </div>
                    )}
                    <button
                      className="btn-primary flex items-center gap-2"
                      onClick={handleGenerateSummary}
                    >
                      <Download className="w-4 h-4" />
                      生成总结
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-primary-50">
                    <p className="text-xs text-primary-600 mb-1">干预周期</p>
                    <p className="font-serif text-lg font-semibold text-primary-800">
                      第 {selectedClient.currentWeek} / {selectedClient.programType}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-mint-50">
                    <p className="text-xs text-mint-600 mb-1">累计记录</p>
                    <p className="font-serif text-lg font-semibold text-primary-800">
                      {
                        getClientDiaries(selectedClient.id).filter((d) => d.submitted)
                          .length
                      }{" "}
                      天日记
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100">
                    <p className="text-xs text-slate-500 mb-1">历史回顾</p>
                    <p className="font-serif text-lg font-semibold text-primary-800">
                      {clientReviews.length} 次
                    </p>
                  </div>
                </div>

                {clientSummaries.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      历史总结
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {clientSummaries.slice(0, 3).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setViewingSummary(s)}
                          className="p-3 rounded-xl bg-slate-50 hover:bg-primary-50 border border-slate-100 hover:border-primary-200 transition-colors text-left"
                        >
                          <p className="text-xs font-medium text-slate-800 truncate">
                            {s.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {s.generatedAt}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        open={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title="阶段总结"
        width="w-[700px]"
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => setShowSummaryModal(false)}
            >
              关闭
            </button>
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleCopySummary}
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制全文
                </>
              )}
            </button>
          </>
        }
      >
        {stageSummary && selectedClient && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary-700 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-medium">
                  {selectedClient.name.slice(0, 1)}
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold">
                    {stageSummary.title}
                  </h4>
                  <p className="text-xs text-white/70">
                    {stageSummary.date} · {stageSummary.period}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-sand-100 rounded-xl p-4 border border-sand-300 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed max-h-[500px] overflow-y-auto font-sans">
              {stageSummary.fullText || stageSummary.content}
            </div>
            <p className="text-xs text-slate-400 text-center">
              可直接复制全文发送给来访者，或作为咨询档案保存。此总结已自动保存到历史记录。
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!viewingSummary}
        onClose={() => setViewingSummary(null)}
        title={viewingSummary?.title || "查看总结"}
        width="w-[650px]"
        footer={
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => {
              if (viewingSummary) {
                navigator.clipboard.writeText(
                  viewingSummary.fullText || viewingSummary.content
                );
              }
            }}
          >
            <Copy className="w-4 h-4" />
            复制全文
          </button>
        }
      >
        {viewingSummary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>生成时间：{viewingSummary.generatedAt}</span>
              {viewingSummary.period && <span>{viewingSummary.period}</span>}
            </div>
            <div className="bg-sand-100 rounded-xl p-4 border border-sand-300 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed max-h-[450px] overflow-y-auto">
              {viewingSummary.fullText || viewingSummary.content}
            </div>
          </div>
        )}
      </Modal>

      <AppointmentModal
        open={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        initialClientId={selectedClientId || undefined}
        initialNotes={appointmentNotes}
      />
    </div>
  );
}

function ClientOverviewCard({ client }: { client: Client }) {
  const [expanded, setExpanded] = useState(true);
  const openSidebar = useSleepCoachStore((s) => s.openSidebar);
  const getClientFlowHistory = useSleepCoachStore((s) => s.getClientFlowHistory);
  const flowHistory = getClientFlowHistory(client.id);

  return (
    <div className="card p-5">
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            openSidebar(client.id);
          }}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-medium hover:ring-2 hover:ring-primary-300 transition-all",
            client.gender === "女" ? "bg-rose-400" : "bg-primary-500"
          )}
        >
          {client.name.slice(0, 1)}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openSidebar(client.id);
              }}
              className="font-serif text-xl font-semibold text-primary-800 hover:text-primary-600 hover:underline transition-colors"
            >
              {client.name}
            </button>
            <StatusBadge status={client.status} />
            <IntensityBadge intensity={client.intensity} />
            {flowHistory.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                <History className="w-3 h-3" />
                已套用 {flowHistory.length} 次
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>
              {client.gender} · {client.age}岁
            </span>
            <span>
              {client.programType}干预 · W{client.currentWeek}
            </span>
            <span className="flex items-center gap-1">
              <Moon className="w-3 h-3" />
              {client.sleepWindowBed}
              <Sun className="w-3 h-3 ml-2" />
              {client.sleepWindowWake}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">日记完成率</p>
            <p className="font-serif text-xl font-semibold text-mint-600">
              {client.diaryCompletionRate}%
            </p>
          </div>
          {expanded ? (
            <ChevronRight className="w-5 h-5 text-slate-400 -rotate-90" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400 rotate-90" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">标签</p>
            <div className="flex gap-1 flex-wrap">
              {client.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">边界设置</p>
            <div className="flex gap-1 flex-wrap">
              {client.boundaries.length > 0 ? (
                client.boundaries.map((b) => (
                  <span
                    key={b}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-600"
                  >
                    {b}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">无特殊设置</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">最近联系</p>
            <p className="text-sm text-slate-700">{client.lastContactDate}</p>
          </div>
        </div>
      )}
    </div>
  );
}
