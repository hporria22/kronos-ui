`import React from "react";
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

// Stroke color for the gauge arc — keyed to the same tone system as the badges,
// so a card's status reads identically whether you look at the badge or the dial.
const toneStroke: Record<DashboardStat["tone"], string> = {
  teal: "text-[color:var(--teal)]",
  navy: "text-slate-500",
  green: "text-emerald-500",
  red: "text-rose-500",
};

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  testid: string;
  chip: string; // resting icon-chip color, distinct per destination
}

const greet = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
};

/** Small half-circle instrument dial. Reads as a gauge, not a progress bar. */
const MiniGauge: React.FC<{ percent: number; strokeClass: string }> = ({ percent, strokeClass }) => {
  const clamped = Math.min(100, Math.max(4, percent));
  const r = 20;
  const circumference = Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <svg width="52" height="30" viewBox="0 0 52 30" className="shrink-0 overflow-visible" aria-hidden="true">
      <path d="M 6 27 A 20 20 0 0 1 46 27" fill="none" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
      <motion.path
        d="M 6 27 A 20 20 0 0 1 46 27"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
        className={strokeClass}
      />
    </svg>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const nav = useNavigate();

  const quickActions: QuickAction[] = [
    { label: "Generate Report", icon: FileText, to: "/app/reports", testid: "qa-reports", chip: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "Run a Query", icon: Database, to: "/app/queries", testid: "qa-queries", chip: "bg-[#F0FDF9] text-[color:var(--teal)] border-[color:var(--teal)]/20" },
    { label: "Validate File", icon: ShieldCheck, to: "/app/validation", testid: "qa-validation", chip: "bg-slate-50 text-slate-700 border-slate-200" },
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
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
          <span className="k-pulse-dot" />
          <span className="uppercase tracking-wider text-[10.5px] font-semibold text-slate-400">Live</span>
          <span className="w-px h-3 bg-slate-200" />
          <span className="mono text-slate-600">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-grid">
        {dashboardStats.map((s, i) => {
          const negative = s.delta.startsWith("-");
          const percent = 40 + i * 15;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="k-card k-lift relative overflow-hidden"
            >
              {/* status rail — the one recurring signature element across the app */}
              <span
                aria-hidden="true"
                className={`absolute left-0 top-0 h-full w-[3px] ${
                  s.tone === "teal" ? "bg-[color:var(--teal)]" : s.tone === "navy" ? "bg-slate-300" : s.tone === "green" ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{s.label}</div>
              <div className="flex items-end justify-between mt-3">
                <div className="mono text-[32px] leading-none font-semibold text-slate-900">{s.value}</div>
                <MiniGauge percent={percent} strokeClass={toneStroke[s.tone]} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${toneStyle[s.tone]}`}>
                  {negative ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  {s.delta}
                </span>
                <span className="text-[10.5px] text-slate-400 mono">{percent}%</span>
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
                  <span className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${a.chip}`}>
                    <a.icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="text-[13.5px] font-medium text-slate-900">{a.label}</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[color:var(--teal)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
          <ul className="relative" data-testid="activity-list">
            {/* connecting rail behind the dots — reads as a timeline, not a list */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" aria-hidden="true" />
            {recentActivity.map((e, i) => (
              <li key={i} className="relative py-3 pl-6 flex items-start gap-3">
                <span
                  className={`absolute left-0 top-[18px] w-3.5 h-3.5 -translate-x-[1px] rounded-full border-2 border-white shadow-sm ${
                    i === 0 ? "bg-[color:var(--teal)] ring-2 ring-[color:var(--teal)]/25" : "bg-slate-300"
                  }`}
                />
                <div className="flex-1 min-w-0">
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