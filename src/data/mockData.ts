import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000", // backend port
  headers: {
    "Content-Type": "application/json",
  },
});

export interface QueryType {
  value: string;
  label: string;
}

export interface QueryResult {
  columns: string[];
  rows: Array<Array<string | number>>;
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

// ---- Validation API types (matches actual backend response) ----

export type ValidationStatus = "SUCCESS" | "WARNING" | "FAILED";

export interface PolicyEntry {
  WOLLID: number;
  WONUMBER: string;
  LICENSENUMBER: string;
  LICENSETYPE: string;
  WCID: number;
  WCCODE: string;
  CONTRACTORID: number;
  UNITID: number;
  NATUREOFID: number;
  WCFROMDTM: string;
  WCTODTM: string;
  WCTOTAL: number;
  DELETESW: number;
  CREATEDDTM: string;
  UPDATEDDTM: string;
  LICENCETYPE: string;
  IsVerified: string;
  isActive: boolean;
}

export interface ValidationPreviewRow {
  EPcode: string;
  Plantcode: string;
  Deptname: string;
  section: string;
  Eicnum: string;
  VenC: string;
  Wonum: string;
  wcnum: string;
  llnum: string;
  Effdate: string;
  validitydate: string;
  wcpolicy: PolicyEntry[];
  llpolicy: PolicyEntry[];
  esicpolicy: PolicyEntry[];
  status: ValidationStatus;
  errors: string[];
  changes: string[];
  validationdone: string[];
  validationcheck: string[];
}

export interface ValidationSummary {
  success: number;
  warning: number;
  failed: number;
}

export interface ValidationApiResponse {
  summary: ValidationSummary;
  preview: ValidationPreviewRow[];
  downloadData: ValidationPreviewRow[];
}

// ---- Fake/mock validation data (for UI development without backend access) ----
// Built from real sample response shape. Swap validateFile's body back to the
// commented-out axios call once the backend endpoint is available.

const mockWcPolicy: PolicyEntry[] = [
  {
    WOLLID: 108658,
    WONUMBER: "4800085959",
    LICENSENUMBER: "38050041258660000014",
    LICENSETYPE: "WC",
    WCID: 165962,
    WCCODE: "38050041258660000014",
    CONTRACTORID: 6381,
    UNITID: 23,
    NATUREOFID: 36012,
    WCFROMDTM: "2025-09-07T00:00:00.000Z",
    WCTODTM: "2026-09-06T00:00:00.000Z",
    WCTOTAL: 4,
    DELETESW: 0,
    CREATEDDTM: "2025-09-09T16:22:16.200Z",
    UPDATEDDTM: "2026-06-23T10:36:02.123Z",
    LICENCETYPE: "WC",
    IsVerified: "Y",
    isActive: true,
  },
  {
    WOLLID: 102430,
    WONUMBER: "4800085959",
    LICENSENUMBER: "4339000/48/2027/24",
    LICENSETYPE: "WC",
    WCID: 179609,
    WCCODE: "4339000/48/2027/24",
    CONTRACTORID: 6941,
    UNITID: 23,
    NATUREOFID: 0,
    WCFROMDTM: "2026-04-01T00:00:00.000Z",
    WCTODTM: "2027-03-31T00:00:00.000Z",
    WCTOTAL: 1500,
    DELETESW: 0,
    CREATEDDTM: "2026-05-02T10:24:04.167Z",
    UPDATEDDTM: "2026-05-02T10:24:04.167Z",
    LICENCETYPE: "WC",
    IsVerified: "Y",
    isActive: true,
  },
];

const mockLlPolicy: PolicyEntry[] = [
  {
    WOLLID: 102201,
    WONUMBER: "4800085959",
    LICENSENUMBER: "2652400110056357",
    LICENSETYPE: "LL",
    WCID: 179504,
    WCCODE: "2652400110056357",
    CONTRACTORID: 6941,
    UNITID: 23,
    NATUREOFID: 0,
    WCFROMDTM: "2026-04-01T00:00:00.000Z",
    WCTODTM: "2027-03-31T00:00:00.000Z",
    WCTOTAL: 2500,
    DELETESW: 0,
    CREATEDDTM: "2026-04-30T17:43:18.293Z",
    UPDATEDDTM: "2026-04-30T17:43:18.293Z",
    LICENCETYPE: "LL",
    IsVerified: "Y",
    isActive: true,
  },
];

const mockEsicPolicy: PolicyEntry[] = [
  {
    WOLLID: 97837,
    WONUMBER: "4800085959",
    LICENSENUMBER: "23620163710070905",
    LICENSETYPE: "ESIC",
    WCID: 142676,
    WCCODE: "23620163710070905",
    CONTRACTORID: 9427,
    UNITID: 23,
    NATUREOFID: 314024,
    WCFROMDTM: "2024-07-30T00:00:00.000Z",
    WCTODTM: "2099-12-31T00:00:00.000Z",
    WCTOTAL: 900,
    DELETESW: 0,
    CREATEDDTM: "2023-07-14T15:54:59.473Z",
    UPDATEDDTM: "2024-11-24T15:14:43.530Z",
    LICENCETYPE: "ESIC",
    IsVerified: "Y",
    isActive: true,
  },
];

const baseValidationCheck = [
  "DOJ < Eff date ✅",
  "Eic exists✅",
  "Plant mapped to EIC✅",
  "WO exists✅",
  "Contractor found✅",
  "Valid WC/ESIC✅",
];

const mockPreviewRows: ValidationPreviewRow[] = [
  {
    EPcode: "9100220608",
    Plantcode: "P010",
    Deptname: "In Plant Fuel Management",
    section: "",
    Eicnum: "70024212",
    VenC: "215862",
    Wonum: "4800085959",
    wcnum: "23000244760000999215862",
    llnum: "",
    Effdate: "22/06/2026",
    validitydate: "31/03/2027",
    wcpolicy: mockWcPolicy,
    llpolicy: mockLlPolicy,
    esicpolicy: mockEsicPolicy,
    status: "FAILED",
    errors: ["Department not mapped with EIC", "Vendor name change", "Vendor not mapped to WO"],
    changes: ["Department change", "Vendor change", "EIC change"],
    validationdone: [],
    validationcheck: baseValidationCheck,
  },
  {
    EPcode: "9100270116",
    Plantcode: "P010",
    Deptname: "In Plant Fuel Management",
    section: "",
    Eicnum: "70024212",
    VenC: "215862",
    Wonum: "4800085959",
    wcnum: "23000244760000999215862",
    llnum: "",
    Effdate: "22/06/2026",
    validitydate: "31/03/2027",
    wcpolicy: mockWcPolicy,
    llpolicy: mockLlPolicy,
    esicpolicy: mockEsicPolicy,
    status: "FAILED",
    errors: ["Department not mapped with EIC", "Vendor not mapped to WO"],
    changes: ["Department change", "Vendor change", "WO change", "EIC change"],
    validationdone: [],
    validationcheck: [...baseValidationCheck, "Same Vendor Name✅"],
  },
  {
    EPcode: "9100223153",
    Plantcode: "P010",
    Deptname: "In Plant Fuel Management",
    section: "",
    Eicnum: "70024212",
    VenC: "215862",
    Wonum: "4800085959",
    wcnum: "23000244760000999215862",
    llnum: "2652400110056357",
    Effdate: "22/06/2026",
    validitydate: "31/03/2027",
    wcpolicy: mockWcPolicy,
    llpolicy: mockLlPolicy,
    esicpolicy: mockEsicPolicy,
    status: "WARNING",
    errors: [],
    changes: ["WO change"],
    validationdone: ["Manually reviewed by compliance"],
    validationcheck: [...baseValidationCheck, "Same Vendor Name✅"],
  },
  {
    EPcode: "9100067289",
    Plantcode: "P001",
    Deptname: "Materials Handling",
    section: "Yard Ops",
    Eicnum: "70011045",
    VenC: "118820",
    Wonum: "4800091122",
    wcnum: "39050022219980000031",
    llnum: "1182400110099821",
    Effdate: "01/01/2026",
    validitydate: "31/12/2026",
    wcpolicy: mockWcPolicy,
    llpolicy: mockLlPolicy,
    esicpolicy: mockEsicPolicy,
    status: "SUCCESS",
    errors: [],
    changes: [],
    validationdone: [],
    validationcheck: [...baseValidationCheck, "Same Vendor Name✅", "EP active✅"],
  },
  {
    EPcode: "9100067290",
    Plantcode: "P001",
    Deptname: "Materials Handling",
    section: "Yard Ops",
    Eicnum: "70011045",
    VenC: "118820",
    Wonum: "4800091122",
    wcnum: "39050022219980000031",
    llnum: "1182400110099821",
    Effdate: "01/01/2026",
    validitydate: "31/12/2026",
    wcpolicy: mockWcPolicy,
    llpolicy: mockLlPolicy,
    esicpolicy: mockEsicPolicy,
    status: "SUCCESS",
    errors: [],
    changes: [],
    validationdone: [],
    validationcheck: [...baseValidationCheck, "Same Vendor Name✅", "EP active✅"],
  },
];

const buildMockSummary = (rows: ValidationPreviewRow[]): ValidationSummary => ({
  success: rows.filter((r) => r.status === "SUCCESS").length,
  warning: rows.filter((r) => r.status === "WARNING").length,
  failed: rows.filter((r) => r.status === "FAILED").length,
});

/**
 * Uploads a file for validation against Kronos rules.
 * @param file The .xlsx/.xls/.csv file selected by the user
 * @param type The validation type key (e.g. "workorder", "epRenewal", "bulkUpload")
 *
 * NOTE: This currently returns FAKE/MOCK data so the UI can be built and reviewed
 * without backend/DB access. Once the real /validate endpoint is available,
 * delete the mock block below and uncomment the real axios call.
 */
export const validateFile = async (file: File, type: string): Promise<ValidationApiResponse> => {
  // ---- FAKE RESPONSE (remove once backend is ready) ----
  console.info(`[mock] validateFile called with file="${file.name}", type="${type}"`);
  await new Promise((resolve) => setTimeout(resolve, 900)); // simulate network latency

  return {
    summary: buildMockSummary(mockPreviewRows),
    preview: mockPreviewRows,
    downloadData: mockPreviewRows,
  };

  // ---- REAL IMPLEMENTATION (uncomment when backend is ready) ----
  // const formData = new FormData();
  // formData.append("file", file);
  // formData.append("type", type);
  //
  // const { data } = await apiClient.post<ValidationApiResponse>("/validate", formData, {
  //   headers: { "Content-Type": "multipart/form-data" },
  // });
  //
  // return data;
};

export const queryTypes: QueryType[] = [
  { value: "ep_attendance", label: "EP Attendance Lookup" },
  { value: "wo_active", label: "Active Work Orders" },
  { value: "kpi_failed", label: "Failed KPI Records" },
  { value: "plant_compliance", label: "Plant Compliance Index" },
  { value: "intra_transfers", label: "Intra Transfers (90d)" },
];

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