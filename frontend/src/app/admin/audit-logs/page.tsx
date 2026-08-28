"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Badge } from "@/components/ui/Badge";
import { auditApi } from "@/lib/api";
import { AuditLog } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  History,
  ShieldAlert,
  Search,
  RefreshCw,
  FileText,
  UserCheck,
  KeyRound,
  Sparkles,
  Lock,
  Filter
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await auditApi.getLogs(100, 0, selectedAction || undefined);
      setLogs(data);
    } catch (e) {
      console.error("Failed to load audit logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedAction]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.user_email.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      (log.resource && log.resource.toLowerCase().includes(term))
    );
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("FAILED")) return "danger";
    if (action.includes("UPLOAD") || action.includes("PROCESS")) return "brand";
    if (action.includes("QUERY")) return "info";
    if (action.includes("PERMISSION")) return "warning";
    return "success";
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F7FB]">
      <Navbar
        title="Audit Logs"
        subtitle="Compliance tracking and operational security event log."
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-7">
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-[#D9E1EC] rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, action, or target..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] placeholder:text-[#94A3B8] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB]"
              />
            </div>

            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3.5 py-2.5 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB]"
            >
              <option value="">All Security Events</option>
              <option value="LOGIN_SUCCESS">Login Success</option>
              <option value="LOGIN_FAILED">Login Failed</option>
              <option value="LOGOUT">Logout</option>
              <option value="DOCUMENT_UPLOAD">Document Upload</option>
              <option value="DOCUMENT_PROCESS">Document Process</option>
              <option value="AI_QUERY">AI Query</option>
              <option value="PERMISSION_CHANGE">Permission Change</option>
            </select>
          </div>

          <button
            onClick={loadLogs}
            className="p-2.5 rounded-xl bg-[#F5F7FB] border border-[#D9E1EC] text-[#64748B] hover:text-[#14213D] transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white border border-[#D9E1EC] rounded-2xl p-6 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#64748B] uppercase text-[10px] font-bold bg-[#F5F7FB] border-y border-[#D9E1EC]">
                <tr>
                  <th className="py-3 px-4 font-extrabold">Event ID</th>
                  <th className="py-3 px-4 font-extrabold">Action</th>
                  <th className="py-3 px-4 font-extrabold">User Email</th>
                  <th className="py-3 px-4 font-extrabold">Target Resource</th>
                  <th className="py-3 px-4 font-extrabold">Details</th>
                  <th className="py-3 px-4 font-extrabold">IP Address</th>
                  <th className="py-3 px-4 font-extrabold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E1EC]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F5F7FB]/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#64748B]">
                      #{log.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#14213D]">
                      {log.user_email}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#64748B] text-[11px]">
                      {log.resource || "system"}
                    </td>

                    <td className="py-3.5 px-4 text-[#64748B] max-w-xs truncate font-mono text-[11px]">
                      {log.metadata_json || "-"}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#64748B]">
                      {log.ip_address || "127.0.0.1"}
                    </td>

                    <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap font-medium">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
