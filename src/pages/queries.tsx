import React, { useEffect, useMemo, useState } from "react";
import { Play, Code2, Sparkles, Database } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { queryResults, type QueryResult } from "../data/mockData";
// import { getQueryTemplate } from "../lib/getQueryTemplate"; // adjust path to wherever this actually lives

// Shape returned per-item from getQueryTemplate()
interface QueryTemplate {
  key: string;
  label: string;
  sql: string;
  params: string[]; // e.g. ["values"] or ["values", "runDate"]
}



const getQueryTemplate = async (): Promise<QueryTemplate[]> =>{
  // Simulate an API call delay
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Return mock data
  return [
    {
      key: "ep_attendance",
      label: "EP Attendance Lookup",
      sql: "SELECT * FROM VP_WORKMENDETAILS",
      params: ['values'],
    },
    {
      key: "wo_active",
      label: "Active Work Orders",
      sql: "SELECT * FROM CMSWORKORDER",
      params: ['values'],
    },
    {
      key: "intra_transfers",
      label: "Intra Transfers (90d)",
      sql: "SELECT transfer_id, ep_no, from_plant, to_plant, effective_dtn \n FROM hr.intra_transfersnWHERE effective_dt >= CURRENT_DATE - INTERVAL '90' DAYnORDER BY effective_dt DESC;",
      params: ['values','runDate'],
    },
  ];
}


const isRowResult = (row: Array<string | number>): boolean => {
  const last = row[row.length - 1];
  return typeof last === "string" && ["success", "warning", "failed"].includes(last);
};

const statusForRow = (row: Array<string | number>): string => String(row[row.length - 1]);

// Turns a raw param key like "runDate" into a friendly label like "Run Date"
const humanizeParamName = (name: string): string =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

// "runDate" gets a native date picker; everything else (e.g. "values") is plain text
const isDateParam = (paramName: string): boolean => paramName === "runDate";

// YYYY-MM-DD in the user's local time, suitable for an <input type="date" />
const todayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Queries: React.FC = () => {
  const [templates, setTemplates] = useState<QueryTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  const [type, setType] = useState<string>("");
  const [advanced, setAdvanced] = useState<boolean>(false);
  const [sql, setSql] = useState<string>("");
  const [params, setParams] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QueryResult | null>(null);
  const [running, setRunning] = useState<boolean>(false);

  // Fetch templates on mount
  useEffect(() => {
    let cancelled = false;

    const loadTemplates = async (): Promise<void> => {
      setLoadingTemplates(true);
      setTemplatesError(null);
      try {
        const data = await getQueryTemplate();
        if (cancelled) return;

        setTemplates(data);
        if (data.length > 0) {
          setType(data[0].label);
          setSql(data[0].sql);
        }
      } catch (err) {
        if (cancelled) return;
        setTemplatesError("Failed to load query templates.");
        toast.error("Failed to load query templates");
      } finally {
        if (!cancelled) setLoadingTemplates(false);
      }
    };

    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

  // Currently selected template object
  const selectedTemplate = useMemo<QueryTemplate | undefined>(
    () => templates.find((t) => t.key === type),
    [templates, type]
  );

  // Reset params whenever the selected query type changes.
  // If the new template has a runDate param, pre-fill it with today's date.
  useEffect(() => {
    if (!selectedTemplate) return;
    setSql(selectedTemplate.sql);

    const initialParams: Record<string, string> = {};
    selectedTemplate.params.forEach((p) => {
      if (isDateParam(p)) {
        initialParams[p] = todayDateString();
      }
    });
    setParams(initialParams);
  }, [selectedTemplate]);

  const dynamicParams = selectedTemplate?.params ?? [];

  const runQuery = (): void => {
    if (!type) return;

    // Validate every required param is filled before firing the request
    const missing = dynamicParams.filter((paramName) => !params[paramName]?.trim());
    if (missing.length > 0) {
      missing.forEach((paramName) => {
        toast.error(`${humanizeParamName(paramName)} is required`);
      });
      return;
    }

    setRunning(true);
    setTimeout(() => {
      setResult(queryResults[type]);
      setRunning(false);
      toast.success(`Returned ${queryResults[type]?.rows.length ?? 0} rows in 142 ms`);
    }, 650);
  };

  const renderCols = useMemo<string[]>(() => {
    if (!result) return [];
    return result.columns;
  }, [result]);

  return (
    <div className="space-y-6" data-testid="queries-page">
      <div>
        <div className="k-stripe-gradient w-10 mb-3" />
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Execute Database Query</h2>
        <p className="text-[13.5px] text-slate-500 mt-1">
          Run pre-defined system queries or compose your own against the Kronos Database.
        </p>
      </div>

      <section className="k-card space-y-5" data-testid="query-card">
        <div className="flex flex-col gap-4">
          <div className="md:col-span-1 space-y-1.5">
            <Label className="k-label">Query Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger
                data-testid="query-type-select"
                className="h-10 bg-[#F8FAFC]"
                disabled={loadingTemplates || templates.length === 0}
              >
                <SelectValue placeholder={loadingTemplates ? "Loading…" : "Select a query"} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {dynamicParams.map((paramName) => (
            <div key={paramName} className="space-y-1.5">
              <Label className="k-label">{humanizeParamName(paramName)}</Label>
              <Input
                data-testid={`param-${paramName}`}
                type={isDateParam(paramName) ? "date" : "text"}
                placeholder={isDateParam(paramName) ? undefined : humanizeParamName(paramName)}
                className="h-10 bg-[#F8FAFC]"
                value={params[paramName] || ""}
                onChange={(e) => setParams({ ...params, [paramName]: e.target.value })}
              />
            </div>
          ))}
        </div>

        {templatesError && (
          <p className="text-[12.5px] text-red-600" data-testid="templates-error">
            {templatesError}
          </p>
        )}

        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none" data-testid="advanced-toggle">
          <Checkbox
            checked={advanced}
            onCheckedChange={(v) => setAdvanced(!!v)}
            className="data-[state=checked]:bg-[color:var(--teal)] data-[state=checked]:border-[color:var(--teal)]"
          />
          <span className="text-[13.5px] font-medium text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[color:var(--teal)]" /> System Query
          </span>
        </label>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <Code2 className="w-3.5 h-3.5" />
              <span className="mono uppercase tracking-wider">SQL</span>
            </div>
            <Badge variant="outline" className="text-[10.5px] uppercase tracking-wider border-slate-300 text-slate-600">
              {advanced ? "Editable" : "Read-only"}
            </Badge>
          </div>
          <Textarea
            data-testid="sql-editor"
            className="k-sql"
            value={sql}
            readOnly={!advanced}
            onChange={(e) => setSql(e.target.value)}
          />
        </div>

        <Button
          data-testid="run-query-btn"
          onClick={runQuery}
          disabled={running || !type}
          className="bg-[color:var(--navy)] hover:bg-[color:var(--navy-2)] text-slate-100 h-10 px-5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4 mr-2" />
          {running ? "Processing…" : "Run Query"}
        </Button>

        {result && (
          <div className="pt-2" data-testid="query-results">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[color:var(--teal)]" />
                <span className="text-[13.5px] font-semibold text-slate-900">{result.rows.length} rows</span>
                <span className="text-[12px] text-slate-500 mono">· 142 ms</span>
              </div>
            </div>
            <div className="rounded-[10px] border border-slate-200 overflow-x-auto k-scroll">
              <table className="min-w-full text-[13px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200">
                    {renderCols.map((c, i) => {
                      const isStatusCol = i === renderCols.length - 1 && result.rows.length > 0 && isRowResult(result.rows[0]);
                      if (isStatusCol) return null;
                      return (
                        <th
                          key={c}
                          className="text-left px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 whitespace-nowrap"
                        >
                          {c}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, ri) => {
                    const hasStatus = isRowResult(row);
                    const cls = hasStatus ? `row-${statusForRow(row)}` : "";
                    return (
                      <tr key={ri} className={`${cls} hover:bg-slate-50 transition-colors`}>
                        {row.map((cell, ci) => {
                          if (hasStatus && ci === row.length - 1) return null;
                          return (
                            <td key={ci} className="px-3.5 py-2.5 border-b border-slate-100 text-slate-700 whitespace-nowrap">
                              {cell}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Queries;