import type { Role, User as PrismaUser } from "@prisma/client";

// Enhanced type definitions for the user management system
export interface UserWithRoles extends Omit<PrismaUser, "password"> {
  roles: Role[];
  permissions: string[];
}

export interface CreateUserData {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  roleIds: string[]; // Array of role IDs to assign
  location?: string;
}

export interface UpdateUserData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleIds: string[]; // Array of role IDs to assign
  location?: string;
}

export interface RoleOption {
  id: string;
  displayName: string;
  roleName: string;
  description?: string | null;
  permissions: string[];
  isActive: boolean;
}
