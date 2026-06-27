export interface Toast {
  id: number;
  title?: string;
  message?: string;
  duration?: number;
  type: "success" | "error" | "info" | "warning";
}