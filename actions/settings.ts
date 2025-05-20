"use server";

import { db } from "@/prisma/db";
import { getAuthUser } from "@/config/useAuth";
import { revalidatePath } from "next/cache";

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

/**
 * Update user profile settings
 */
export async function updateProfileSettings(data: ProfileSettingsData): Promise<ApiResponse<any>> {
  try {
    // Get the current authenticated user
    const user = await getAuthUser();
    
    if (!user || !user.id) {
      return {
        success: false,
        error: "Authentication required"
      };
    }
    
    // Update the user profile in the database
    const updatedUser = await db.user.update({
      where: {
        id: user.id
      },
      data: {
        name: data.name,
        email: data.email,
        // preferences: {
        //   upsert: {
        //     create: {
        //       language: data.language,
        //       timeZone: data.timeZone
        //     },
        //     update: {
        //       language: data.language,
        //       timeZone: data.timeZone
        //     }
        //   }
        // }
      }
    });
    
    // Revalidate the settings page to reflect changes
    revalidatePath('/dashboard/settings');
    
    return {
      success: true,
      data: {
        name: updatedUser.name,
        email: updatedUser.email,
        language: data.language,
        timeZone: data.timeZone
      }
    };
  } catch (error) {
    console.error("Failed to update profile settings:", error);
    return {
      success: false,
      error: "Failed to update profile settings: " + (error as Error).message
    };
  }
}