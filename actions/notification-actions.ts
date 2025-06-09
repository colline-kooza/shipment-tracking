"use server";

import { db } from "@/prisma/db";
import { getAuthUser } from "@/config/useAuth";

import { ShipmentStatus, UserRole } from "@prisma/client";
import {
  sendBulkStatusUpdateNotifications,
  sendDelayNotification,
} from "@/utils/email-service";

export type NotificationResult = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

// Check for delayed shipments and send notifications
export async function checkAndNotifyDelayedShipments(): Promise<NotificationResult> {
  try {
    const currentDate = new Date();

    // Find shipments that are past their arrival date and not yet delivered/completed
    const delayedShipments = await db.shipment.findMany({
      where: {
        arrivalDate: {
          lt: currentDate,
        },
        status: {
          notIn: [ShipmentStatus.DELIVERED, ShipmentStatus.COMPLETED],
        },
      },
      include: {
        creator: true,
        Customer: true,
      },
    });

    if (delayedShipments.length === 0) {
      return {
        success: true,
        message: "No delayed shipments found",
        data: { count: 0 },
      };
    }

    const notifications = [];

    for (const shipment of delayedShipments) {
      const daysDelayed = Math.ceil(
        (currentDate.getTime() - new Date(shipment.arrivalDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Check if we've already sent a delay notification for this shipment today
      const existingNotification = await db.notification.findFirst({
        where: {
          shipmentId: shipment.id,
          type: "DEADLINE_APPROACHING",
          timestamp: {
            gte: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate()
            ),
          },
        },
      });

      if (existingNotification) {
        continue; // Skip if already notified today
      }

      // Determine customer email (from Customer model or use client field as fallback)
      const customerEmail =
        shipment.Customer?.email ||
        `${shipment.client.toLowerCase().replace(/\s+/g, ".")}@example.com`;
      const customerName = shipment.Customer?.name || shipment.client;

      const notificationData = {
        shipment: {
          reference: shipment.reference,
          trackingNumber: shipment.trackingNumber || undefined,
          client: shipment.client,
          origin: shipment.origin,
          destination: shipment.destination,
          arrivalDate: shipment.arrivalDate,
          status: shipment.status,
          daysDelayed,
        },
        customerName,
        customerEmail,
      };

      notifications.push(notificationData);

      // Create notification record in database
      await db.notification.create({
        data: {
          type: "DEADLINE_APPROACHING",
          title: `Shipment Delayed - ${shipment.reference}`,
          message: `Your shipment is delayed by ${daysDelayed} day${daysDelayed > 1 ? "s" : ""}`,
          userId: shipment.createdBy,
          shipmentId: shipment.id,
        },
      });
    }

    // Send all delay notifications
    const emailResults = await Promise.allSettled(
      notifications.map((notification) => sendDelayNotification(notification))
    );

    const successful = emailResults.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;

    return {
      success: true,
      message: `Processed ${delayedShipments.length} delayed shipments. Sent ${successful} notifications.`,
      data: {
        totalDelayed: delayedShipments.length,
        notificationsSent: successful,
        notificationsFailed: emailResults.length - successful,
      },
    };
  } catch (error) {
    console.error("Error checking delayed shipments:", error);
    return {
      success: false,
      message: "Failed to check delayed shipments",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Send status update notifications to staff
export async function notifyStaffOfStatusUpdate(
  shipmentId: string,
  newStatus: ShipmentStatus,
  previousStatus: ShipmentStatus,
  updateNotes?: string
): Promise<NotificationResult> {
  try {
    const user = await getAuthUser();

    if (!user?.id) {
      return {
        success: false,
        message: "Unauthorized access",
        error: "User not authenticated",
      };
    }

    // Get shipment details
    const shipment = await db.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        creator: true,
      },
    });

    if (!shipment) {
      return {
        success: false,
        message: "Shipment not found",
        error: "Invalid shipment ID",
      };
    }

    // Get all staff members (ADMIN, AGENT, STAFF roles)
    const staffMembers = await db.user.findMany({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.AGENT, UserRole.STAFF],
        },
        status: true, // Only active users
      },
    });

    if (staffMembers.length === 0) {
      return {
        success: true,
        message: "No staff members to notify",
        data: { count: 0 },
      };
    }

    // Prepare notification data for each staff member
    const notifications = staffMembers.map((staff) => ({
      shipment: {
        reference: shipment.reference,
        trackingNumber: shipment.trackingNumber || undefined,
        client: shipment.client,
        origin: shipment.origin,
        destination: shipment.destination,
        status: newStatus,
        previousStatus,
      },
      staffName: staff.name,
      staffEmail: staff.email,
      updateNotes,
      updatedBy: user.name,
    }));

    // Send bulk notifications
    const emailResults = await sendBulkStatusUpdateNotifications(notifications);

    // Create notification records in database for each staff member
    await Promise.all(
      staffMembers.map((staff) =>
        db.notification.create({
          data: {
            type: "STATUS_CHANGE",
            title: `Shipment Status Updated - ${shipment.reference}`,
            message: `Status changed from ${previousStatus.replace(/_/g, " ")} to ${newStatus.replace(/_/g, " ")}`,
            userId: staff.id,
            shipmentId: shipment.id,
          },
        })
      )
    );

    return {
      success: true,
      message: `Notified ${emailResults.successful} out of ${emailResults.total} staff members`,
      data: emailResults,
    };
  } catch (error) {
    console.error("Error notifying staff of status update:", error);
    return {
      success: false,
      message: "Failed to notify staff",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Manual trigger for checking delayed shipments (for testing or manual runs)
export async function manualDelayCheck(): Promise<NotificationResult> {
  try {
    const user = await getAuthUser();

    if (!user?.id || user.role !== UserRole.ADMIN) {
      return {
        success: false,
        message: "Unauthorized access - Admin role required",
        error: "Insufficient permissions",
      };
    }

    return await checkAndNotifyDelayedShipments();
  } catch (error) {
    console.error("Error in manual delay check:", error);
    return {
      success: false,
      message: "Failed to perform manual delay check",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get notification history for a shipment
export async function getShipmentNotifications(shipmentId: string) {
  try {
    const notifications = await db.notification.findMany({
      where: {
        shipmentId,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    return {
      success: true,
      data: notifications,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching shipment notifications:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
