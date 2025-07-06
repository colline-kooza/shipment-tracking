import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import { GridBackground } from "@/components/reusable-ui/grid-background";
import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user.role;
  if (!session) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen flex">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen hidden md:block">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-[220px] lg:ml-[280px]">
        <Navbar session={session} />
        <div className="bg-gray-50">{children}</div>
      </main>
    </div>
  );
}
