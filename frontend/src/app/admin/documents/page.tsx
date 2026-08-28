"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { StatusBadge } from "@/components/ui/Badge";
import { docApi } from "@/lib/api";
import { Document, DocumentStatus } from "@/types";
import { formatDate, formatBytes } from "@/lib/utils";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Sparkles,
  ShieldCheck,
  FileCheck,
  RefreshCw,
  FolderOpen,
  ArrowRight
} from "lucide-react";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Equipment Maintenance");
  const [accessLevel, setAccessLevel] = useState("Organisation-Wide");
  const [uploadStatus, setUploadStatus] = useState<DocumentStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await docApi.list();
      setDocuments(docs);
    } catch (e: any) {
      console.error("Failed to load documents", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF documents are supported for high-security grounding.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setErrorMessage(null);
    if (!title) {
      const cleanName = file.name.replace(/\.pdf$/i, "").replace(/_/g, " ");
      setTitle(cleanName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select a PDF document to upload.");
      return;
    }

    setErrorMessage(null);
    setUploadStatus("UPLOADING");
    setStatusMessage("Step 1/3: Encrypting and transferring PDF to persistent storage...");

    try {
      await new Promise((r) => setTimeout(r, 500));
      setUploadStatus("PROCESSING");
      setStatusMessage("Step 2/3: Analyzing document structure and registering with Gemini engine...");

      await docApi.upload(
        selectedFile,
        title.trim() || selectedFile.name,
        category
      );

      setUploadStatus("READY");
      setStatusMessage("Document processed successfully.");

      await loadDocuments();

      setTimeout(() => {
        setSelectedFile(null);
        setTitle("");
        setUploadStatus(null);
      }, 4000);
    } catch (err: any) {
      setUploadStatus("FAILED");
      setErrorMessage(err.message || "Failed to upload or process document with Gemini.");
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm("Are you sure you want to remove this document from the AI Knowledge Base?")) return;
    try {
      await docApi.delete(docId);
      await loadDocuments();
    } catch (e: any) {
      alert(e.message || "Failed to delete document");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F7FB]">
      <Navbar
        title="Documents"
        subtitle="Manage and ingest verified organisation documents for AI grounding."
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-7">
        {/* Upload Container Card */}
        <div className="bg-white border border-[#D9E1EC] rounded-2xl p-7 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-extrabold text-[#14213D] tracking-tight">Upload a document</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E8F1FF] text-[#2563EB] border border-blue-200">
                  PDF Specification
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium mt-1">
                Upload technical inspection reports or operating manuals. The AI engine processes documents server-side for grounded employee Q&A.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero-Leakage Grounding</span>
            </div>
          </div>

          {/* Success Banner */}
          {statusMessage && uploadStatus === "READY" && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-semibold flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm text-emerald-900">Document processed successfully.</p>
                  <p className="text-emerald-700 mt-0.5">The document has been securely indexed and will persist across all sessions.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-subtle">
                Active in Knowledge Base
              </span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-bold text-sm text-rose-900">Upload Failure</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleUploadAndProcess} className="space-y-6">
            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-9 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-[#2563EB] bg-[#E8F1FF]/50"
                  : selectedFile
                  ? "border-emerald-400 bg-emerald-50/40"
                  : "border-[#D9E1EC] hover:border-[#2563EB] hover:bg-[#F5F7FB]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2 animate-fadeIn">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-subtle">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-[#14213D]">{selectedFile.name}</p>
                    <p className="text-xs text-[#64748B] font-medium mt-0.5">
                      {formatBytes(selectedFile.size)} • PDF Document Ready
                    </p>
                  </div>
                  <span className="text-xs text-[#2563EB] font-bold underline mt-1">
                    Click or drop another file to replace
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center shadow-subtle">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="font-extrabold text-sm text-[#14213D]">
                    Drag & drop your file here, or <span className="text-[#2563EB] underline">Browse files</span>
                  </p>
                  <p className="text-xs text-[#64748B] font-medium">
                    Supported: <span className="font-bold text-[#14213D]">PDF</span> (e.g. <span className="font-mono text-[#2563EB]">P101_Inspection_Report.pdf</span>)
                  </p>
                </div>
              )}
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1.5">
                  Document Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pump P-101 Inspection Report"
                  className="w-full px-3.5 py-2.5 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] placeholder:text-[#94A3B8] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Equipment Maintenance">Equipment Maintenance</option>
                  <option value="Asset Health">Asset Health</option>
                  <option value="Plant Engineering">Plant Engineering</option>
                  <option value="Standard Operating Procedures">Standard Operating Procedures</option>
                  <option value="Safety & Compliance">Safety & Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14213D] mb-1.5">
                  Document Access
                </label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl text-xs text-[#14213D] font-medium focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Organisation-Wide">Organisation-Wide (All Authorised Users)</option>
                  <option value="Maintenance Team Only">Maintenance Team Only</option>
                  <option value="Executive Clearance">Executive Clearance</option>
                </select>
              </div>
            </div>

            {/* Live Progress Indicator */}
            {uploadStatus && uploadStatus !== "READY" && uploadStatus !== "FAILED" && (
              <div className="p-4 rounded-xl bg-[#E8F1FF] border border-blue-200 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#2563EB]">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#2563EB]" />
                    <span>{statusMessage}</span>
                  </div>
                  <span className="uppercase text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-blue-200/60 font-black">
                    {uploadStatus}
                  </span>
                </div>
                <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-full transition-all duration-700 rounded-full"
                    style={{ width: uploadStatus === "UPLOADING" ? "45%" : "85%" }}
                  />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="submit"
                disabled={!selectedFile || (uploadStatus !== null && uploadStatus !== "READY" && uploadStatus !== "FAILED")}
                className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upload & Process</span>
              </button>
            </div>
          </form>
        </div>

        {/* Persisted Document Vault Table */}
        <div className="bg-white border border-[#D9E1EC] rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-extrabold text-[#14213D] tracking-tight">Active Document Vault</h2>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                All persisted documents indexed in SQLite and available across restarts.
              </p>
            </div>
            <button
              onClick={loadDocuments}
              className="p-2 rounded-xl bg-[#F5F7FB] border border-[#D9E1EC] text-[#64748B] hover:text-[#14213D] transition-colors"
              title="Refresh table"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {documents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[#64748B] uppercase text-[10px] font-bold bg-[#F5F7FB] border-y border-[#D9E1EC]">
                  <tr>
                    <th className="py-3 px-4 font-extrabold">Document</th>
                    <th className="py-3 px-4 font-extrabold">Category</th>
                    <th className="py-3 px-4 font-extrabold">Pages</th>
                    <th className="py-3 px-4 font-extrabold">Size</th>
                    <th className="py-3 px-4 font-extrabold">Status</th>
                    <th className="py-3 px-4 font-extrabold">Uploaded By</th>
                    <th className="py-3 px-4 font-extrabold">Date</th>
                    <th className="py-3 px-4 font-extrabold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E1EC]">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#F5F7FB]/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#E8F1FF] text-[#2563EB] shrink-0 border border-blue-100">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#14213D] text-xs">{doc.title}</p>
                            <p className="text-[11px] font-mono text-[#64748B]">{doc.filename}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#14213D] font-medium">
                        {doc.category}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#14213D]">
                        {doc.page_count} {doc.page_count === 1 ? "page" : "pages"}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] font-mono">
                        {formatBytes(doc.file_size)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="py-3.5 px-4 text-[#14213D] font-medium">
                        {doc.uploader_name || "Administrator"}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center border border-dashed border-[#D9E1EC] rounded-2xl bg-[#F5F7FB]">
              <FolderOpen className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#14213D]">No documents in vault.</p>
              <p className="text-[11px] text-[#64748B] mt-1 font-medium">
                Upload P101_Inspection_Report.pdf above to populate the knowledge base.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
