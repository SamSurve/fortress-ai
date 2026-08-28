import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[#D9E1EC] rounded-xl p-5 shadow-card hover:shadow-elevated transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            {title}
          </p>
          <p className="text-2xl font-black text-[#14213D] mt-2 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[#64748B] mt-1 font-medium">
              {subtitle}
            </p>
          )}
          {trend && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {trend}
            </span>
          )}
        </div>
        <div className="p-3 bg-[#E8F1FF] text-[#2563EB] rounded-xl border border-blue-100/80 shadow-subtle shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}
