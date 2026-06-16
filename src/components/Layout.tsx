import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-sand-100">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="min-h-screen p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
