"use server";

import { db } from "@/prisma/db";
import { getAuthUser } from "@/config/useAuth";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@prisma/client";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type NotificationFilter = {
  isRead?: boolean;
  type?: NotificationType | 'all';
  limit?: number;
};

export async function getNotifications(filters?: NotificationFilter): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    const whereClause: any = {
      userId: user.id
    };
    
    if (filters) {
      if (filters.isRead !== undefined) {
        whereClause.isRead = filters.isRead;
      }
      
      if (filters.type && filters.type !== 'all') {
        whereClause.type = filters.type;
      }
    }

    const notifications = await db.notification.findMany({
      where: whereClause,
      include: {
        document: {
          select: {
            name: true,
            type: true,
            status: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: filters?.limit || undefined
    });

    return {
      success: true,
      data: notifications,
    };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return {
      success: false,
      error: "Failed to fetch notifications: " + (error as Error).message,
      data: null,
    };
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    const notification = await db.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== user.id) {
      return {
        success: false,
        error: "Notification not found or access denied",
        data: null,
      };
    }

    const updatedNotification = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    revalidatePath('/dashboard/notifications');

    return {
      success: true,
      data: updatedNotification,
    };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return {
      success: false,
      error: "Failed to mark notification as read: " + (error as Error).message,
      data: null,
    };
  }
}

export async function markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    await db.notification.updateMany({
      where: { 
        userId: user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    revalidatePath('/dashboard/notifications');

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return {
      success: false,
      error: "Failed to mark all notifications as read: " + (error as Error).message,
      data: null,
    };
  }
}

export async function deleteNotification(notificationId: string): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    const notification = await db.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== user.id) {
      return {
        success: false,
        error: "Notification not found or access denied",
        data: null,
      };
    }

    await db.notification.delete({
      where: { id: notificationId }
    });

    revalidatePath('/dashboard/notifications');

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return {
      success: false,
      error: "Failed to delete notification: " + (error as Error).message,
      data: null,
    };
  }
}

export async function clearAllNotifications(): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    await db.notification.deleteMany({
      where: { userId: user.id }
    });

    revalidatePath('/dashboard/notifications');

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Failed to clear all notifications:", error);
    return {
      success: false,
      error: "Failed to clear all notifications: " + (error as Error).message,
      data: null,
    };
  }
}