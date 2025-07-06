"use server";

import { db } from "@/prisma/db";
import {
  CreateUserData,
  RoleOption,
  UpdateUserData,
  UserWithRoles,
} from "@/types/user";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// Get all active roles for role selection
export async function getActiveRoles(): Promise<RoleOption[]> {
  try {
    const roles = await db.role.findMany({
      where: { isActive: true },
      orderBy: { displayName: "asc" },
    });

    return roles.map((role) => ({
      id: role.id,
      displayName: role.displayName,
      roleName: role.roleName,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
    }));
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw new Error("Failed to fetch roles");
  }
}

// Get all users with their assigned roles and permissions
export async function getUsersWithRoles(): Promise<UserWithRoles[]> {
  try {
    const users = await db.user.findMany({
      include: {
        roles: {
          where: { isActive: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users.map((user) => {
      // Get all permissions from user's roles
      const permissions = user.roles.flatMap((role) => role.permissions);
      // Remove duplicates
      const uniquePermissions = [...new Set(permissions)];

      return {
        ...user,
        permissions: uniquePermissions,
      };
    });
  } catch (error) {
    console.error("Error fetching users with roles:", error);
    throw new Error("Failed to fetch users");
  }
}

// Create a new user with role assignments
export async function createUserWithRoles(userData: CreateUserData) {
  try {
    // Check if user with email already exists
    const existingUser = await db.user.findUnique({
      where: { email: userData.email },
    });
    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Check if user with phone already exists
    const existingPhone = await db.user.findUnique({
      where: { phone: userData.phone },
    });
    if (existingPhone) {
      return {
        success: false,
        error: "User with this phone number already exists",
      };
    }

    // Validate that all role IDs exist and are active
    const validRoles = await db.role.findMany({
      where: {
        id: { in: userData.roleIds },
        isActive: true,
      },
    });

    if (validRoles.length !== userData.roleIds.length) {
      return {
        success: false,
        error: "One or more selected roles are invalid or inactive",
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create the user with role assignments
    const user = await db.user.create({
      data: {
        name:
          userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        location: userData.location || null,
        isVerfied: true,
        // Connect the roles
        roles: {
          connect: userData.roleIds.map((roleId) => ({ id: roleId })),
        },
      },
      include: {
        roles: true,
      },
    });

    revalidatePath("/dashboard/users");

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        location: user.location,
      },
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: "Failed to create user. Please try again.",
    };
  }
}

// Update an existing user with role assignments
export async function updateUserWithRoles(userData: UpdateUserData) {
  try {
    // Check email uniqueness
    const existingUserEmail = await db.user.findFirst({
      where: {
        email: userData.email,
        NOT: { id: userData.id },
      },
    });
    if (existingUserEmail) {
      return {
        success: false,
        error: "Another user with this email already exists",
      };
    }

    // Check phone uniqueness
    const existingUserPhone = await db.user.findFirst({
      where: {
        phone: userData.phone,
        NOT: { id: userData.id },
      },
    });
    if (existingUserPhone) {
      return {
        success: false,
        error: "Another user with this phone number already exists",
      };
    }

    // Validate that all role IDs exist and are active
    const validRoles = await db.role.findMany({
      where: {
        id: { in: userData.roleIds },
        isActive: true,
      },
    });

    if (validRoles.length !== userData.roleIds.length) {
      return {
        success: false,
        error: "One or more selected roles are invalid or inactive",
      };
    }

    // Update the user and replace role assignments
    const user = await db.user.update({
      where: { id: userData.id },
      data: {
        name:
          userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        location: userData.location || null,
        updatedAt: new Date(),
        // Replace all role assignments
        roles: {
          set: [], // First disconnect all roles
          connect: userData.roleIds.map((roleId) => ({ id: roleId })), // Then connect new ones
        },
      },
      include: {
        roles: true,
      },
    });

    revalidatePath("/dashboard/users");

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        location: user.location,
      },
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: "Failed to update user. Please try again.",
    };
  }
}

// Delete a user
export async function deleteUser(userId: string) {
  try {
    await db.user.delete({
      where: { id: userId },
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Failed to delete user. Please try again.",
    };
  }
}
