import React from "react";

interface SeparatorProps
  extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  orientation = "horizontal",
  className = "",
  ...props
}: SeparatorProps) {
  return (
    <hr
      className={`border-slate-200 ${
        orientation === "vertical"
          ? "h-full w-px"
          : "w-full border-t"
      } ${className}`}
      {...props}
    />
  );
}