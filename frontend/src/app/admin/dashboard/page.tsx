"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { auditApi } from "@/lib/api";
import { DashboardStats } from "@/types";
import { formatDate, formatBytes } from "@/lib/utils";
import {
  FileText,
  Users,
  MessageSquare,
  HardDrive,
  Upload,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles,
  Activity,
  Layers
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await auditApi.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error("Failed to load dashboard stats", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F7FB]">
      <Navbar
        title="Dashboard"
        subtitle="Organisation overview and knowledge system status."
        activeDocName={stats?.active_document?.filename}
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-7">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1730] text-white rounded-2xl p-7 border border-[#13254A] shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-full bg-blue-600/10 blur-[90px] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#13254A] text-blue-400 text-xs font-bold mb-3 border border-blue-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Airgap Enclave Active</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Organisation Overview</h1>
            <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed font-medium">
              Private AI assistant active with server-side document grounding and strict role-based access control.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <button
              onClick={loadStats}
              className="p-2.5 rounded-xl bg-[#13254A] border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-subtle"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/admin/documents"
              className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all active:scale-[0.99]"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </Link>
          </div>
        </div>

        {/* 4 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Documents"
            value={stats?.total_documents ?? 0}
            subtitle="Indexed organisation PDFs"
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            title="Total Users"
            value={stats?.total_users ?? 0}
            subtitle="Authorised personnel"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="AI Queries Today"
            value={stats?.ai_queries_today ?? 0}
            subtitle="Grounded Q&A operations"
            icon={<MessageSquare className="w-5 h-5" />}
            trend="100% Grounded"
          />
          <StatCard
            title="Storage Used"
            value={stats?.storage_used_formatted || "0 B"}
            subtitle="Persistent local vault"
            icon={<HardDrive className="w-5 h-5" />}
          />
        </div>

        {/* Two-Column Grid: Recent Documents Table & Security Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Recent Documents Table (2 columns) */}
          <div className="lg:col-span-2 bg-white border border-[#D9E1EC] rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-extrabold text-[#14213D] tracking-tight">Recent Documents</h2>
                <p className="text-xs text-[#64748B] font-medium mt-0.5">
                  Organisational knowledge documents available for AI grounding
                </p>
              </div>
              <Link
                href="/admin/documents"
                className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 group"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {stats?.recent_documents && stats.recent_documents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[#64748B] uppercase text-[10px] font-bold bg-[#F5F7FB] border-y border-[#D9E1EC]">
                    <tr>
                      <th className="py-3 px-4 font-extrabold">Document Name</th>
                      <th className="py-3 px-4 font-extrabold">Uploaded By</th>
                      <th className="py-3 px-4 font-extrabold">Upload Date</th>
                      <th className="py-3 px-4 font-extrabold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E1EC]">
                    {stats.recent_documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#F5F7FB]/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-[#E8F1FF] text-[#2563EB] shrink-0 border border-blue-100">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-[#14213D] text-xs truncate">{doc.title}</p>
                              <p className="text-[11px] font-mono text-[#64748B] truncate mt-0.5">
                                {doc.filename} • {doc.page_count} {doc.page_count === 1 ? "page" : "pages"} ({formatBytes(doc.file_size)})
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#14213D] font-medium">
                          {doc.uploader_name || "Administrator"}
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B] font-medium whitespace-nowrap">
                          {formatDate(doc.created_at)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={doc.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center border border-dashed border-[#D9E1EC] rounded-2xl bg-[#F5F7FB]">
                <FileText className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#14213D]">No documents indexed yet.</p>
                <p className="text-[11px] text-[#64748B] mt-1 font-medium">
                  Upload P101_Inspection_Report.pdf to activate AI grounding.
                </p>
                <Link
                  href="/admin/documents"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold mt-4 shadow-sm hover:bg-[#1D4ED8] transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                </Link>
              </div>
            )}
          </div>

          {/* Security Audit Activity Feed (1 column) */}
          <div className="bg-white border border-[#D9E1EC] rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-extrabold text-[#14213D] tracking-tight">Security Audit Log</h2>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">Live operational events</p>
                </div>
                <Link
                  href="/admin/audit-logs"
                  className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  Full Trail
                </Link>
              </div>

              <div className="space-y-3.5">
                {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                  stats.recent_activity.slice(0, 6).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 text-xs pb-3 border-b border-[#D9E1EC] last:border-0 last:pb-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#14213D] font-mono text-[11px]">{log.action}</span>
                          <span className="text-[10px] text-[#64748B]">{formatDate(log.created_at)}</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] truncate mt-0.5 font-medium">
                          {log.user_email}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#64748B] text-center py-8 font-medium">
                    No activity recorded yet.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#D9E1EC]">
              <div className="flex items-center justify-between text-[11px] text-[#64748B] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Telemetry Live</span>
                </span>
                <span className="font-mono text-[10px]">ISO 27001 Logged</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
