"use server";

import { db } from "@/prisma/db";
import { getAuthUser } from "@/config/useAuth";
import { ShipmentStatus, ShipmentType, DocumentStatus } from "@prisma/client";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type DashboardStats = {
  activeShipments: number;
  pendingDocuments: number;
  inTransitShipments: number;
  pendingInvoices: number;
};

export type ShipmentListItem = {
  id: string;
  reference: string;
  type: ShipmentType;
  client: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  container: string | null;  // Removed undefined to fix type issue
  truck: string | null;      // Removed undefined to fix type issue
  arrivalDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  invoiceStatus: string;
};

/**
 * Fetch dashboard statistics
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    // Removed organization logic - just use user ID
    // const whereCondition = { createdBy: user.id };

    // Get active shipments (all except COMPLETED)
    const activeShipments = await db.shipment.count({
      where: {
        // ...whereCondition,
        status: { not: ShipmentStatus.COMPLETED },
      },
    });

    // Get in-transit shipments
    const inTransitShipments = await db.shipment.count({
      where: {
        // ...whereCondition,
        status: ShipmentStatus.IN_TRANSIT,
      },
    });

    // Get shipments with pending invoices
    const pendingInvoices = await db.shipment.count({
      where: {
        // ...whereCondition,
        invoiceStatus: "PENDING",
      },
    });

    // Get count of pending documents
    const pendingDocuments = await db.document.count({
      where: {
        status: DocumentStatus.PENDING,
        shipment: {
        //   ...whereCondition,
        },
      },
    });

    return {
      success: true,
      data: {
        activeShipments,
        pendingDocuments,
        inTransitShipments,
        pendingInvoices,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard stats: " + (error as Error).message,
    };
  }
}

/**
 * Get recent shipments for dashboard
 * @param limit Number of shipments to return
 */
export async function getRecentShipments(limit: number = 4): Promise<ApiResponse<ShipmentListItem[]>> {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    // Removed organization logic - just use user ID
    // const whereCondition = { createdBy: user.id };

    const shipments = await db.shipment.findMany({
    //   where: whereCondition,
      select: {
        id: true,
        reference: true,
        type: true,
        client: true,
        origin: true,
        destination: true,
        status: true,
        container: true,
        truck: true,
        arrivalDate: true,
        createdAt: true,
        updatedAt: true,
        invoiceStatus: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return {
      success: true,
      data: shipments.map(shipment => ({
        ...shipment,
        // Ensure container and truck are never undefined
        container: shipment.container || null,
        truck: shipment.truck || null
      })) as ShipmentListItem[],
    };
  } catch (error) {
    console.error("Failed to fetch recent shipments:", error);
    return {
      success: false,
      error: "Failed to fetch recent shipments: " + (error as Error).message,
    };
  }
}

/**
 * Get unread notifications count for dashboard
 */
export async function getUnreadNotificationsCount(): Promise<ApiResponse<number>> {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    const count = await db.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error("Failed to fetch unread notifications count:", error);
    return {
      success: false,
      error: "Failed to fetch unread notifications: " + (error as Error).message,
    };
  }
}