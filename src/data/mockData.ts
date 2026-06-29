export interface QueryType {
  value: string;
  label: string;
}

export interface QueryResult {
  columns: string[];
  rows: Array<Array<string | number>>;
}

export interface ValidationRow {
  ep: string;
  name: string;
  plant: string;
  trade: string;
  skill: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
  issue: string;
}

export interface DashboardStat {
  label: string;
  value: number | string;
  delta: string;
  tone: "teal" | "navy" | "green" | "red";
}

export interface ActivityItem {
  time: string;
  actor: string;
  action: string;
  detail: string;
}

export const queryTypes: QueryType[] = [
  { value: "ep_attendance", label: "EP Attendance Lookup" },
  { value: "wo_active", label: "Active Work Orders" },
  { value: "kpi_failed", label: "Failed KPI Records" },
  { value: "plant_compliance", label: "Plant Compliance Index" },
  { value: "intra_transfers", label: "Intra Transfers (90d)" },
];

// export const sampleSql: Record<string, string> = {
//   ep_attendance:
//     "SELECT * FROM VP_WORKMENDETAILS",
//   wo_active:
//     "SELECT * FROM CMSWORKORDER",
//   intra_transfers:
//     "SELECT transfer_id, ep_no, from_plant, to_plant, effective_dtnFROM hr.intra_transfersnWHERE effective_dt >= CURRENT_DATE - INTERVAL '90' DAYnORDER BY effective_dt DESC;",
// };

export const queryResults: Record<string, QueryResult> = {
  ep_attendance: {
    columns: ["EP No", "Name", "Plant", "Present", "Leave", "Status"],
    rows: [
      ["910067289", "Rahul Singh", "P001", 26, 2, "success"],
      ["910067290", "Pooja Verma", "P001", 24, 4, "success"],
      ["910067291", "Imran Khan", "P002", 18, 10, "warning"],
      ["910067292", "Neha Patel", "P002", 28, 0, "success"],
      ["910067293", "Kabir Joshi", "P003", 12, 16, "failed"],
      ["910067294", "Aditi Rao", "P003", 25, 3, "success"],
      ["910067295", "Vihaan Shah", "P004", 22, 6, "warning"],
    ],
  },
  wo_active: {
    columns: ["WO ID", "Vendor", "Scope", "Start", "End", "Status"],
    rows: [
      ["WO-44021", "Larsen Mech.", "Conveyor maintenance", "2026-01-04", "2026-03-12", "success"],
      ["WO-44022", "Bharat Elec.", "Switchgear retrofit", "2025-12-18", "2026-02-28", "warning"],
      ["WO-44023", "Tata Projects", "Berth crane overhaul", "2026-01-22", "2026-04-30", "success"],
      ["WO-44024", "GMR Infra", "Drainage upgrade", "2025-11-09", "2026-02-09", "failed"],
      ["WO-44025", "L&T", "Substation audit", "2026-02-02", "2026-03-20", "success"],
    ],
  },
  kpi_failed: {
    columns: ["KPI ID", "Name", "Severity", "Plant", "Fails", "Last Failed"],
    rows: [
      ["KPI-018", "Bill verification mismatch", "High", "P002", 42, "2026-02-09 14:22"],
      ["KPI-022", "WO closure overdue", "Medium", "P001", 17, "2026-02-08 09:11"],
      ["KPI-031", "EP renewal lapse", "High", "P004", 26, "2026-02-07 18:50"],
      ["KPI-045", "Bulk upload anomaly", "Low", "P003", 5, "2026-02-06 11:04"],
    ],
  },
  plant_compliance: {
    columns: ["Plant", "Name", "Score", "Audits Pending"],
    rows: [
      ["P001", "Mundra Port", 96, 1],
      ["P002", "Dahej Petrochem", 88, 4],
      ["P003", "Hazira Terminal", 79, 7],
      ["P004", "Krishnapatnam", 92, 2],
    ],
  },
  intra_transfers: {
    columns: ["Transfer", "EP No", "From", "To", "Effective"],
    rows: [
      ["TR-9012", "910067291", "P002", "P001", "2026-01-22"],
      ["TR-9013", "910067303", "P003", "P004", "2026-01-30"],
      ["TR-9014", "910067317", "P004", "P002", "2026-02-04"],
    ],
  },
};

export const validationRows: ValidationRow[] = [
  { ep: "910067289", name: "Rahul Singh", plant: "P001", trade: "Welder", skill: "L3", status: "SUCCESS", issue: "—" },
  { ep: "910067290", name: "Pooja Verma", plant: "P001", trade: "Fitter", skill: "L2", status: "SUCCESS", issue: "—" },
  { ep: "910067291", name: "Imran Khan", plant: "P002", trade: "Rigger", skill: "L1", status: "WARNING", issue: "EP expiring in 14 days" },
  { ep: "910067292", name: "Neha Patel", plant: "P002", trade: "Electrician", skill: "L3", status: "SUCCESS", issue: "—" },
  { ep: "910067293", name: "Kabir Joshi", plant: "P003", trade: "Welder", skill: "—", status: "FAILED", issue: "Skill code missing" },
  { ep: "910067294", name: "Aditi Rao", plant: "P003", trade: "Operator", skill: "L2", status: "SUCCESS", issue: "—" },
  { ep: "910067295", name: "Vihaan Shah", plant: "P004", trade: "Fitter", skill: "L1", status: "WARNING", issue: "Trade not aligned to WO" },
  { ep: "910067296", name: "Sara Iyer", plant: "P004", trade: "Crane Op.", skill: "L3", status: "FAILED", issue: "Plant code unknown" },
  { ep: "910067297", name: "Manish Bose", plant: "P001", trade: "Welder", skill: "L2", status: "SUCCESS", issue: "—" },
];

export const dashboardStats: DashboardStat[] = [
  { label: "Active EPs Tracked", value: 263632, delta: "+8%", tone: "teal" },
  { label: "Businesses", value: 12, delta: "+1.2%", tone: "navy" },
  { label: "Validation Pass Rate", value: "94.6%", delta: "+0.4%", tone: "green" },
  { label: "Failed KPIs (24h)", value: 27, delta: "-12%", tone: "red" },
];

export const recentActivity: ActivityItem[] = [
  { time: "2 min ago", actor: "Nikita Kosti", action: "ran Database Query", detail: "Active Work Orders · APL" },
  { time: "14 min ago", actor: "Ashish Makwana", action: "downloaded Attendance Report", detail: "P001 · Jan 2026" },
  { time: "31 min ago", actor: "Jaydeep Thaker", action: "completed Failed KPI run", detail: "27 records · 3 plants" },
  { time: "1 hr ago", actor: "Kashish", action: "uploaded Bulk Validation file", detail: "324 rows · 96.3% pass" },
  { time: "3 hr ago", actor: "Vipul Patel", action: "emailed Failed KPI summary", detail: "Compliance leads · 8 recipients" },
];