"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/ui/Sidebar";
import { ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "ADMIN") {
        router.replace("/workspace");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#0B1730] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#2563EB] flex items-center justify-center animate-spin">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-300 font-bold tracking-tight">Verifying administrator privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F7FB] overflow-hidden">
      <Sidebar mode="admin" />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
