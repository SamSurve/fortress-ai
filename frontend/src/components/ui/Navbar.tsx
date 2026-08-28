"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, Bell, Lock, LogOut, CheckCircle2 } from "lucide-react";
import { Badge } from "./Badge";

interface NavbarProps {
  title: string;
  subtitle?: string;
  activeDocName?: string;
}

export function Navbar({ title, subtitle, activeDocName }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#D9E1EC] px-7 flex items-center justify-between sticky top-0 z-10 shadow-subtle shrink-0">
      {/* Left: Page Title & Context */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-[#14213D] tracking-tight">{title}</h2>
            {activeDocName && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E8F1FF] text-[#2563EB] border border-blue-200 shadow-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
                <span>Active Knowledge:</span>
                <span className="font-bold underline decoration-blue-300">{activeDocName}</span>
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#64748B] font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Security Tag, Notifications, User Identity & Logout */}
      <div className="flex items-center gap-3.5">
        {/* Encrypted Airgap Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#F5F7FB] text-[#14213D] border border-[#D9E1EC]">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Airgap Enclave Active</span>
        </div>

        {/* Notification Bell */}
        <button
          className="p-2 rounded-xl text-[#64748B] hover:text-[#14213D] hover:bg-[#F5F7FB] border border-transparent hover:border-[#D9E1EC] transition-all relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#2563EB] absolute top-2 right-2 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-[#D9E1EC]" />

        {/* User Identity Pill */}
        {user && (
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-full bg-[#E8F1FF] text-[#2563EB] font-bold text-xs flex items-center justify-center border border-blue-200 shadow-subtle">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-[#14213D] leading-tight">{user.name}</p>
              <Badge variant={user.role === "ADMIN" ? "brand" : "info"} size="sm">
                {user.role === "ADMIN" ? "Administrator" : "Employee"}
              </Badge>
            </div>
          </div>
        )}

        {/* Quick Logout Button */}
        <button
          onClick={() => logout()}
          className="text-xs font-semibold text-[#64748B] hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
          title="Sign out of enclave"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
