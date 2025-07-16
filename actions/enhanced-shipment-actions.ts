"use server";

import { getAuthUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { ShipmentStatus } from "@prisma/client";
import { notifyStaffOfStatusUpdate } from "@/actions/notification-actions";
export type UpdateShipmentStatusDTO = {
  id: string;
  status: ShipmentStatus;
  notes?: string;
  location?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Enhanced update shipment status with email notifications
export async function updateShipmentStatusWithNotifications(
  data: UpdateShipmentStatusDTO
): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();

    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    // Get current shipment to check previous status
    const currentShipment = await db.shipment.findUnique({
      where: { id: data.id },
    });

    if (!currentShipment) {
      return {
        success: false,
        error: "Shipment not found",
      };
    }

    const previousStatus = currentShipment.status;

    // Update shipment status
    const updatedShipment = await db.shipment.update({
      where: { id: data.id },
      data: {
        status: data.status,
        updatedAt: new Date(),
      },
    });

    // Create timeline event
    await db.timelineEvent.create({
      data: {
        shipmentId: data.id,
        status: data.status,
        notes:
          data.notes || `Status updated to ${data.status.replace(/_/g, " ")}`,
        location: data.location,
        createdBy: user.id,
      },
    });

    // Send notifications to staff if status actually changed
    if (previousStatus !== data.status) {
      const notificationResult = await notifyStaffOfStatusUpdate(
        data.id,
        data.status,
        previousStatus,
        data.notes
      );

      if (!notificationResult.success) {
        console.warn(
          "Failed to send status update notifications:",
          notificationResult.error
        );
        // Don't fail the entire operation if notifications fail
      }
    }

    revalidatePath("/dashboard/shipments-trakit");
    revalidatePath(`/dashboard/shipments-trakit/${data.id}`);

    return {
      success: true,
      data: {
        shipment: updatedShipment,
        previousStatus,
        notificationsSent: previousStatus !== data.status,
      },
    };
  } catch (error) {
    console.error("Failed to update shipment status:", error);
    return {
      success: false,
      error: "Failed to update shipment status: " + (error as Error).message,
    };
  }
}

// Get shipments that need attention (delayed, pending documents, etc.)
export async function getShipmentsNeedingAttention() {
  try {
    const currentDate = new Date();
    // Get delayed shipments
    const delayedShipments = await db.shipment.findMany({
      where: {
        arrivalDate: {
          lt: currentDate,
        },
        status: {
          notIn: [ShipmentStatus.DELIVERED, ShipmentStatus.EMPTY_RETURNED],
        },
      },
      include: {
        creator: true,
        documents: true,
      },
      orderBy: {
        arrivalDate: "asc",
      },
    });
    // Get shipments with pending documents
    const shipmentsWithPendingDocs = await db.shipment.findMany({
      where: {
        documents: {
          some: {
            status: "PENDING",
          },
        },
        status: {
          notIn: [ShipmentStatus.DELIVERED, ShipmentStatus.EMPTY_RETURNED],
        },
      },
      include: {
        creator: true,
        documents: {
          where: {
            status: "PENDING",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return {
      success: true,
      data: {
        delayed: delayedShipments.map((shipment) => ({
          ...shipment,
          daysDelayed: Math.ceil(
            (currentDate.getTime() -
              new Date(shipment.arrivalDate ?? new Date()).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        })),
        pendingDocuments: shipmentsWithPendingDocs,
      },
    };
  } catch (error) {
    console.error("Error fetching shipments needing attention:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
