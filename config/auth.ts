import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/prisma/db";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

// Type for authenticated user with permissions
export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  roles: Role[];
  permissions: string[];
  name?: string | null;
  email?: string | null;
  image?: string | null;
  orgId: string;
  orgName: string | null;
  role: string; // Keep for backward compatibility
}

// Helper function to get user with roles and permissions
async function getUserWithRoles(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: true, // Include roles relation
    },
  });

  if (!user) return null;

  // Get all permissions from user's roles
  const permissions = user.roles.flatMap((role) => role.permissions);
  // Remove duplicates from permissions
  const uniquePermissions = [...new Set(permissions)];

  return {
    ...user,
    permissions: uniquePermissions,
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jb@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw { error: "No Inputs Found", status: 401 };
          }

          const existingUser = await db.user.findUnique({
            where: { email: credentials.email },
            include: {
              roles: true,
            },
          });

          if (!existingUser) {
            console.log("No user found");
            throw { error: "No user found", status: 404 };
          }

          if (!existingUser.isVerfied) {
            console.log("User Not Verified");
            throw { error: "User Not Verified", status: 401 };
          }

          let passwordMatch = false;
          if (existingUser && existingUser.password) {
            passwordMatch = await compare(
              credentials.password,
              existingUser.password
            );
          }

          if (!passwordMatch) {
            throw { error: "Password Incorrect", status: 401 };
          }

          // Get all permissions from user's roles
          const permissions = existingUser.roles.flatMap(
            (role) => role.permissions
          );
          // Remove duplicates from permissions
          const uniquePermissions = [...new Set(permissions)];

          return {
            id: existingUser.id,
            name: existingUser.name,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            phone: existingUser.phone,
            image: existingUser.image,
            email: existingUser.email,
            role: existingUser.role,
            roles: existingUser.roles,
            permissions: uniquePermissions,
            orgId: existingUser.id,
            orgName: null,
          };
        } catch (error) {
          throw { error: "Something went wrong", status: 401 };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // If this is a new sign-in, populate the token with user data
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.orgId = user.orgId;
        token.orgName = user.orgName;
        token.roles = user.roles;
        token.permissions = user.permissions;
      }

      // If the session is being updated, fetch fresh user data
      if (trigger === "update" && token.id) {
        try {
          const userData = await getUserWithRoles(token.id);
          if (userData) {
            token.roles = userData.roles;
            token.permissions = userData.permissions;
          }
        } catch (error) {
          console.error("Error fetching fresh user data:", error);
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.phone = token.phone;
        session.user.orgId = token.orgId;
        session.user.orgName = token.orgName;
        session.user.roles = token.roles;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
};

// Function to check authorization and return NotAuthorized component if needed
export async function checkPermission(requiredPermission: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const userPermissions = session.user.permissions || [];
  if (!userPermissions.includes(requiredPermission)) {
    // Redirect to unauthorized page or return unauthorized component
    redirect("/unauthorized");
  }

  return true;
}

// Function to get authenticated user or redirect
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  return session.user as AuthenticatedUser;
}

// Function to check multiple permissions (any)
export async function checkAnyPermission(permissions: string[]) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const userPermissions = session.user.permissions || [];
  const hasAnyPermission = permissions.some((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasAnyPermission) {
    redirect("/unauthorized");
  }

  return true;
}

// Function to check multiple permissions (all)
export async function checkAllPermissions(permissions: string[]) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const userPermissions = session.user.permissions || [];
  const hasAllPermissions = permissions.every((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasAllPermissions) {
    redirect("/unauthorized");
  }

  return true;
}
