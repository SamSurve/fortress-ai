import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "FORTRESS AI - Private Organisational AI Assistant",
  description: "Enterprise private AI assistant grounded in verified company documents for Smart India Hackathon 2026",
};

export default function RootLayout({
  children,
}: ReadencodedLayoutProps<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

type ReadencodedLayoutProps<T> = T;
