import { useState } from "react";
import { Copy, Check, Download, X, FileText } from "lucide-react";
import type { DeliveryPackage } from "../types";

interface Props {
  pkg: DeliveryPackage;
  clientName: string;
  onClose: () => void;
}

export default function DeliveryPackageModal({ pkg, clientName, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pkg.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pkg.fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clientName}_第${pkg.weekNumber}周_交付包.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-slate-800">
                {pkg.title}
              </h3>
              <p className="text-xs text-slate-500">生成日期：{pkg.generatedAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="btn-secondary flex items-center gap-1.5 !py-1.5 !px-3"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "已复制" : "复制全文"}
            </button>
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center gap-1.5 !py-1.5 !px-3"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100">
            {pkg.fullText}
          </pre>
        </div>
      </div>
    </div>
  );
}
