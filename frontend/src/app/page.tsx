"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Shield } from "lucide-react";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/workspace");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#0B1730] flex flex-col items-center justify-center text-white select-none">
      <div className="flex flex-col items-center gap-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-xl shadow-blue-900/50 border border-blue-400/30">
          <Shield className="w-7 h-7" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black tracking-tight text-white">FORTRESS AI</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Authenticating private enclave...</p>
        </div>
      </div>
    </div>
  );
}
