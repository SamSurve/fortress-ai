import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "brand";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "neutral", size = "sm", className }: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    brand: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[11px] font-semibold",
    md: "px-3 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border shadow-subtle transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status.toUpperCase()) {
    case "READY":
    case "ACTIVE":
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>Ready</span>
        </Badge>
      );
    case "PROCESSING":
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
          <span>Processing</span>
        </Badge>
      );
    case "UPLOADING":
      return (
        <Badge variant="info">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse inline-block" />
          <span>Uploading</span>
        </Badge>
      );
    case "FAILED":
    case "DISABLED":
      return (
        <Badge variant="danger">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
          <span>Failed</span>
        </Badge>
      );
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}
