"use server";

import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getRolePermissions } from "@/utils/permissions";

const prisma = new PrismaClient();

// Get all users with their permissions
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map the database users to the format needed by the frontend
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      // Map permissions based on role
      permissions: getRolePermissions(user.role.toLowerCase()),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

// Create a new user
export async function createUser(userData: {
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  location?: string;
}) {
  try {
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Check if user with phone already exists
    const existingPhone = await prisma.user.findUnique({
      where: { phone: userData.phone },
    });

    if (existingPhone) {
      return {
        success: false,
        error: "User with this phone number already exists",
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create the new user
    const user = await prisma.user.create({
      data: {
        name: userData.name || `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        role: userData.role,
        location: userData.location || null,
        isVerfied: true,
      },
    });

    // Revalidate the users page to reflect the new user
    revalidatePath("/dashboard/users");

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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

// Update an existing user
export async function updateUser(userData: {
  id: string;
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  location?: string;
}) {
  try {
    const existingUserEmail = await prisma.user.findFirst({
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

    const existingUserPhone = await prisma.user.findFirst({
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

    // Update the user
    const user = await prisma.user.update({
      where: { id: userData.id },
      data: {
        name:
          userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        location: userData.location || null,
        updatedAt: new Date(),
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
        role: user.role,
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
    await prisma.user.delete({
      where: { id: userId },
    });

    // Revalidate the users page to reflect the deleted user
    revalidatePath("/dashboard/users");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Failed to delete user. Please try again.",
    };
  }
}
