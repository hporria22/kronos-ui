
import React, { useRef, useState } from "react";
import { Download, Mail, Send, UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

interface MonthOption {
  value: string;
  label: string;
}

const monthOptions: MonthOption[] = (() => {
  const arr: MonthOption[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en", { month: "long", year: "numeric" }),
    });
  }
  return arr;
})();

interface AttendanceState {
  businessType: string;
  plantCodes: string;
  epNumbers: string;
  from: string;
  to: string;
}

interface ReportCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  testid?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, subtitle, children, testid }) => (
  <section className="k-card" data-testid={testid}>
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-[12px] text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

type KpiAction = "download" | "email" | "both";

const Reports: React.FC = () => {
  const [att, setAtt] = useState<AttendanceState>({
    businessType: "",
    plantCodes: "",
    epNumbers: "",
    from: "",
    to: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [kpiType, setKpiType] = useState<string>("Data Quality");
  const [uploading, setUploading] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const submitAttendance = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!att.businessType) {
      toast.error("Business Type is required");
      return;
    }
    toast.success("Attendance report queued for download");
    setTimeout(() => toast.info("attendance_report.xlsx ready"), 900);
  };

  const submitKpi = (action: KpiAction): void => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      if (action === "download") toast.success(`Failed KPI report (${kpiType}) downloaded`);
      if (action === "email") toast.success("Failed KPI emails dispatched to 8 recipients");
      if (action === "both") toast.success("File processed · emails dispatched");
    }, 1100);
  };

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div>
        <div className="k-stripe-gradient w-10 mb-3" />
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Reports</h2>
        <p className="text-[13.5px] text-slate-500 mt-1">
          Generate operational and compliance reports across business units.
        </p>
      </div>

      <ReportCard
        title="Attendance Report"
        subtitle="Monthly attendance roll-up by plant and engagement parties"
        testid="card-attendance"
      >
        <form onSubmit={submitAttendance} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <Label className="k-label">Business Type</Label>
            <Input
              data-testid="att-business-type"
              placeholder="e.g. APL"
              value={att.businessType}
              onChange={(e) => setAtt({ ...att, businessType: e.target.value })}
              className="h-10 bg-[#F8FAFC]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="k-label">Plant Code(s)</Label>
            <Input
              data-testid="att-plant-codes"
              placeholder="P001, P002"
              value={att.plantCodes}
              onChange={(e) => setAtt({ ...att, plantCodes: e.target.value })}
              className="h-10 bg-[#F8FAFC]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="k-label">EP Numbers</Label>
            <Input
              data-testid="att-ep-numbers"
              placeholder="910067289, 910067290"
              value={att.epNumbers}
              onChange={(e) => setAtt({ ...att, epNumbers: e.target.value })}
              className="h-10 bg-[#F8FAFC]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="k-label">Month Range</Label>
            <div className="flex items-center gap-2">
              <Select value={att.from} onValueChange={(v) => setAtt({ ...att, from: v })}>
                <SelectTrigger data-testid="att-from" className="h-10 bg-[#F8FAFC] flex-1">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-slate-400 text-xs">to</span>
              <Select value={att.to} onValueChange={(v) => setAtt({ ...att, to: v })}>
                <SelectTrigger data-testid="att-to" className="h-10 bg-[#F8FAFC] flex-1">
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="lg:col-span-4 flex justify-end">
            <Button
              data-testid="att-download-btn"
              type="submit"
              className="bg-[color:var(--navy)] hover:bg-[color:var(--navy-2)] text-slate-100 h-10 px-5"
            >
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        </form>
      </ReportCard>

      <ReportCard
        title="Failed KPI Report"
        subtitle="Upload a master file, then download a per-plant failure breakdown or email it directly"
        testid="card-kpi"
      >
        {uploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[14px] flex flex-col items-center justify-center gap-3 z-10" data-testid="upload-overlay">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[color:var(--teal)] animate-bounce" style={{ animationDelay: "0s" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-[color:var(--teal)] animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-[color:var(--teal)] animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
            <div className="text-[13px] font-medium text-slate-600">Processing file…</div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="k-label">Upload File</Label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              data-testid="kpi-file-trigger"
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[10px] border border-dashed border-slate-300 bg-[#F8FAFC] hover:border-[color:var(--teal)] hover:bg-[#F0FDF9] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[color:var(--teal)]">
                  <UploadCloud className="w-[18px] h-[18px]" />
                </span>
                <div>
                  <div className="text-[13.5px] font-medium text-slate-900">
                    {file ? file.name : "Choose a file to upload"}
                  </div>
                  <div className="text-[11.5px] text-slate-500 mt-0.5">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : ".xlsx, .xls or .csv up to 20 MB"}
                  </div>
                </div>
              </div>
              <span className="text-[12px] font-medium text-[color:var(--teal)]">Browse</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              data-testid="kpi-file-input"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-1.5 max-w-sm">
            <Label className="k-label">KPI Type</Label>
            <Select value={kpiType} onValueChange={setKpiType}>
              <SelectTrigger data-testid="kpi-type-select" className="h-10 bg-[#F8FAFC]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Data Quality">Data Quality</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Operational">Operational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              data-testid="kpi-download-btn"
              onClick={() => submitKpi("download")}
              disabled={uploading}
              className="bg-[color:var(--navy)] hover:bg-[color:var(--navy-2)] text-slate-100 h-10"
            >
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Download
            </Button>
            <Button
              data-testid="kpi-email-btn"
              onClick={() => submitKpi("email")}
              disabled={uploading}
              variant="outline"
              className="h-10 bg-[#0891B2] hover:bg-[#0E7490] text-white border-[#0891B2] hover:text-white"
            >
              <Mail className="w-4 h-4 mr-2" /> Send Email
            </Button>
            <Button
              data-testid="kpi-process-email-btn"
              onClick={() => submitKpi("both")}
              disabled={uploading}
              className="bg-[color:var(--navy)] hover:bg-[color:var(--navy-2)] text-slate-100 italic h-10"
            >
              <Send className="w-4 h-4 mr-2" /> Process &amp; Email…
            </Button>
          </div>
        </div>
      </ReportCard>
    </div>
  );
};

export default Reports;