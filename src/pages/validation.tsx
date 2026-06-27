import React, { useMemo, useRef, useState } from "react";
import { Download, UploadCloud, Loader2, CheckCircle2, AlertTriangle, XCircle, Filter } from "lucide-react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { validationRows, type ValidationRow } from "../data/mockData";

type RowStatus = ValidationRow["status"];
type FilterKey = "ALL" | RowStatus;

interface StatusMeta {
  cls: string;
  chip: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const STATUS_META: Record<RowStatus, StatusMeta> = {
  SUCCESS: { cls: "row-success", chip: "bg-emerald-100 text-emerald-800 border-emerald-200", Icon: CheckCircle2 },
  WARNING: { cls: "row-warning", chip: "bg-amber-100 text-amber-800 border-amber-200", Icon: AlertTriangle },
  FAILED: { cls: "row-failed", chip: "bg-rose-100 text-rose-800 border-rose-200", Icon: XCircle },
};

interface SummaryCardProps {
  tone: string;
  label: string;
  value: number;
  testid?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ tone, label, value, testid }) => (
  <div className={`rounded-xl p-5 ${tone}`} data-testid={testid}>
    <div className="k-label-tag text-[11.5px] font-semibold uppercase tracking-wider">{label}</div>
    <div className="k-count mono text-[32px] leading-none font-semibold mt-2">{value}</div>
  </div>
);

const Validation: React.FC = () => {
  const [type, setType] = useState<string>("workorder");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<ValidationRow[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const counts = useMemo(() => {
    const r = rows || [];
    return {
      total: r.length,
      success: r.filter((x) => x.status === "SUCCESS").length,
      warning: r.filter((x) => x.status === "WARNING").length,
      failed: r.filter((x) => x.status === "FAILED").length,
    };
  }, [rows]);

  const submit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!file) {
      toast.error("Please choose a file to validate");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRows(validationRows);
      toast.success(`Validated ${validationRows.length} rows`);
    }, 900);
  };

  const filtered = useMemo<ValidationRow[]>(() => {
    if (!rows) return [];
    if (activeFilter === "ALL") return rows;
    return rows.filter((r) => r.status === activeFilter);
  }, [rows, activeFilter]);

  const overall: RowStatus | null =
    counts.failed > 0 ? "FAILED" : counts.warning > 0 ? "WARNING" : counts.success > 0 ? "SUCCESS" : null;

  const filterChips: Array<{ k: FilterKey; label: string; style: string }> = [
    { k: "ALL", label: "All", style: "border-slate-300 text-slate-700" },
    { k: "SUCCESS", label: "Passed", style: "border-emerald-300 text-emerald-800 bg-emerald-50" },
    { k: "WARNING", label: "Warnings", style: "border-amber-300 text-amber-800 bg-amber-50" },
    { k: "FAILED", label: "Failed", style: "border-rose-300 text-rose-800 bg-rose-50" },
  ];

  return (
    <div className="space-y-6" data-testid="validation-page">
      <div>
        <div className="k-stripe-gradient w-10 mb-3" />
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Validation</h2>
        <p className="text-[13.5px] text-slate-500 mt-1">
          Upload a workforce file to validate against Kronos rules before submission.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="validation-summary">
        <SummaryCard tone="k-summary-success" label="Passed" value={counts.success} testid="count-success" />
        <SummaryCard tone="k-summary-warning" label="Warnings" value={counts.warning} testid="count-warning" />
        <SummaryCard tone="k-summary-danger" label="Failed" value={counts.failed} testid="count-failed" />
      </div>

      <section className="k-card" data-testid="validator-card">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">Validator</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Pick a validation type and upload an Excel or CSV file.</p>
          </div>
          {overall && (
            <Badge
              data-testid="overall-status"
              className={`${STATUS_META[overall].chip} border font-semibold px-3 py-1 text-[11px] tracking-wider uppercase`}
            >
              {React.createElement(STATUS_META[overall].Icon, { className: "w-3 h-3 mr-1.5 inline" })}
              {overall === "SUCCESS" ? "All clear" : overall === "WARNING" ? "Review needed" : "Action required"}
            </Badge>
          )}
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-3 space-y-1.5">
            <Label className="k-label">Validation Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger data-testid="validation-type-select" className="h-10 bg-[#F8FAFC]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workorder">Work Order</SelectItem>
                <SelectItem value="epRenewal">EP Renewal</SelectItem>
                <SelectItem value="tradeSkill">Trade &amp; Skill</SelectItem>
                <SelectItem value="intra">Intra Transfer</SelectItem>
                <SelectItem value="bulkUpload">Bulk Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-7 space-y-1.5">
            <Label className="k-label">File</Label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              data-testid="validation-file-trigger"
              className="w-full flex items-center justify-between gap-3 px-4 h-10 rounded-[10px] border border-dashed border-slate-300 bg-[#F8FAFC] hover:border-[color:var(--teal)] hover:bg-[#F0FDF9] transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <UploadCloud className="w-4 h-4 text-[color:var(--teal)] flex-shrink-0" />
                <span className="text-[13px] text-slate-700 truncate">
                  {file ? file.name : "Choose an .xlsx, .xls or .csv file"}
                </span>
              </div>
              <span className="text-[12px] font-medium text-[color:var(--teal)] flex-shrink-0">Browse</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              data-testid="validation-file-input"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="lg:col-span-2 flex">
            <Button
              data-testid="validation-submit-btn"
              type="submit"
              disabled={loading}
              className="bg-[color:var(--navy)] hover:bg-[color:var(--navy-2)] text-slate-100 h-10 w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Submit
            </Button>
          </div>
        </form>

        {rows && (
          <div className="mt-7" data-testid="validation-results">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div className="flex items-center gap-2 text-[13px]">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500">Filter</span>
                <div className="flex items-center gap-1.5 ml-1" role="group">
                  {filterChips.map((f) => (
                    <button
                      key={f.k}
                      data-testid={`filter-${f.k.toLowerCase()}`}
                      onClick={() => setActiveFilter(f.k)}
                      className={`px-2.5 py-1 rounded-full border text-[11.5px] font-medium transition-all ${
                        activeFilter === f.k
                          ? `${f.style} ring-2 ring-[color:var(--teal)]/30`
                          : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                data-testid="validation-download-btn"
                onClick={() => toast.success("validated_file.xlsx downloaded")}
                variant="outline"
                className="h-9"
              >
                <Download className="w-4 h-4 mr-2" /> Download File
              </Button>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="text-[13px] font-semibold text-slate-900">
                Preview
                <span className="ml-2 text-slate-500 font-normal">{filtered.length} of {rows.length} rows</span>
              </div>
            </div>

            <div className="rounded-[10px] border border-slate-200 overflow-x-auto k-scroll">
              <table className="min-w-full text-[13px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200">
                    {["EP No", "Name", "Plant", "Trade", "Skill", "Status", "Issue"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const meta = STATUS_META[r.status];
                    return (
                      <tr key={r.ep} className={`${meta.cls} hover:bg-slate-50/60 transition-colors`}>
                        <td className="px-3.5 py-2.5 border-b border-slate-100 mono">{r.ep}</td>
                        <td className="px-3.5 py-2.5 border-b border-slate-100">{r.name}</td>
                        <td className="px-3.5 py-2.5 border-b border-slate-100">{r.plant}</td>
                        <td className="px-3.5 py-2.5 border-b border-slate-100">{r.trade}</td>
                        <td className="px-3.5 py-2.5 border-b border-slate-100">{r.skill}</td>
                        <td className="px-3.5 py-2.5 border-b border-slate-100">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${meta.chip}`}>
                            <meta.Icon className="w-3 h-3" />
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-slate-100 text-slate-600">{r.issue}</td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3.5 py-8 text-center text-slate-400">
                        No rows match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Validation;