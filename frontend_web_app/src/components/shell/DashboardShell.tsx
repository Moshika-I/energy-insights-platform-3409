import React from "react";
import { SidebarNav } from "@/components/shell/Nav";
import Topbar from "@/components/shell/Topbar";

// PUBLIC_INTERFACE
export default function DashboardShell({
  title,
  subtitle,
  children,
}: {
  /** Page title shown in the topbar. */
  title: string;
  /** Optional subtitle shown in the topbar. */
  subtitle?: string;
  /** Page content. */
  children: React.ReactNode;
}) {
  /** Standard app shell: sidebar + topbar + content area. */
  return (
    <div className="eip-shell">
      <SidebarNav />
      <div className="eip-main">
        <Topbar title={title} subtitle={subtitle} />
        <main className="eip-content">{children}</main>
      </div>
    </div>
  );
}
