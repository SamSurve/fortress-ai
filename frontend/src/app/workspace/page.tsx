"use client";

import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { ChatInterface } from "@/components/workspace/ChatInterface";

export default function WorkspacePage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Navbar
        title="FORTRESS AI Workspace"
        subtitle="Private Organisational AI Assistant"
      />
      <ChatInterface />
    </div>
  );
}
