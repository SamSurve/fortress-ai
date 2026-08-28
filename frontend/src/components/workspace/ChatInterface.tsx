"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { chatApi, docApi } from "@/lib/api";
import { ChatMessage, Document, SourceCitation } from "@/types";
import {
  Send,
  Sparkles,
  FileText,
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink,
  Bot,
  User as UserIcon,
  CheckCircle2,
  HelpCircle,
  FileSearch,
  BookOpen,
  Info,
  ShieldAlert
} from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
  "What was the main issue in P-101 inspection?",
  "Show the maintenance recommendations.",
  "When was the last inspection conducted?",
];

const LOADING_STATUS_TEXTS = [
  "Analysing document...",
  "Searching organisational knowledge...",
  "Generating grounded response...",
];

export function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatusIdx, setLoadingStatusIdx] = useState(0);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load active document and chat history
  useEffect(() => {
    loadActiveDocument();
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Loading text cycler
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStatusIdx((prev) => (prev + 1) % LOADING_STATUS_TEXTS.length);
      }, 1400);
    } else {
      setLoadingStatusIdx(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadActiveDocument = async () => {
    try {
      const res = await docApi.getActive();
      if (res.has_active_document && res.document) {
        setActiveDoc(res.document);
      } else {
        setActiveDoc(null);
      }
    } catch (e) {
      console.error("Error loading active document:", e);
    }
  };

  const loadHistory = async () => {
    try {
      const hist = await chatApi.getHistory();
      setMessages(hist);
    } catch (e) {
      console.error("Error loading history:", e);
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    setErrorMsg(null);
    setInputQuery("");

    // Add user message to conversation stream
    const userMsg: ChatMessage = {
      role: "user",
      content: textToSend.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await chatApi.query(textToSend.trim(), activeDoc?.id);
      
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: res.answer,
        sources: res.sources,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errText = err.message || "Failed to retrieve response from AI engine.";
      setErrorMsg(errText);
      
      const fallbackErrorMsg: ChatMessage = {
        role: "assistant",
        content: `Error: ${errText}`,
        sources: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackErrorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isRefusalMessage = (content: string) => {
    const lower = content.toLowerCase();
    return (
      lower.includes("couldn't find sufficient information") ||
      lower.includes("cannot find sufficient information") ||
      lower.includes("not contained in the provided document") ||
      lower.includes("insufficient information in the provided document")
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#F5F7FB]">
      {/* Knowledge Base Status Bar */}
      <div className="bg-white border-b border-[#D9E1EC] px-7 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-subtle z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#E8F1FF] text-[#2563EB] border border-blue-100 shadow-subtle shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-extrabold text-[#14213D] tracking-tight">Internal AI Workspace</h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Knowledge Base Ready</span>
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
              Responses are strictly grounded in authorized organisation documents.
            </p>
          </div>
        </div>

        {/* Active Document Status Pill */}
        {activeDoc ? (
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#F5F7FB] border border-[#D9E1EC] text-xs shadow-subtle">
            <FileText className="w-4 h-4 text-[#2563EB] shrink-0" />
            <div className="max-w-[280px]">
              <span className="font-bold text-[#14213D] truncate block text-xs">
                {activeDoc.filename}
              </span>
              <span className="text-[10.5px] text-[#64748B] font-medium">
                {activeDoc.page_count} {activeDoc.page_count === 1 ? "page" : "pages"} • Status: Ready
              </span>
            </div>
            <StatusBadge status={activeDoc.status} />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>No document active. Contact administrator to upload a report.</span>
          </div>
        )}
      </div>

      {/* Main Conversation Stream Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        {messages.length === 0 ? (
          /* Initial Empty / Greeting State */
          <div className="max-w-2xl mx-auto my-auto pt-6 text-center space-y-6 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-900/30 border border-blue-400/30">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#14213D] tracking-tight">
                Hello, {user?.name?.split(" ")[0] || "Rahul"}.
              </h2>
              <p className="text-sm font-bold text-[#2563EB] mt-1">
                How can I help you today?
              </p>
              <p className="text-xs text-[#64748B] font-medium mt-1">
                Ask questions about your authorised organisational documents.
              </p>
            </div>

            {/* Active Knowledge Card Preview */}
            {activeDoc && (
              <div className="p-4 rounded-2xl bg-white border border-[#D9E1EC] text-left shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                    <FileSearch className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Active Organisational Knowledge Loaded</span>
                  </div>
                  <Badge variant="success" size="sm">Ready for Q&A</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-[#14213D]">{activeDoc.title || activeDoc.filename}</h4>
                    <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                      Filename: <span className="font-mono text-[#2563EB] font-bold">{activeDoc.filename}</span> • Category: {activeDoc.category}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Question Action Chips */}
            <div className="space-y-2 pt-1 text-left">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] px-1">
                Suggested Industrial Questions
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-white hover:bg-[#E8F1FF] border border-[#D9E1EC] hover:border-blue-300 text-xs text-[#14213D] font-bold transition-all shadow-subtle flex items-center justify-between group active:scale-[0.99]"
                  >
                    <span>&ldquo;{q}&rdquo;</span>
                    <Send className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#2563EB] opacity-60 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Conversation Stream */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const isRefusal = !isUser && isRefusalMessage(msg.content);

              return (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3.5 animate-fadeIn",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-[#0B1730] flex items-center justify-center text-white shrink-0 mt-1 shadow-subtle border border-slate-700">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-2xl rounded-2xl p-5 shadow-card transition-all",
                      isUser
                        ? "bg-[#2563EB] text-white rounded-tr-none font-medium text-xs leading-relaxed"
                        : isRefusal
                        ? "bg-amber-50/70 border border-amber-200 text-[#14213D] rounded-tl-none text-xs leading-relaxed"
                        : "bg-white border border-[#D9E1EC] text-[#14213D] rounded-tl-none text-xs leading-relaxed"
                    )}
                  >
                    {/* Refusal Notice Header */}
                    {isRefusal && (
                      <div className="flex items-center gap-1.5 text-amber-800 font-extrabold text-[11px] mb-2">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Information Not Contained in Document</span>
                      </div>
                    )}

                    {/* Main Content Body */}
                    <div className="whitespace-pre-wrap font-medium">{msg.content}</div>

                    {/* Reliable Sources / Evidence Card (Assistant Only) */}
                    {!isUser && !isRefusal && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-[#D9E1EC] space-y-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                          <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>Sources & Evidence:</span>
                        </div>

                        <div className="space-y-2">
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-xl bg-[#F5F7FB] border border-[#D9E1EC] text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                                  <span className="font-bold text-[#14213D] text-[11px]">{src.document_name}</span>
                                </div>
                                {src.page_number && (
                                  <span className="px-2 py-0.5 rounded-md bg-[#E8F1FF] text-[#2563EB] font-extrabold text-[10.5px] border border-blue-200">
                                    Page {src.page_number}
                                  </span>
                                )}
                              </div>
                              {src.snippet && (
                                <p className="text-[10.5px] text-[#64748B] italic font-medium leading-normal bg-white p-2 rounded-lg border border-[#D9E1EC]/60">
                                  &ldquo;{src.snippet}&rdquo;
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Grounding Disclaimer */}
                        <div className="flex items-center gap-1.5 text-[10.5px] text-[#64748B] italic pt-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>AI-generated response. Verify important information against the cited source.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-[#13254A] text-white flex items-center justify-center shrink-0 mt-1 shadow-subtle border border-slate-700">
                      <UserIcon className="w-4 h-4 text-blue-300" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Elegant AI Processing State */}
            {isLoading && (
              <div className="flex gap-3.5 justify-start animate-fadeIn">
                <div className="w-8 h-8 rounded-xl bg-[#0B1730] flex items-center justify-center text-white shrink-0 mt-1 shadow-subtle">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div className="bg-white border border-[#D9E1EC] rounded-2xl rounded-tl-none p-4 shadow-card flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs font-bold text-[#14213D] animate-pulse">
                    {LOADING_STATUS_TEXTS[loadingStatusIdx]}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Bottom Input Area */}
      <div className="p-4 bg-white border-t border-[#D9E1EC] shadow-elevated shrink-0 z-10">
        <div className="max-w-3xl mx-auto space-y-2">
          {errorMsg && (
            <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-[#F5F7FB] border border-[#D9E1EC] rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-[#2563EB] focus-within:bg-white transition-all shadow-subtle">
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask anything about your organisation's documents..."
              className="flex-1 bg-transparent text-xs text-[#14213D] placeholder:text-[#94A3B8] font-medium focus:outline-none"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isLoading}
              className={cn(
                "p-2 rounded-lg transition-all text-white flex items-center justify-center shadow-subtle active:scale-[0.98]",
                inputQuery.trim() && !isLoading
                  ? "bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md shadow-blue-600/30"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              )}
              title="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10.5px] text-[#64748B] font-medium px-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>FORTRESS AI Private Enclave • Zero External Leakage</span>
            </div>
            <span>Press Enter ↵ to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
