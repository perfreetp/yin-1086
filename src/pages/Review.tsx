import { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Plus,
  ClipboardList,
  AlertTriangle,
  FileDown,
  User,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Moon,
  Sun,
} from "lucide-react";
import { useSleepCoachStore } from "../store";
import PageHeader from "../components/PageHeader";
import { StatusBadge, IntensityBadge } from "../components/Badges";
import type { Client } from "../types";
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
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    clients[0]?.id || null
  );
  const [copied, setCopied] = useState(false);
  const [newObstacle, setNewObstacle] = useState({ category: "", description: "" });
  const [showObstacleForm, setShowObstacleForm] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const clientReviews = selectedClient ? reviews.filter((r) => r.clientId === selectedClient.id) : [];
  const clientObstacles = selectedClient ? obstacles.filter((o) => o.clientId === selectedClient.id) : [];
  const latestReview = clientReviews[clientReviews.length - 1];

  const weeklyData = useMemo(() => {
    if (!selectedClient) return [];
    const diaries = getClientDiaries(selectedClient.id);
    const weeks: { week: string; 效率: number; 时长: number }[] = [];
    for (let i = 0; i < selectedClient.currentWeek; i++) {
      const weekDiaries = diaries.slice(i * 7, (i + 1) * 7).filter((d) => d.submitted);
      if (weekDiaries.length > 0) {
        weeks.push({
          week: `W${i + 1}`,
          效率: Math.round(weekDiaries.reduce((s, d) => s + d.sleepEfficiency, 0) / weekDiaries.length),
          时长: Number(
            (weekDiaries.reduce((s, d) => s + d.totalSleepTime, 0) / weekDiaries.length).toFixed(1)
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

  const generateWeeklyTask = () => {
    if (!selectedClient || !latestReview) return "";
    return `【${selectedClient.name} · 第${latestReview.weekNumber}周睡眠任务单】

📊 本周数据汇总
· 平均睡眠效率：${latestReview.avgSleepEfficiency}%
· 平均睡眠时长：${latestReview.avgTotalSleep}小时
· 睡眠窗口调整：${latestReview.sleepWindowAdjust}

🎯 下周核心任务
${latestReview.tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}

📝 教练备注
${latestReview.summary}

🌙 睡眠窗口：${selectedClient.sleepWindowBed} - ${selectedClient.sleepWindowWake}
如有任何困难请及时沟通，我们一起调整。`;
  };

  const handleCopyTask = () => {
    navigator.clipboard.writeText(generateWeeklyTask());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <button
                  key={c.id}
                  onClick={() => setSelectedClientId(c.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                    selectedClientId === c.id
                      ? "bg-primary-700 text-white"
                      : "hover:bg-slate-100"
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                      selectedClientId === c.id
                        ? "bg-white/20 text-white"
                        : c.gender === "女"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-primary-100 text-primary-600"
                    )}
                  >
                    {c.name.slice(0, 1)}
                  </div>
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
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-9 space-y-6">
          {selectedClient && (
            <>
              <ClientOverviewCard client={selectedClient} />

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
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 10]} />
                    <ReferenceLine yAxisId="left" y={85} stroke="#4ecdc4" strokeDasharray="5 5" label={{ value: "达标线", fontSize: 10, fill: "#4ecdc4" }} />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="效率" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="时长" fill="#4ecdc4" radius={[4, 4, 0, 0]} />
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
                  {latestReview ? (
                    <div className="bg-sand-100 rounded-xl p-4 border border-sand-300 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                      {generateWeeklyTask()}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      暂无上周回顾数据
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
                        onChange={(e) => setNewObstacle({ ...newObstacle, category: e.target.value })}
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
                        onChange={(e) => setNewObstacle({ ...newObstacle, description: e.target.value })}
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

                  <div className="space-y-2 max-h-[260px] overflow-y-auto">
                    {clientObstacles.map((o) => (
                      <div key={o.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
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
                  <button className="btn-primary flex items-center gap-2">
                    <FileDown className="w-4 h-4" />
                    导出总结
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-primary-50">
                    <p className="text-xs text-primary-600 mb-1">干预周期</p>
                    <p className="font-serif text-lg font-semibold text-primary-800">
                      第 {selectedClient.currentWeek} / {selectedClient.programType}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-mint-50">
                    <p className="text-xs text-mint-600 mb-1">累计记录</p>
                    <p className="font-serif text-lg font-semibold text-primary-800">
                      {getClientDiaries(selectedClient.id).filter((d) => d.submitted).length} 天日记
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100">
                    <p className="text-xs text-slate-500 mb-1">历史回顾</p>
                    <p className="font-serif text-lg font-semibold text-primary-800">
                      {clientReviews.length} 次
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ClientOverviewCard({ client }: { client: Client }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="card p-5">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-medium",
            client.gender === "女" ? "bg-rose-400" : "bg-primary-500"
          )}
        >
          {client.name.slice(0, 1)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-serif text-xl font-semibold text-primary-800">{client.name}</h2>
            <StatusBadge status={client.status} />
            <IntensityBadge intensity={client.intensity} />
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>{client.gender} · {client.age}岁</span>
            <span>{client.programType}干预 · W{client.currentWeek}</span>
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
            <p className="font-serif text-xl font-semibold text-mint-600">{client.diaryCompletionRate}%</p>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">标签</p>
            <div className="flex gap-1 flex-wrap">
              {client.tags.map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
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
                  <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">
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
