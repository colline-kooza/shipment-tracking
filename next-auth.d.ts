import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

// Define the Role type based on your Prisma schema
interface Role {
  id: string;
  displayName: string;
  roleName: string;
  description: string | null;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole; // Keep for backward compatibility
    firstName: string;
    lastName: string;
    phone: string;
    orgId: string;
    orgName: string | null;
    roles: Role[];
    permissions: string[];
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole; // Keep for backward compatibility
      firstName: string;
      lastName: string;
      phone: string;
      orgId: string;
      orgName: string | null;
      roles: Role[];
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole; // Keep for backward compatibility
    firstName: string;
    lastName: string;
    phone: string;
    orgId: string;
    orgName: string | null;
    roles: Role[];
    permissions: string[];
  }
}
