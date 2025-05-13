import React from "react";
import { RecentProjectsProvider } from "@/app/context/recent-projects-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import SideBar from "@/components/sidebar";
import NavBar from "@/components/navbar";
import { cookies } from "next/headers";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <>
      <RecentProjectsProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SideBar />
          <main className="w-full">
            <NavBar />
            <div className="px-8">{children}</div>
          </main>
        </SidebarProvider>
      </RecentProjectsProvider>
    </>
  );
}
