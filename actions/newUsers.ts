'use server';

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getRolePermissions } from '@/utils/permissions';

const prisma = new PrismaClient();

// Get all users with their permissions
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map the database users to the format needed by the frontend
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      // Map permissions based on role
      permissions: getRolePermissions(user.role.toLowerCase())
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
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
        error: 'User with this email already exists',
      };
    }

    // Check if user with phone already exists
    const existingPhone = await prisma.user.findUnique({
      where: { phone: userData.phone },
    });

    if (existingPhone) {
      return {
        success: false,
        error: 'User with this phone number already exists',
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
        isVerfied: true, // Set verified to true by default for simplicity
      },
    });

    // Revalidate the users page to reflect the new user
    revalidatePath('/dashboard/users');

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
    console.error('Error creating user:', error);
    return {
      success: false,
      error: 'Failed to create user. Please try again.',
    };
  }
}

// Update a user
export async function updateUser(
  userId: string,
  userData: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    location?: string;
  }
) {
  try {
    // If updating email, check if it's already taken by another user
    if (userData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: userData.email,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        return {
          success: false,
          error: 'Email is already in use',
        };
      }
    }

    // If updating phone, check if it's already taken by another user
    if (userData.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone: userData.phone,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingPhone) {
        return {
          success: false,
          error: 'Phone number is already in use',
        };
      }
    }

    // Update the user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userData,
    });

    // Revalidate the users page to reflect the updated user
    revalidatePath('/dashboard/users');

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      error: 'Failed to update user. Please try again.',
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
    revalidatePath('/dashboard/users');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      error: 'Failed to delete user. Please try again.',
    };
  }
}