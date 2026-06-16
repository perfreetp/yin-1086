import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "w-[560px]",
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl ${width} max-h-[90vh] flex flex-col animate-slide-up`}
      >
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="font-serif text-xl font-semibold text-primary-800">
              {title}
            </h2>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <button
            className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && (
          <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
