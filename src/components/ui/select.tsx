import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface SelectContextType {
  value?: string;
  onChange?: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  labelMap: Record<string, React.ReactNode>;
  registerLabel: (value: string, label: React.ReactNode) => void;
  disabled?: boolean;
}

const SelectContext = createContext<SelectContextType | null>(null);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, disabled, children }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [labelMap, setLabelMap] = useState<Record<string, React.ReactNode>>({});
  const rootRef = useRef<HTMLDivElement>(null);

  const registerLabel = (val: string, label: React.ReactNode) => {
    setLabelMap((prev) => (prev[val] === label ? prev : { ...prev, [val]: label }));
  };

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

  // If disabled flips to true while the dropdown is open, force it closed
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <SelectContext.Provider
      value={{ value, onChange: onValueChange, open, setOpen, labelMap, registerLabel, disabled }}
    >
      <div className="relative" ref={rootRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className = "",
  children,
  disabled,
}: {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}) {
  const ctx = useContext(SelectContext)!;
  const isDisabled = disabled ?? ctx.disabled ?? false;

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      onClick={() => {
        if (isDisabled) return;
        ctx.setOpen((o) => !o);
      }}
      className={`flex items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-left disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 ${className}`}
    >
      {children}
      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${ctx.open ? "rotate-180" : ""}`} />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = useContext(SelectContext)!;
  const label = ctx.value ? ctx.labelMap[ctx.value] : undefined;

  return (
    <span className="text-sm truncate">
      {label ?? ctx.value ?? placeholder ?? "Select..."}
    </span>
  );
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const ctx = useContext(SelectContext)!;

  if (!ctx.open) return null;

  return (
    <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg py-1">
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(SelectContext)!;

  // Register the human-readable label so SelectValue can show it instead of the raw value
  useEffect(() => {
    ctx.registerLabel(value, children);
  }, [value, children]);

  const selected = ctx.value === value;

  return (
    <div
      role="option"
      aria-selected={selected}
      onClick={() => {
        ctx.onChange?.(value);
        ctx.setOpen(false);
      }}
      className={`cursor-pointer px-3 py-2 text-sm hover:bg-slate-100 ${
        selected ? "bg-[#F0FDF9] text-[color:var(--teal)] font-medium" : "text-slate-700"
      }`}
    >
      {children}
    </div>
  );
}