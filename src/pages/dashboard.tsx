
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, FileText, Database, ShieldCheck, Activity, Clock } from "lucide-react";
import { dashboardStats, recentActivity, type DashboardStat } from "../data/mockData";
import { useAuth } from "../lib/auth";

const toneStyle: Record<DashboardStat["tone"], string> = {
  teal: "bg-[#F0FDF9] text-[color:var(--teal)] border-[color:var(--teal)]/20",
  navy: "bg-slate-50 text-slate-700 border-slate-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-rose-50 text-rose-700 border-rose-200",
};

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  testid: string;
}

const greet = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const nav = useNavigate();

  const quickActions: QuickAction[] = [
    { label: "Generate Report", icon: FileText, to: "/app/reports", testid: "qa-reports" },
    { label: "Run a Query", icon: Database, to: "/app/queries", testid: "qa-queries" },
    { label: "Validate File", icon: ShieldCheck, to: "/app/validation", testid: "qa-validation" },
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="k-stripe-gradient w-10 mb-3" />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Good {greet()}, {user?.name?.split(" ")[0] || "there"}.
          </h2>
          <p className="text-[13.5px] text-slate-500 mt-1">
            Here is what is happening across the Adani group today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="k-pulse-dot" />
          Real-time sync · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-grid">
        {dashboardStats.map((s, i) => {
          const negative = s.delta.startsWith("-");
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="k-card k-lift"
            >
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{s.label}</div>
              <div className="flex items-end justify-between mt-3">
                <div className="mono text-[32px] leading-none font-semibold text-slate-900">{s.value}</div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${toneStyle[s.tone]}`}>
                  {negative ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  {s.delta}
                </span>
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${40 + i * 15}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.05 }}
                  className="h-full bg-[color:var(--teal)]/70 rounded-full"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 k-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Quick Actions</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">Jump straight to common workflows</p>
            </div>
            <Activity className="w-4 h-4 text-[color:var(--teal)]" />
          </div>
          <div className="space-y-2.5">
            {quickActions.map((a) => (
              <button
                key={a.label}
                data-testid={a.testid}
                onClick={() => nav(a.to)}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 hover:border-[color:var(--teal)] hover:bg-[#F0FDF9] px-4 py-3 text-left transition-colors group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-slate-50 group-hover:bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-[color:var(--teal)] transition-colors">
                    <a.icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="text-[13.5px] font-medium text-slate-900">{a.label}</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[color:var(--teal)] transition-colors" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 k-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">Latest events across your workspace</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <ul className="divide-y divide-slate-100" data-testid="activity-list">
            {recentActivity.map((e, i) => (
              <li key={i} className="py-3 flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-[color:var(--teal)] flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-[13.5px] text-slate-900">
                    <span className="font-medium">{e.actor}</span> {e.action}
                  </div>
                  <div className="text-[12px] text-slate-500 mt-0.5">{e.detail}</div>
                </div>
                <span className="text-[11.5px] text-slate-400 mono whitespace-nowrap">{e.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;