import { useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  FileText,
  Brain,
  Sparkles,
  Copy,
  Check,
  Eye,
  Filter,
  UserPlus,
  Target,
  ClipboardList,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Send,
  File,
  ListChecks,
} from "lucide-react";
import { useSleepCoachStore } from "../store";
import PageHeader from "../components/PageHeader";
import { IntensityBadge, StatusBadge } from "../components/Badges";
import type { MaterialTemplate, Intensity, Client, ProgramFlow, MaterialSendRecord, MaterialSendStatus } from "../types";
import { programFlows, getFlowByProgram } from "../data/programFlows";
import { cn } from "../lib/utils";

const categories = [
  "全部",
  "认知行为",
  "行为练习",
  "放松练习",
  "评估工具",
  "应急方案",
  "特殊人群",
  "流程模板",
];

export default function MaterialsPage() {
  const materials = useSleepCoachStore((s) => s.materials);
  const clients = useSleepCoachStore((s) => s.clients);
  const applyFlowToClient = useSleepCoachStore((s) => s.applyFlowToClient);
  const materialSendRecords = useSleepCoachStore((s) => s.materialSendRecords);
  const updateMaterialSendStatus = useSleepCoachStore((s) => s.updateMaterialSendStatus);
  const generateWeekMaterialRecords = useSleepCoachStore((s) => s.generateWeekMaterialRecords);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");
  const [intensity, setIntensity] = useState<Intensity | "通用" | "全部">("全部");
  const [selected, setSelected] = useState<MaterialTemplate | null>(null);
  const [copied, setCopied] = useState(false);
  const [applyClientId, setApplyClientId] = useState<string>("");
  const [applyNote, setApplyNote] = useState<string>("");
  const [appliedSuccess, setAppliedSuccess] = useState<string | null>(null);
  const [appliedFlowView, setAppliedFlowView] = useState<ProgramFlow | null>(null);
  const [appliedClientView, setAppliedClientView] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<"library" | "sendlist">("library");
  const [selectedSendClient, setSelectedSendClient] = useState<string>("");
  const [checkedRecords, setCheckedRecords] = useState<Set<string>>(new Set());

  const activeClients = clients.filter((c) => c.status !== "已结案");

  const sendListData = useMemo(() => {
    const clientIdsWithPending = new Set<string>();
    materialSendRecords.forEach((r) => {
      const client = clients.find((c) => c.id === r.clientId);
      if (client && client.status !== "已结案") {
        clientIdsWithPending.add(r.clientId);
      }
    });

    return activeClients
      .filter((c) => clientIdsWithPending.has(c.id))
      .map((c) => {
        const records = materialSendRecords
          .filter((r) => r.clientId === c.id)
          .sort((a, b) => a.weekNumber - b.weekNumber);
        const pending = records.filter((r) => r.status === "pending");
        const sent = records.filter((r) => r.status === "sent");
        const applied = records.filter((r) => r.status === "applied");
        return { client: c, records, pending, sent, applied };
      })
      .filter((d) => d.pending.length > 0)
      .sort((a, b) => b.pending.length - a.pending.length);
  }, [activeClients, materialSendRecords, clients]);

  const batchMarkSent = () => {
    checkedRecords.forEach((id) => {
      updateMaterialSendStatus(id, "sent");
    });
    setCheckedRecords(new Set());
  };

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      if (search && !m.name.includes(search) && !m.content.includes(search)) return false;
      if (category !== "全部" && m.category !== category) return false;
      if (intensity !== "全部" && m.intensity !== intensity) return false;
      return true;
    });
  }, [materials, search, category, intensity]);

  const grouped = useMemo(() => {
    const groups: Record<string, MaterialTemplate[]> = {};
    filtered.forEach((m) => {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    });
    return groups;
  }, [filtered]);

  const isFlowTemplate = (m: MaterialTemplate | null) => m?.category === "流程模板";

  const matchedFlow = useMemo(() => {
    if (!selected || !isFlowTemplate(selected)) return null;
    const match = programFlows.find(
      (f) => selected.name.includes(f.intensity) && selected.name.includes(f.programType)
    );
    return match || null;
  }, [selected]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!matchedFlow || !applyClientId) return;
    applyFlowToClient(applyClientId, matchedFlow.id, applyNote);
    const client = clients.find((c) => c.id === applyClientId);
    setAppliedSuccess(client?.name || "该来访者");
    setAppliedFlowView(matchedFlow);
    setAppliedClientView(client || null);
    setApplyNote("");
    setTimeout(() => setAppliedSuccess(null), 3000);
  };

  return (
    <div>
      <PageHeader title="训练素材" subtitle="认知练习库、作业模板与流程版本管理" />

      <div className="card overflow-hidden mb-6">
        <div className="flex items-center gap-2 p-2 border-b border-slate-100">
          {([
            { key: "library" as const, label: "素材库", icon: BookOpen },
            { key: "sendlist" as const, label: "发送清单", icon: ListChecks },
          ]).map((tab) => (
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
              {tab.key === "sendlist" && sendListData.length > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-warning-500/20 text-warning-600"
                )}>
                  {sendListData.reduce((s, d) => s + d.pending.length, 0)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "sendlist" ? (
        <SendListView
          sendListData={sendListData}
          checkedRecords={checkedRecords}
          setCheckedRecords={setCheckedRecords}
          batchMarkSent={batchMarkSent}
          updateMaterialSendStatus={updateMaterialSendStatus}
          selectedSendClient={selectedSendClient}
          setSelectedSendClient={setSelectedSendClient}
          generateWeekMaterialRecords={generateWeekMaterialRecords}
        />
      ) : (
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 space-y-4">
          <div className="card p-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索素材名称或内容..."
                  className="input-field pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((c) => (
                  <button
                    key={c}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      category === c
                        ? "bg-primary-700 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {(["全部", "入门", "标准", "强化", "通用"] as const).map((i) => (
                  <button
                    key={i}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      intensity === i
                        ? "bg-mint-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                    onClick={() => setIntensity(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <CategoryIcon category={cat} />
                  <h3 className="text-sm font-semibold text-slate-700">{cat}</h3>
                  <span className="text-xs text-slate-400">({items.length})</span>
                </div>
                <div className="space-y-2">
                  {items.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "card p-4 cursor-pointer transition-all",
                        selected?.id === m.id
                          ? "ring-2 ring-primary-400 border-primary-200 bg-primary-50/30"
                          : "card-hover"
                      )}
                      onClick={() => {
                        setSelected(m);
                        setAppliedFlowView(null);
                        setAppliedClientView(null);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-slate-800">{m.name}</h4>
                            {m.isBuiltIn && (
                              <span className="flex items-center gap-0.5 text-[10px] text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                                <Sparkles className="w-2.5 h-2.5" />
                                内置
                              </span>
                            )}
                            {m.category === "流程模板" && (
                              <span className="text-[10px] text-mint-700 bg-mint-50 px-1.5 py-0.5 rounded">
                                可套用
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {m.content.slice(0, 60)}...
                          </p>
                        </div>
                        <IntensityBadge intensity={m.intensity} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-7">
          {selected ? (
            <div className="card p-6 sticky top-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <IntensityBadge intensity={selected.intensity} />
                    <span className="text-xs text-slate-500">{selected.category}</span>
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-primary-800">
                    {selected.name}
                  </h2>
                </div>
                <div className="flex gap-2">
                  {isFlowTemplate(selected) && matchedFlow && (
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <select
                          className="input-field text-xs py-1.5 !h-auto flex-1"
                          value={applyClientId}
                          onChange={(e) => setApplyClientId(e.target.value)}
                        >
                          <option value="">选择来访者...</option>
                          {activeClients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} (W{c.currentWeek}/{c.programType})
                            </option>
                          ))}
                        </select>
                        <button
                          className={cn(
                            "btn-secondary flex items-center gap-1.5 flex-shrink-0",
                            !applyClientId && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={handleApply}
                          disabled={!applyClientId}
                        >
                          <UserPlus className="w-4 h-4" />
                          套用
                        </button>
                      </div>
                      <input
                        type="text"
                        className="input-field text-xs py-1.5 !h-auto"
                        placeholder="套用备注（可选，如：调整强度、更换方案等）"
                        value={applyNote}
                        onChange={(e) => setApplyNote(e.target.value)}
                      />
                    </div>
                  )}
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={() => handleCopy(selected.content)}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制内容
                      </>
                    )}
                  </button>
                </div>
              </div>

              {appliedSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-mint-50 border border-mint-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-mint-600 flex-shrink-0" />
                  <span className="text-sm text-mint-700">
                    已成功将《{matchedFlow?.name}》套用到 {appliedSuccess}
                  </span>
                </div>
              )}

              {isFlowTemplate(selected) && (matchedFlow || appliedFlowView) && (
                <FlowPreview flow={matchedFlow || appliedFlowView!} client={appliedClientView} />
              )}

              {(!isFlowTemplate(selected) || !matchedFlow) && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                    {selected.content}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-12 sticky top-8 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-slate-700 mb-2">
                选择素材查看详情
              </h3>
              <p className="text-sm text-slate-500">
                点击左侧素材卡片，在此预览完整内容并可一键复制
                <br />
                <span className="text-primary-600">流程模板可直接套用到来访者</span>
              </p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

function FlowPreview({ flow, client }: { flow: ProgramFlow; client: Client | null }) {
  return (
    <div className="space-y-3">
      {client && (
        <div className="p-3 rounded-xl bg-primary-50 border border-primary-100 flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0",
              client.gender === "女" ? "bg-rose-400" : "bg-primary-500"
            )}
          >
            {client.name.slice(0, 1)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-800">{client.name}</span>
              <StatusBadge status={client.status} />
            </div>
            <p className="text-xs text-slate-500">
              正在套用：{flow.name} · {flow.weeks.length}周
            </p>
          </div>
          <CheckCircle className="w-5 h-5 text-mint-600" />
        </div>
      )}

      <div className="p-4 rounded-xl bg-mint-50 border border-mint-100">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-mint-600" />
          <span className="text-sm font-medium text-mint-700">流程概述</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{flow.description}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-primary-600 border border-primary-100">
            {flow.intensity}强度
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-mint-600 border border-mint-100">
            {flow.programType}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
            {flow.weeks.length}周 · {flow.weeks.reduce((s, w) => s + w.tasks.length, 0)}个任务
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {flow.weeks.map((week, idx) => (
          <div
            key={week.weekNumber}
            className={cn(
              "p-3 rounded-xl border transition-all",
              client && idx + 1 === client.currentWeek
                ? "bg-primary-50 border-primary-300"
                : "bg-white border-slate-100"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0",
                  client && idx + 1 === client.currentWeek
                    ? "bg-primary-700 text-white"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                W{week.weekNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">{week.focus}</span>
                  {client && idx + 1 === client.currentWeek && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-700 text-white">
                      当前
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </div>
            <div className="pl-9 space-y-1.5">
              {week.tasks.length > 0 && (
                <div>
                  <p className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                    <ClipboardList className="w-3 h-3" />
                    任务
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {week.tasks.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                      >
                        {t.length > 20 ? t.slice(0, 20) + "..." : t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {week.materials.length > 0 && (
                <div>
                  <p className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    素材
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {week.materials.map((m, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-mint-50 text-mint-700 border border-mint-100"
                      >
                        {m.length > 20 ? m.slice(0, 20) + "..." : m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, typeof BookOpen> = {
    认知行为: Brain,
    行为练习: FileText,
    放松练习: Sparkles,
    评估工具: FileText,
    应急方案: Filter,
    特殊人群: BookOpen,
    流程模板: BookOpen,
  };
  const Icon = icons[category] || BookOpen;
  return <Icon className="w-4 h-4 text-primary-500" />;
}

function SendListView({
  sendListData,
  checkedRecords,
  setCheckedRecords,
  batchMarkSent,
  updateMaterialSendStatus,
  selectedSendClient,
  setSelectedSendClient,
  generateWeekMaterialRecords,
}: {
  sendListData: { client: Client; records: MaterialSendRecord[]; pending: MaterialSendRecord[]; sent: MaterialSendRecord[]; applied: MaterialSendRecord[] }[];
  checkedRecords: Set<string>;
  setCheckedRecords: React.Dispatch<React.SetStateAction<Set<string>>>;
  batchMarkSent: () => void;
  updateMaterialSendStatus: (id: string, status: MaterialSendStatus) => void;
  selectedSendClient: string;
  setSelectedSendClient: (id: string) => void;
  generateWeekMaterialRecords: (clientId: string) => void;
}) {
  const toggleCheck = (id: string) => {
    setCheckedRecords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllForClient = (records: MaterialSendRecord[]) => {
    const pendingIds = records.filter((r) => r.status === "pending").map((r) => r.id);
    const allChecked = pendingIds.every((id) => checkedRecords.has(id));
    setCheckedRecords((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        pendingIds.forEach((id) => next.delete(id));
      } else {
        pendingIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          按来访者汇总本周待发送素材，勾选后可批量标记已发送
        </p>
        {checkedRecords.size > 0 && (
          <button
            className="btn-primary flex items-center gap-2"
            onClick={batchMarkSent}
          >
            <Send className="w-4 h-4" />
            批量标记已发送（{checkedRecords.size}）
          </button>
        )}
      </div>

      {sendListData.length === 0 ? (
        <div className="card p-12 text-center">
          <ListChecks className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="font-serif text-lg font-semibold text-slate-600 mb-2">
            暂无待发送素材
          </h3>
          <p className="text-sm text-slate-500">
            套用流程后会自动生成本周素材清单，也可点击下方按钮为来访者刷新素材
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <select
              className="input-field text-sm w-48"
              value={selectedSendClient}
              onChange={(e) => setSelectedSendClient(e.target.value)}
            >
              <option value="">选择来访者...</option>
              {sendListData.length === 0 && (
                <option value="">暂无待发送</option>
              )}
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sendListData.map(({ client, pending, sent, applied }) => (
            <div key={client.id} className="card overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white font-medium",
                  client.gender === "女" ? "bg-rose-400" : "bg-primary-500"
                )}>
                  {client.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base font-semibold text-slate-800">{client.name}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      W{client.currentWeek}/{client.programType}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="text-amber-600">待发送 {pending.length}</span>
                    <span className="text-primary-600">已发送 {sent.length}</span>
                    <span className="text-mint-600">已套用 {applied.length}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                    onClick={() => generateWeekMaterialRecords(client.id)}
                  >
                    刷新素材
                  </button>
                  {pending.length > 0 && (
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors flex items-center gap-1"
                      onClick={() => toggleAllForClient(pending)}
                    >
                      {pending.every((r) => checkedRecords.has(r.id)) ? "取消全选" : "全选"}
                    </button>
                  )}
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {pending.map((rec) => (
                  <div key={rec.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={checkedRecords.has(rec.id)}
                      onChange={() => toggleCheck(rec.id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <File className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{rec.materialName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>第{rec.weekNumber}周</span>
                        {rec.taskName && (
                          <>
                            <span>·</span>
                            <span className="text-primary-500">关联任务：{rec.taskName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      className="text-xs px-2.5 py-1 rounded-lg border border-primary-200 text-primary-600 hover:bg-primary-50 transition-colors flex items-center gap-1"
                      onClick={() => updateMaterialSendStatus(rec.id, "sent")}
                    >
                      <Send className="w-3 h-3" />
                      标记已发送
                    </button>
                  </div>
                ))}
                {sent.map((rec) => (
                  <div key={rec.id} className="flex items-center gap-3 px-4 py-3 bg-slate-50/30">
                    <div className="w-4" />
                    <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Send className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-600 truncate">{rec.materialName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>第{rec.weekNumber}周</span>
                        {rec.sentAt && <span>· 发送于 {rec.sentAt}</span>}
                        {rec.taskName && <span className="text-primary-500">· {rec.taskName}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 border border-primary-100">
                      已发送
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
