import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const DropdownContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export function DropdownMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the dropdown
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

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block" ref={rootRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild,
}: {
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  asChild?: boolean;
}) {
  const ctx = useContext(DropdownContext)!;

  if (asChild) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        // Preserve any onClick already on the child, then toggle
        children.props.onClick?.(e);
        ctx.setOpen((o) => !o);
      },
    });
  }

  return (
    <button onClick={() => ctx.setOpen((o) => !o)}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const ctx = useContext(DropdownContext)!;

  if (!ctx.open) return null;

  return (
    <div
      className={`absolute right-0 mt-2 min-w-[220px] rounded-md border bg-white shadow-lg z-50 ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-3 py-2 text-sm font-semibold ${className}`}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <hr className="my-1 border-slate-200" />;
}

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DropdownMenuItem({
  children,
  className = "",
  onClick,
  ...props
}: ItemProps) {
  const ctx = useContext(DropdownContext)!;

  return (
    <div
      className={`flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-slate-100 ${className}`}
      onClick={(e) => {
        onClick?.(e);
        ctx.setOpen(false);
      }}
      {...props}
    >
      {children}
    </div>
  );
}