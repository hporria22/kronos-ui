import React from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Avatar({
  className = "",
  children,
  ...props
}: AvatarProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface AvatarFallbackProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function AvatarFallback({
  className = "",
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-slate-200 font-semibold ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}