import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  Calendar,
  FileText,
  BookOpen,
  BarChart3,
  Bell,
  Moon,
} from "lucide-react";
import { useSleepCoachStore } from "../store";

const navItems = [
  { path: "/clients", label: "个案列表", icon: Users },
  { path: "/schedule", label: "排程面板", icon: Calendar },
  { path: "/diary", label: "日记审阅", icon: FileText },
  { path: "/materials", label: "训练素材", icon: BookOpen },
  { path: "/review", label: "周回顾", icon: BarChart3 },
  { path: "/alerts", label: "提醒中心", icon: Bell },
];

export default function Sidebar() {
  const location = useLocation();
  const alertCount = useSleepCoachStore((s) => s.getUnresolvedAlertsCount());

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col">
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-semibold text-primary-800">
              睡眠排程工作台
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">CBT-I Coach Studio</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(path);
          const showBadge = path === "/alerts" && alertCount > 0;
          return (
            <NavLink
              key={path}
              to={path}
              className={`nav-item ${isActive ? "nav-item-active" : ""}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
              {showBadge && (
                <span className="ml-auto bg-warning-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  {alertCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="px-4 py-3 rounded-xl bg-sand-100">
          <p className="text-xs text-slate-500">今日日期</p>
          <p className="font-serif text-base font-semibold text-primary-800 mt-1">
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
      </div>
    </aside>
  );
}
