"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Badge } from "@/components/ui/Badge";
import { userApi } from "@/lib/api";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Users,
  Shield,
  KeyRound,
  Check,
  X,
  UserPlus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Search
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Modal / Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("EMPLOYEE");
  const [newCanUpload, setNewCanUpload] = useState(false);
  const [newCanAccessAI, setNewCanAccessAI] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.list();
      setUsers(data);
    } catch (e: any) {
      setErrorBanner(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleUpload = async (user: User) => {
    try {
      setErrorBanner(null);
      const updated = await userApi.updatePermissions(user.id, {
        can_upload: !user.can_upload
      });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      setSuccessBanner(`Upload permissions updated for ${user.name}`);
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (e: any) {
      setErrorBanner(e.message || "Failed to update permissions");
    }
  };

  const handleToggleAI = async (user: User) => {
    try {
      setErrorBanner(null);
      const updated = await userApi.updatePermissions(user.id, {
        can_access_ai: !user.can_access_ai
      });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      setSuccessBanner(`AI access permission updated for ${user.name}`);
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (e: any) {
      setErrorBanner(e.message || "Failed to update permissions");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) return;

    try {
      setErrorBanner(null);
      await userApi.create({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword.trim(),
        role: newRole,
        can_upload: newCanUpload,
        can_access_ai: newCanAccessAI
      });
      setShowAddModal(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setSuccessBanner("New personnel registered successfully.");
      await loadUsers();
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (e: any) {
      setErrorBanner(e.message || "Failed to create user");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F7FB]">
      <Navbar
        title="Users & Permissions"
        subtitle="Control who can access the AI workspace and organisational documents."
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-7">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#D9E1EC] rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] placeholder:text-[#94A3B8] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadUsers}
              className="p-2.5 rounded-xl bg-[#F5F7FB] border border-[#D9E1EC] text-[#64748B] hover:text-[#14213D] transition-colors"
              title="Refresh personnel directory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all active:scale-[0.99]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Personnel</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successBanner && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-semibold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {errorBanner && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Users & Permissions Table */}
        <div className="bg-white border border-[#D9E1EC] rounded-2xl p-6 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#64748B] uppercase text-[10px] font-bold bg-[#F5F7FB] border-y border-[#D9E1EC]">
                <tr>
                  <th className="py-3 px-4 font-extrabold">Name</th>
                  <th className="py-3 px-4 font-extrabold">Email</th>
                  <th className="py-3 px-4 font-extrabold">Role</th>
                  <th className="py-3 px-4 font-extrabold text-center">Can Upload Documents</th>
                  <th className="py-3 px-4 font-extrabold text-center">Can Access AI</th>
                  <th className="py-3 px-4 font-extrabold">Status</th>
                  <th className="py-3 px-4 font-extrabold">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E1EC]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F5F7FB]/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E8F1FF] text-[#2563EB] font-bold flex items-center justify-center border border-blue-200 shrink-0 shadow-subtle">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-bold text-[#14213D] text-xs">{u.name}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-[#64748B] font-medium text-xs">
                      {u.email}
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={u.role === "ADMIN" ? "brand" : "info"}>
                        {u.role === "ADMIN" ? "Administrator" : "Employee"}
                      </Badge>
                    </td>

                    {/* Can Upload Switch Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleUpload(u)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-subtle ${
                          u.role === "ADMIN" || u.can_upload
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {u.role === "ADMIN" || u.can_upload ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Upload ON</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-slate-400" />
                            <span>Upload OFF</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Can Access AI Switch Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleAI(u)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-subtle ${
                          u.can_access_ai
                            ? "bg-[#E8F1FF] text-[#2563EB] border border-blue-200 hover:bg-blue-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {u.can_access_ai ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>AI ON</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-slate-400" />
                            <span>AI OFF</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={u.status === "active" ? "success" : "danger"}>
                        {u.status === "active" ? "Active" : "Disabled"}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 text-[#64748B] font-medium whitespace-nowrap">
                      {formatDate(u.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Personnel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9E1EC] rounded-2xl max-w-md w-full p-7 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#14213D] tracking-tight">Add Personnel</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#64748B] hover:text-[#14213D] p-1.5 rounded-lg hover:bg-[#F5F7FB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Vikram Patel"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="vikram@company.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1">
                    Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB]"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#14213D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanUpload}
                      onChange={(e) => setNewCanUpload(e.target.checked)}
                      className="rounded border-[#D9E1EC] text-[#2563EB] focus:ring-blue-200"
                    />
                    <span>Can Upload PDFs</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[#14213D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanAccessAI}
                      onChange={(e) => setNewCanAccessAI(e.target.checked)}
                      className="rounded border-[#D9E1EC] text-[#2563EB] focus:ring-blue-200"
                    />
                    <span>Can Access AI</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#D9E1EC]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F5F7FB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
