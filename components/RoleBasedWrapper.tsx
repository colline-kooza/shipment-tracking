import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth";

import { redirect } from "next/navigation";
import { ReactNode } from "react";
import NotAuthorized from "./NotAuthorized";
import { UserRole } from "@prisma/client";

// type Role = "USER" | "ADMIN";

interface Props {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export default async function RoleBasedWrapper({
  children,
  allowedRoles,
}: Props) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as UserRole;

  if (!session) {
    redirect("/login");
  }

  if (!allowedRoles.includes(userRole)) {
    return <NotAuthorized />;
  }

  return <>{children}</>;
}
