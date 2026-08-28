"use client";

import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Badge } from "@/components/ui/Badge";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Cpu,
  Database,
  Lock,
  Sparkles,
  Server,
  FileCheck2,
  HardDrive
} from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F7FB]">
      <Navbar
        title="Settings"
        subtitle="Global security configuration and AI engine parameters."
      />

      <div className="p-8 max-w-5xl mx-auto w-full space-y-7">
        {/* Security Overview Card */}
        <div className="bg-white border border-[#D9E1EC] rounded-2xl p-7 shadow-card space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-[#E8F1FF] text-[#2563EB] border border-blue-100 shadow-subtle">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#14213D] tracking-tight">Security & Grounding Enclave</h2>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">FORTRESS AI Private Airgap Architecture</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#D9E1EC]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-[#14213D]">AI Grounding Model</span>
                <Badge variant="brand">Google Gemini API</Badge>
              </div>
              <p className="text-[#64748B] font-medium leading-relaxed">
                Server-side multimodal document reasoning with strict refusal on facts outside active documents.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#D9E1EC]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-[#14213D]">Database Engine</span>
                <Badge variant="success">SQLite Embedded</Badge>
              </div>
              <p className="text-[#64748B] font-medium leading-relaxed">
                Persistent local storage for user credentials, document metadata, and compliance audit events.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#D9E1EC]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-[#14213D]">API Key Protection</span>
                <Badge variant="success">Server-Side Only</Badge>
              </div>
              <p className="text-[#64748B] font-medium leading-relaxed">
                <code className="text-[#2563EB] font-mono">GEMINI_API_KEY</code> is encapsulated on the backend and never exposed to the frontend.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#D9E1EC]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-[#14213D]">Authentication</span>
                <Badge variant="brand">JWT + Salted PBKDF2</Badge>
              </div>
              <p className="text-[#64748B] font-medium leading-relaxed">
                HS256 signed Bearer tokens with server-side role enforcement and constant-time password verification.
              </p>
            </div>
          </div>
        </div>

        {/* SIH Hackathon Demo Info Card */}
        <div className="bg-[#0B1730] text-white border border-[#13254A] rounded-2xl p-7 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Smart India Hackathon 2026 Prototype</span>
          </div>
          <h3 className="text-lg font-black tracking-tight">Standard Demo Workflow Verification</h3>
          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed font-medium">
            <li>Admin logs in with <code className="text-blue-400 font-mono">admin@company.com</code> / <code className="text-blue-400 font-mono">admin123</code>.</li>
            <li>Admin uploads <code className="text-blue-400 font-mono">P101_Inspection_Report.pdf</code> in Documents view.</li>
            <li>Admin logs out. Document persists across sessions in local SQLite database and vault.</li>
            <li>Employee logs in with <code className="text-blue-400 font-mono">employee@company.com</code> / <code className="text-blue-400 font-mono">employee123</code>.</li>
            <li>Employee asks industrial questions in Internal AI Workspace.</li>
            <li>AI answers strictly using the uploaded PDF, citing verified sources and page numbers.</li>
            <li>Out-of-scope questions are strictly rejected without hallucinations.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
