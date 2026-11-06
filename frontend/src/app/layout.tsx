import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export const metadata: Metadata = {
  title: "NEXUS INTELLIGENCE | AI-Powered Supply Chain Risk Platform",
  description:
    "From fragmented supply chain data to predictive business decisions. Enterprise supply chain risk intelligence, network telemetry, and ML delay forecasting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen flex antialiased">
        {/* Persistent Enterprise Sidebar */}
        <Sidebar />

        {/* Main Content Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Topbar />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
