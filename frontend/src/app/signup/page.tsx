"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await signup(name.trim(), email.trim(), password.trim());
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1730] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[460px] relative z-10 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-900/50 mb-3.5 border border-blue-400/30">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">FORTRESS AI</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Private Organisational AI Assistant</p>
        </div>

        {/* Signup Card */}
        <div className="bg-[#FFFFFF] border border-[#D9E1EC] rounded-2xl p-8 shadow-2xl">
          <div className="mb-5">
            <h2 className="text-xl font-black text-[#14213D] tracking-tight">Create Your Account</h2>
            <p className="text-xs text-[#64748B] mt-1 font-medium leading-relaxed">
              Register to access your organisation&apos;s private AI workspace.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] placeholder:text-[#94A3B8] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] placeholder:text-[#94A3B8] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] placeholder:text-[#94A3B8] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] placeholder:text-[#94A3B8] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1">
                Requested Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="EMPLOYEE">Employee (Default)</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Registering Personnel...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs font-semibold text-[#64748B]">
              Already have credentials?{" "}
              <Link href="/login" className="text-[#2563EB] hover:text-[#1D4ED8] font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
