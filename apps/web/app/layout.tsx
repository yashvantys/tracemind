import React from "react";
import "./globals.css";
export const metadata = {
  title: "TraceMind - AI Incident Debugger",
  description: "AI-powered production debugging with pgvector + RAG",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}