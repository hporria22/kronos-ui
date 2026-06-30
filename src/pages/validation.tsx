import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Download, UploadCloud, Loader2, CheckCircle2, AlertTriangle, XCircle, Filter, Info } from "lucide-react";
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
import {
  validateFile,
  type ValidationPreviewRow,
  type ValidationStatus,
  type PolicyEntry,
} from "../data/mockData"; // adjust path to wherever apiClient.ts actually lives

type FilterKey = "ALL" | ValidationStatus;

interface StatusMeta {
  cls: string;
  chip: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const STATUS_META: Record<ValidationStatus, StatusMeta> = {
  SUCCESS: { cls: "row-success", chip: "bg-emerald-100 text-emerald-800 border-emerald-200", Icon: CheckCircle2 },
  WARNING: { cls: "row-warning", chip: "bg-amber-100 text-amber-800 border-amber-200", Icon: AlertTriangle },
  FAILED: { cls: "row-failed", chip: "bg-rose-100 text-rose-800 border-rose-200", Icon: XCircle },
};

// Keys we never want rendered as a plain table column — handled specially or omitted
const HIDDEN_KEYS = new Set<string>([
  "wcpolicy",
  "llpolicy",
  "esicpolicy",
  "validationcheck",
  "status", // rendered specially as a status chip column, appended at the end
]);

// Friendly header labels for known keys; anything else falls back to a humanized version of the key
const COLUMN_LABELS: Record<string, string> = {
  EPcode: "EP Code",
  Plantcode: "Plant",
  Deptname: "Department",
  section: "Section",
  Eicnum: "EIC No",
  VenC: "Vendor Code",
  Wonum: "WO No",
  wcnum: "WC No",
  llnum: "LL No",
  Effdate: "Effective Date",
  validitydate: "Validity Date",
};

const humanizeKey = (key: string): string =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

const columnLabel = (key: string): string => COLUMN_LABELS[key] ?? humanizeKey(key);

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

// Generic floating popover that renders into document.body so it's never
// clipped by an ancestor's overflow-x-auto / overflow-hidden (e.g. the table wrapper).
const FloatingPopover: React.FC<{
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  align?: "left" | "right";
  placement?: "top" | "bottom";
  children: React.ReactNode;
}> = ({ anchorRef, open, align = "left", placement = "bottom", children }) => {
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left?: number; right?: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();

    const vertical =
      placement === "top"
        ? { bottom: window.innerHeight - (rect.top + window.scrollY) + 6 }
        : { top: rect.bottom + window.scrollY + 6 };

    const horizontal =
      align === "right"
        ? { right: window.innerWidth - (rect.right + window.scrollX) }
        : { left: rect.left + window.scrollX };

    setPos({ ...vertical, ...horizontal });
  }, [open, anchorRef, align, placement]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: pos.top,
        bottom: pos.bottom,
        left: pos.left,
        right: pos.right,
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

// Click-to-open dropdown for selecting a license/policy number, with keyboard support
const LicenseSelectDropdown: React.FC<{ displayValue: string; policies: PolicyEntry[] }> = ({
  displayValue,
  policies,
}) => {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const licenseNumbers = policies.map((p) => p.LICENSENUMBER).filter(Boolean);

  // Close on outside click
  useLayoutEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || listRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Scroll the highlighted item into view as you arrow through
  useLayoutEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-index="${highlighted}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  if (licenseNumbers.length === 0) {
    return <span className="text-slate-400">{displayValue || "—"}</span>;
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      setHighlighted(0);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, licenseNumbers.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      setSelected(String(licenseNumbers[highlighted]));
      setOpen(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <span className="relative inline-block">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setHighlighted(0);
        }}
        onKeyDown={onKeyDown}
        className="inline-flex items-center gap-1 cursor-pointer border-b border-dotted border-slate-400 text-left"
      >
        {selected ?? displayValue ?? "—"}
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <FloatingPopover anchorRef={anchorRef} open={open} align="left">
        <div
          ref={listRef}
          className="w-56 rounded-lg border border-slate-200 bg-white shadow-lg py-1.5 overflow-hidden"
        >
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 px-3 pt-1 pb-1.5">
            License Number{licenseNumbers.length > 1 ? "s" : ""}
          </div>
          <div className="max-h-36 overflow-y-auto k-scroll">
            {licenseNumbers.map((ln, i) => (
              <div
                key={i}
                data-index={i}
                role="option"
                aria-selected={selected === String(ln)}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => {
                  setSelected(String(ln));
                  setOpen(false);
                  anchorRef.current?.focus();
                }}
                className={`text-[12px] mono px-3 py-1.5 cursor-pointer transition-colors ${
                  i === highlighted ? "bg-emerald-50 text-emerald-800" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {ln}
              </div>
            ))}
          </div>
        </div>
      </FloatingPopover>
    </span>
  );
};

// Plain info icon + popover listing all the validation checks for a row.
// Opens upward so the popover's bottom edge sits right against the icon.
const ValidationChecksButton: React.FC<{ checks: string[] }> = ({ checks }) => {
  const [hovered, setHovered] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);

  if (checks.length === 0) {
    return <span className="text-slate-400 text-[12px]">—</span>;
  }

  return (
    <span
      ref={anchorRef}
      className="relative inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Info
        className="w-4 h-4 text-emerald-600 hover:text-emerald-700 cursor-pointer transition-colors"
        aria-label="View validation checks"
      />
      <FloatingPopover anchorRef={anchorRef} open={hovered} align="right" placement="top">
        <div
          className="w-64 rounded-lg border border-slate-200 bg-white shadow-lg p-3"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Validation Checks
          </div>
          <ul className="max-h-48 overflow-y-auto k-scroll space-y-1.5 pr-1">
            {checks.map((c, i) => (
              <li key={i} className="text-[12.5px] text-slate-700 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{c.replace(/✅/g, "").trim()}</span>
              </li>
            ))}
          </ul>
        </div>
      </FloatingPopover>
    </span>
  );
};

const Validation: React.FC = () => {
  const [type, setType] = useState<string>("workorder");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<ValidationPreviewRow[] | null>(null);
  const [downloadData, setDownloadData] = useState<ValidationPreviewRow[] | null>(null);
  const [summary, setSummary] = useState<{ success: number; warning: number; failed: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Dynamically derive scalar columns from the first preview row's keys,
  // skipping nested arrays/objects which are rendered specially or omitted.
  const dynamicColumns = useMemo<string[]>(() => {
    if (!preview || preview.length === 0) return [];
    return Object.keys(preview[0]).filter((key) => !HIDDEN_KEYS.has(key));
  }, [preview]);

  const submit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!file) {
      toast.error("Please choose a file to validate");
      return;
    }
    setLoading(true);
    try {
      const result = await validateFile(file, type);
      setPreview(result.preview);
      setDownloadData(result.downloadData);
      setSummary(result.summary);
      setActiveFilter("ALL");
      toast.success(`Validated ${result.preview.length} rows`);
    } catch (err) {
      toast.error("Validation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo<ValidationPreviewRow[]>(() => {
    if (!preview) return [];
    if (activeFilter === "ALL") return preview;
    return preview.filter((r) => r.status === activeFilter);
  }, [preview, activeFilter]);

  const overall: ValidationStatus | null = !summary
    ? null
    : summary.failed > 0
    ? "FAILED"
    : summary.warning > 0
    ? "WARNING"
    : summary.success > 0
    ? "SUCCESS"
    : null;

  const filterChips: Array<{ k: FilterKey; label: string; style: string }> = [
    { k: "ALL", label: "All", style: "border-slate-300 text-slate-700" },
    { k: "SUCCESS", label: "Passed", style: "border-emerald-300 text-emerald-800 bg-emerald-50" },
    { k: "WARNING", label: "Warnings", style: "border-amber-300 text-amber-800 bg-amber-50" },
    { k: "FAILED", label: "Failed", style: "border-rose-300 text-rose-800 bg-rose-50" },
  ];

  const handleDownload = (): void => {
    if (!downloadData) return;
    const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "validated_file.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("validated_file.json downloaded");
  };

  // Renders a single cell's content based on which column it is
  const renderCell = (row: ValidationPreviewRow, key: string): React.ReactNode => {
    if (key === "wcnum") {
      return <LicenseSelectDropdown displayValue={row.wcnum} policies={row.wcpolicy} />;
    }
    if (key === "llnum") {
      return <LicenseSelectDropdown displayValue={row.llnum} policies={row.llpolicy} />;
    }
    const value = (row as unknown as Record<string, unknown>)[key];
    if (value === "" || value === null || value === undefined) return <span className="text-slate-400">—</span>;
    return String(value);
  };

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
        <SummaryCard tone="k-summary-success" label="Passed" value={summary?.success ?? 0} testid="count-success" />
        <SummaryCard tone="k-summary-warning" label="Warnings" value={summary?.warning ?? 0} testid="count-warning" />
        <SummaryCard tone="k-summary-danger" label="Failed" value={summary?.failed ?? 0} testid="count-failed" />
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
              {loading ? "Validating…" : "Submit"}
            </Button>
          </div>
        </form>

        {preview && (
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
                onClick={handleDownload}
                variant="outline"
                className="h-9"
              >
                <Download className="w-4 h-4 mr-2" /> Download File
              </Button>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="text-[13px] font-semibold text-slate-900">
                Preview
                <span className="ml-2 text-slate-500 font-normal">{filtered.length} of {preview.length} rows</span>
              </div>
            </div>

            <div className="rounded-[10px] border border-slate-200 overflow-x-auto k-scroll">
              <table className="min-w-full text-[13px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200">
                    {dynamicColumns.map((key) => (
                      <th
                        key={key}
                        className="text-left px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 whitespace-nowrap"
                      >
                        {columnLabel(key)}
                      </th>
                    ))}
                    <th className="text-left px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 whitespace-nowrap">
                      Validation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, ri) => {
                    const meta = STATUS_META[r.status];
                    return (
                      <tr key={`${r.EPcode}-${ri}`} className={`${meta.cls} hover:bg-slate-50/60 transition-colors`}>
                        {dynamicColumns.map((key) => (
                          <td key={key} className="px-3.5 py-2.5 border-b border-slate-100 whitespace-nowrap">
                            {renderCell(r, key)}
                          </td>
                        ))}
                        <td className="px-3.5 py-2.5 border-b border-slate-100">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${meta.chip}`}>
                            <meta.Icon className="w-3 h-3" />
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-slate-100">
                          <ValidationChecksButton checks={r.validationcheck} />
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={dynamicColumns.length + 2} className="px-3.5 py-8 text-center text-slate-400">
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