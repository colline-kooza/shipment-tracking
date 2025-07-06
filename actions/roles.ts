"use server";

import { getAuthenticatedUser } from "@/config/auth";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type CreateRoleData = {
  displayName: string;
  roleName: string;
  description?: string;
  permissions: string[];
};

export type UpdateRoleData = {
  id: string;
  displayName: string;
  roleName: string;
  description?: string;
  permissions: string[];
};

/**
 * Create a new role
 */
export async function createRole(
  data: CreateRoleData
): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthenticatedUser();

    // Check if role name already exists in the organization
    const existingRole = await db.role.findFirst({
      where: {
        roleName: data.roleName,
      },
    });

    if (existingRole) {
      return {
        success: false,
        error: "Role name already exists",
      };
    }

    const role = await db.role.create({
      data: {
        displayName: data.displayName,
        roleName: data.roleName,
        description: data.description,
        permissions: data.permissions,
      },
    });

    revalidatePath("/dashboard/roles");

    return {
      success: true,
      data: role,
    };
  } catch (error) {
    console.error("Failed to create role:", error);
    return {
      success: false,
      error: "Failed to create role: " + (error as Error).message,
    };
  }
}

/**
 * Update an existing role
 */
export async function updateRole(
  data: UpdateRoleData
): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthenticatedUser();

    // Check if role exists and belongs to user's organization
    const existingRole = await db.role.findFirst({
      where: {
        id: data.id,
      },
    });

    if (!existingRole) {
      return {
        success: false,
        error: "Role not found",
      };
    }

    // Check if new role name conflicts with existing roles (excluding current role)
    if (data.roleName !== existingRole.roleName) {
      const conflictingRole = await db.role.findFirst({
        where: {
          roleName: data.roleName,

          NOT: {
            id: data.id,
          },
        },
      });

      if (conflictingRole) {
        return {
          success: false,
          error: "Role name already exists",
        };
      }
    }

    const role = await db.role.update({
      where: { id: data.id },
      data: {
        displayName: data.displayName,
        roleName: data.roleName,
        description: data.description,
        permissions: data.permissions,
      },
    });

    revalidatePath("/dashboard/roles");

    return {
      success: true,
      data: role,
    };
  } catch (error) {
    console.error("Failed to update role:", error);
    return {
      success: false,
      error: "Failed to update role: " + (error as Error).message,
    };
  }
}

/**
 * Delete a role
 */
export async function deleteRole(roleId: string): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthenticatedUser();

    // Check if role exists and belongs to user's organization
    const existingRole = await db.role.findFirst({
      where: {
        id: roleId,
      },
      include: {
        users: true,
      },
    });

    if (!existingRole) {
      return {
        success: false,
        error: "Role not found",
      };
    }

    // Check if role is assigned to any users
    if (existingRole.users.length > 0) {
      return {
        success: false,
        error: "Cannot delete role that is assigned to users",
      };
    }

    await db.role.delete({
      where: { id: roleId },
    });

    revalidatePath("/dashboard/roles");

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Failed to delete role:", error);
    return {
      success: false,
      error: "Failed to delete role: " + (error as Error).message,
    };
  }
}

/**
 * Get all roles for the user's organization
 */
export async function getRoles(): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthenticatedUser();

    const roles = await db.role.findMany({
      where: {
        isActive: true,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: roles,
    };
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    return {
      success: false,
      error: "Failed to fetch roles: " + (error as Error).message,
    };
  }
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(
  userId: string,
  roleId: string
): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthenticatedUser();

    // Verify role belongs to user's organization
    const role = await db.role.findFirst({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      return {
        success: false,
        error: "Role not found",
      };
    }

    // Verify target user belongs to same organization
    const targetUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Add role to user
    await db.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: roleId },
        },
      },
    });

    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard/roles");

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Failed to assign role:", error);
    return {
      success: false,
      error: "Failed to assign role: " + (error as Error).message,
    };
  }
}

/**
 * Remove role from user
 */
export async function removeRoleFromUser(
  userId: string,
  roleId: string
): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthenticatedUser();

    // Remove role from user
    await db.user.update({
      where: { id: userId },
      data: {
        roles: {
          disconnect: { id: roleId },
        },
      },
    });

    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard/roles");

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Failed to remove role:", error);
    return {
      success: false,
      error: "Failed to remove role: " + (error as Error).message,
    };
  }
}
