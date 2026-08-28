"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  LayoutDashboard,
  FileText,
  Users,
  KeyRound,
  History,
  Settings,
  LogOut,
  MessageSquarePlus,
  MessagesSquare,
  FolderLock,
  UserCheck,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mode: "admin" | "employee";
}

export function Sidebar({ mode }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const adminNav = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Documents", href: "/admin/documents", icon: FileText },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Roles & Permissions", href: "/admin/users", icon: KeyRound },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: History },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const employeeNav = [
    { name: "New Chat", href: "/workspace", icon: MessageSquarePlus },
    { name: "Chat History", href: "/workspace", icon: MessagesSquare },
    { name: "Documents", href: "/workspace", icon: FolderLock },
    { name: "Profile", href: "/workspace", icon: UserCheck },
  ];

  const navItems = mode === "admin" ? adminNav : employeeNav;

  return (
    <aside className="w-64 bg-[#0B1730] text-slate-300 flex flex-col h-screen border-r border-[#13254A] select-none shrink-0 z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#13254A] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-lg shadow-blue-900/40 shrink-0 border border-blue-400/30">
          <Shield className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-sm text-white tracking-tight">FORTRESS AI</h1>
            <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {mode === "admin" ? "ADMIN" : "AIRGAP"}
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 font-medium truncate mt-0.5">
            Private Organisational AI Assistant
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {mode === "admin" ? "Administration" : "Workspace Navigation"}
        </div>
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          // Determine active state
          let isActive = false;
          if (mode === "admin") {
            if (item.name === "Roles & Permissions") {
              isActive = pathname === "/admin/users";
            } else {
              isActive = pathname === item.href;
            }
          } else {
            isActive = pathname === item.href && item.name === "New Chat";
          }

          return (
            <Link
              key={idx}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group",
                isActive
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/30 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-[#13254A]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Security Enclave Badge Card */}
      <div className="p-3.5 mx-3 mb-3 rounded-xl bg-[#13254A]/80 border border-slate-700/60 text-xs shadow-subtle">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px] mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Security Protocol Active</span>
        </div>
        <p className="text-[10.5px] text-slate-300 leading-relaxed font-medium">
          Zero-leakage enterprise isolation. Server-side document grounding enabled.
        </p>
      </div>

      {/* User Identity Footer */}
      <div className="p-3.5 border-t border-[#13254A] bg-[#070E1E] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#13254A] flex items-center justify-center font-bold text-xs text-blue-300 border border-slate-700 shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name || "User"}</p>
            <span className="text-[10px] text-slate-300 font-medium truncate block">
              {user?.role === "ADMIN" ? "Administrator" : "Employee"}
            </span>
          </div>
        </div>

        <button
          onClick={() => logout()}
          title="Sign Out"
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
