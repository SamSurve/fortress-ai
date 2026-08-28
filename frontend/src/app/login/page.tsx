"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password.trim());
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1730] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="w-13 h-13 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-900/50 mb-3.5 border border-blue-400/30">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">FORTRESS AI</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Private Organisational AI Assistant</p>
          <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-[#13254A] border border-blue-500/30 text-[11px] font-bold text-blue-400">
            <Sparkles className="w-3 h-3" />
            <span>Smart India Hackathon 2026 Prototype</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#FFFFFF] border border-[#D9E1EC] rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-black text-[#14213D] tracking-tight">Welcome Back</h2>
            <p className="text-xs text-[#64748B] mt-1 font-medium leading-relaxed">
              Sign in to access your organisation&apos;s AI workspace.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] placeholder:text-[#94A3B8] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D]">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("For demo evaluation, please use the provided demo credentials below.");
                  }}
                  className="text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] placeholder:text-[#94A3B8] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#64748B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D9E1EC] text-[#2563EB] focus:ring-blue-200"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Enclave...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-6 pt-5 border-t border-[#D9E1EC]">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] mb-2.5 text-center">
              Evaluator Quick-Fill Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("admin@company.com", "admin123")}
                className="p-2.5 rounded-xl bg-[#F5F7FB] hover:bg-[#E8F1FF] border border-[#D9E1EC] hover:border-blue-300 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#2563EB]">Admin</span>
                  <span className="text-[9px] font-bold text-[#64748B] group-hover:text-[#2563EB]">Fill ↵</span>
                </div>
                <p className="text-[10.5px] text-[#64748B] font-mono truncate mt-0.5">admin@company.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("employee@company.com", "employee123")}
                className="p-2.5 rounded-xl bg-[#F5F7FB] hover:bg-[#E8F1FF] border border-[#D9E1EC] hover:border-blue-300 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-700">Employee</span>
                  <span className="text-[9px] font-bold text-[#64748B] group-hover:text-emerald-700">Fill ↵</span>
                </div>
                <p className="text-[10.5px] text-[#64748B] font-mono truncate mt-0.5">employee@company.com</p>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs font-semibold text-[#64748B]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#2563EB] hover:text-[#1D4ED8] font-bold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
