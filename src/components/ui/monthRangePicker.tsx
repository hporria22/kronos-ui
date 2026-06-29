import React, { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

export interface MonthRangeValue {
  from: string; // "YYYY-MM"
  to: string; // "YYYY-MM"
}

interface MonthRangePickerProps {
  value: MonthRangeValue;
  onChange: (value: MonthRangeValue) => void;
  testid?: string;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const toKey = (year: number, monthIndex: number): string =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

const parseKey = (key: string): { year: number; monthIndex: number } | null => {
  const match = /^(\d{4})-(\d{2})$/.exec(key);
  if (!match) return null;
  return { year: Number(match[1]), monthIndex: Number(match[2]) - 1 };
};

const formatRangeLabel = (value: MonthRangeValue): string => {
  const fromParsed = value.from ? parseKey(value.from) : null;
  const toParsed = value.to ? parseKey(value.to) : null;

  const fmt = (p: { year: number; monthIndex: number }) =>
    `${MONTH_LABELS[p.monthIndex]} ${p.year}`;

  if (fromParsed && toParsed) return `${fmt(fromParsed)} – ${fmt(toParsed)}`;
  if (fromParsed) return fmt(fromParsed);
  return "Select month range";
};

// Compares two "YYYY-MM" keys chronologically
const compareKeys = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

export const MonthRangePicker: React.FC<MonthRangePickerProps> = ({ value, onChange, testid }) => {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(() => {
    const parsed = value.from ? parseKey(value.from) : null;
    return parsed?.year ?? new Date().getFullYear();
  });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleMonthClick = (monthIndex: number): void => {
    const key = toKey(viewYear, monthIndex);

    // No range yet, or both ends already set -> start a fresh selection
    if (!value.from || (value.from && value.to)) {
      onChange({ from: key, to: "" });
      return;
    }

    // One end already chosen -> this click sets the other end.
    // Always normalize so `from` is the earlier month.
    if (compareKeys(key, value.from) < 0) {
      onChange({ from: key, to: value.from });
    } else {
      onChange({ from: value.from, to: key });
    }
    setOpen(false);
  };

  const isInRange = (monthIndex: number): boolean => {
    if (!value.from || !value.to) return false;
    const key = toKey(viewYear, monthIndex);
    return compareKeys(key, value.from) >= 0 && compareKeys(key, value.to) <= 0;
  };

  const isEndpoint = (monthIndex: number): boolean => {
    const key = toKey(viewYear, monthIndex);
    return key === value.from || key === value.to;
  };

  return (
    <div className="relative" ref={rootRef} data-testid={testid}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        data-testid={testid ? `${testid}-trigger` : undefined}
        className="w-full flex items-center justify-between gap-2 rounded-md border border-slate-300 bg-[#F8FAFC] px-3 h-10 text-sm text-left hover:border-[color:var(--teal)] transition-colors"
      >
        <span className={`truncate ${value.from ? "text-slate-900" : "text-slate-400"}`}>
          {formatRangeLabel(value)}
        </span>
        <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div
          className="absolute left-0 z-50 mt-1 w-72 rounded-[10px] border border-slate-200 bg-white shadow-lg p-3"
          data-testid={testid ? `${testid}-panel` : undefined}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-500"
              aria-label="Previous year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[13.5px] font-semibold text-slate-900">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-500"
              aria-label="Next year"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {MONTH_LABELS.map((label, i) => {
              const endpoint = isEndpoint(i);
              const inRange = isInRange(i);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleMonthClick(i)}
                  className={`px-2 py-2 rounded-md text-[12.5px] font-medium transition-colors ${
                    endpoint
                      ? "bg-[color:var(--teal)] text-white"
                      : inRange
                      ? "bg-[#F0FDF9] text-[color:var(--teal)]"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11.5px] text-slate-500">
              {!value.from ? "Click a month to start" : !value.to ? "Click another month to finish" : "Range selected"}
            </span>
            {(value.from || value.to) && (
              <button
                type="button"
                onClick={() => onChange({ from: "", to: "" })}
                className="text-[11.5px] font-medium text-slate-500 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthRangePicker;