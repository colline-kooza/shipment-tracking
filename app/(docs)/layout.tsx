import SiteHeader from "@/components/frontend/site-header";
import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth";
import React, { ReactNode } from "react";

export default async function DocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <div className="">
      <SiteHeader session={session} />
      <div className="sm:container mx-auto w-[90vw] h-auto">{children}</div>
    </div>
  );
}
