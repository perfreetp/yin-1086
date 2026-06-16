import { useMemo, useState } from "react";
import { BookOpen, Search, FileText, Brain, Sparkles, Copy, Check, Eye, Filter } from "lucide-react";
import { useSleepCoachStore } from "../store";
import PageHeader from "../components/PageHeader";
import { IntensityBadge } from "../components/Badges";
import type { MaterialTemplate, Intensity } from "../types";
import { cn } from "../lib/utils";

const categories = ["全部", "认知行为", "行为练习", "放松练习", "评估工具", "应急方案", "特殊人群", "流程模板"];

export default function MaterialsPage() {
  const materials = useSleepCoachStore((s) => s.materials);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");
  const [intensity, setIntensity] = useState<Intensity | "通用" | "全部">("全部");
  const [selected, setSelected] = useState<MaterialTemplate | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="训练素材"
        subtitle="认知练习库、作业模板与流程版本管理"
      />

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
                      onClick={() => setSelected(m)}
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
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {selected.content}
                </pre>
              </div>
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
              </p>
            </div>
          )}
        </div>
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
