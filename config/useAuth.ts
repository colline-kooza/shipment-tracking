import { getServerSession, Session } from "next-auth";
import { authOptions } from "./auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  image?: string;
  orgId?: string;
  orgName?: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session: Session | null = await getServerSession(authOptions);
  if (session?.user) {
    const { id, email, role, name, image, orgId, orgName } =
      session.user as AuthUser;
    return { id, email, role, name, image, orgId, orgName };
  }

  return null;
}
