"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/ui/Sidebar";
import { ShieldCheck } from "lucide-react";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0B1730] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#2563EB] flex items-center justify-center animate-spin">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-300 font-bold tracking-tight">Opening secure private workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F7FB] overflow-hidden">
      <Sidebar mode="employee" />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
