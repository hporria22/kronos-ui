import React from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, Database, ShieldCheck, LogOut, User2, Settings, ChevronDown } from "lucide-react";
import AdaniLogo from "./adaniLogo";
import { useAuth } from "../lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";

interface TabDef {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  testid: string;
}

const tabs: TabDef[] = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "tab-dashboard" },
  { to: "/app/reports", label: "Reports", icon: FileText, testid: "tab-reports" },
  { to: "/app/queries", label: "Database Queries", icon: Database, testid: "tab-queries" },
  { to: "/app/validation", label: "Validation", icon: ShieldCheck, testid: "tab-validation" },
];

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = (): void => {
    logout();
    toast.success("Signed out");
    nav("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="app-layout">
      <header className="k-header px-6 sm:px-10 py-[18px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AdaniLogo height={28} data-testid="adani-logo-header" />
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-[#1E293B]">
            <span className="text-[15px] font-semibold text-slate-100 tracking-tight">Kronos</span>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 px-2 py-0.5 rounded-full border border-slate-700">
              v2.4
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-testid="user-menu-trigger"
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 transition-colors"
            >
              <Avatar className="h-7 w-7 bg-[color:var(--teal)] text-white text-[11px]">
                <AvatarFallback className="bg-[color:var(--teal)] text-white font-semibold text-[11px]">
                  {user?.avatar || "HP"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-[12.5px] text-slate-100 font-medium">{user?.name || "Harsh"}</span>
                <span className="text-[10.5px] text-slate-500">{user?.role || "Engineer"}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold">{user?.name}</span>
                <span className="text-[11.5px] text-slate-500">{user?.email}</span>
                <span className="text-[10.5px] text-slate-400 mt-1 uppercase tracking-wider">{user?.plant}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-profile" onClick={() => nav("/app/profile")}>
              <User2 className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-settings" onClick={() => toast.info("Settings — coming soon")}>
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-logout" onClick={handleLogout} className="text-red-600 focus:text-red-700">
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <nav className="k-tabs px-6 sm:px-10 flex gap-0.5 overflow-x-auto k-scroll" data-testid="tabs-nav">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            data-testid={t.testid}
            className={({ isActive }) => `k-tab ${isActive ? "active" : ""}`}
          >
            <t.icon className="w-[17px] h-[17px] k-tab-icon" strokeWidth={1.7} />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 px-6 sm:px-10 py-8 max-w-[1500px] w-full mx-auto" data-testid="page-content">
        <Outlet />
      </main>

      <footer className="px-6 sm:px-10 py-4 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-200 bg-white/40">
        <span>© {new Date().getFullYear()} Adani Group · Kronos</span>
        <span className="mono">Last sync · 2 min ago</span>
      </footer>
    </div>
  );
};

export default Layout;