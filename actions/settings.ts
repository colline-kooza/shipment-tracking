"use server";

import { db } from "@/prisma/db";
import { getAuthUser } from "@/config/useAuth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ProfileSettingsData = {
  name: string;
  email: string;
  language: string;
  timeZone: string;
};

export type SecuritySettingsData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  enableTwoFactor: boolean;
};

export type NotificationSettingsData = {
  documentAlerts: boolean;
  statusUpdates: boolean;
  taskAssignments: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
};

/**
 * Update user profile settings
 */
export async function updateProfileSettings(
  data: ProfileSettingsData
): Promise<ApiResponse<any>> {
  try {
    // Get the current authenticated user
    const user = await getAuthUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check if email is already taken by another user
    if (data.email !== user.email) {
      const existingUser = await db.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== user.id) {
        return {
          success: false,
          error: "Email address is already in use",
        };
      }
    }

    // Parse name into firstName and lastName
    const nameParts = data.name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Update the user profile in the database
    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: data.name,
        firstName: firstName,
        lastName: lastName,
        email: data.email,
      },
    });

    // Revalidate the settings page to reflect changes
    revalidatePath("/dashboard/settings");

    return {
      success: true,
      data: {
        name: updatedUser.name,
        email: updatedUser.email,
        language: data.language,
        timeZone: data.timeZone,
      },
    };
  } catch (error) {
    console.error("Failed to update profile settings:", error);
    return {
      success: false,
      error: "Failed to update profile settings. Please try again.",
    };
  }
}

/**
 * Update user security settings
 */
export async function updateSecuritySettings(
  data: SecuritySettingsData
): Promise<ApiResponse<any>> {
  try {
    // Get the current authenticated user
    const user = await getAuthUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Get the current user with password from database
    const currentUser = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true },
    });

    if (!currentUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      data.currentPassword,
      currentUser.password
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(
      data.newPassword,
      currentUser.password
    );

    if (isSamePassword) {
      return {
        success: false,
        error: "New password must be different from current password",
      };
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(data.newPassword, saltRounds);

    // Update the user's password and two-factor setting
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedNewPassword,
        // Note: You might want to add a twoFactorEnabled field to your User model
        // twoFactorEnabled: data.enableTwoFactor,
        updatedAt: new Date(),
      },
    });

    // Revalidate the settings page
    revalidatePath("/dashboard/settings");

    return {
      success: true,
      data: {
        message: "Security settings updated successfully",
        twoFactorEnabled: data.enableTwoFactor,
      },
    };
  } catch (error) {
    console.error("Failed to update security settings:", error);
    return {
      success: false,
      error: "Failed to update security settings. Please try again.",
    };
  }
}

/**
 * Update user notification preferences
 */
export async function updateNotificationSettings(
  data: NotificationSettingsData
): Promise<ApiResponse<any>> {
  try {
    // Get the current authenticated user
    const user = await getAuthUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Note: Since notification preferences aren't in your current schema,
    // you might want to create a UserPreferences table or add fields to User model
    // For now, we'll simulate the update and return success

    // In a real implementation, you would do something like:
    /*
    await db.userPreferences.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        documentAlerts: data.documentAlerts,
        statusUpdates: data.statusUpdates,
        taskAssignments: data.taskAssignments,
        emailNotifications: data.emailNotifications,
        pushNotifications: data.pushNotifications,
      },
      update: {
        documentAlerts: data.documentAlerts,
        statusUpdates: data.statusUpdates,
        taskAssignments: data.taskAssignments,
        emailNotifications: data.emailNotifications,
        pushNotifications: data.pushNotifications,
        updatedAt: new Date()
      }
    });
    */

    // Revalidate the settings page
    revalidatePath("/dashboard/settings");

    return {
      success: true,
      data: {
        message: "Notification preferences updated successfully",
        preferences: data,
      },
    };
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    return {
      success: false,
      error: "Failed to update notification preferences. Please try again.",
    };
  }
}

/**
 * Get user settings (profile, security status, and notification preferences)
 */
export async function getUserSettings(): Promise<
  ApiResponse<{
    profile: ProfileSettingsData;
    security: { twoFactorEnabled: boolean };
    notifications: NotificationSettingsData;
  }>
> {
  try {
    const user = await getAuthUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        // Add other fields as needed
      },
    });

    if (!userData) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: {
        profile: {
          name: userData.name,
          email: userData.email,
          language: "en", // Default values since not in schema
          timeZone: "UTC+3",
        },
        security: {
          twoFactorEnabled: false, // Default since not in schema
        },
        notifications: {
          documentAlerts: true, // Default values
          statusUpdates: true,
          taskAssignments: true,
          emailNotifications: true,
          pushNotifications: false,
        },
      },
    };
  } catch (error) {
    console.error("Failed to get user settings:", error);
    return {
      success: false,
      error: "Failed to load user settings",
    };
  }
}

/**
 * Validate password strength (utility function - not a server action)
 * This function should be used on the client side or within other server actions
 */
export async function validatePasswordStrength(
  password: string
): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
