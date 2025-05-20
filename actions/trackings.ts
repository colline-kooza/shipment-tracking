"use server";

import { db } from "@/prisma/db";
import { getAuthUser } from "@/config/useAuth";
import { revalidatePath } from "next/cache";
import { ShipmentStatus } from "@prisma/client";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ShipmentFilter = {
  status?: ShipmentStatus | 'all';
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
};

export type TrackingEventInput = {
  shipmentId: string;
  status: ShipmentStatus;
  location?: string;
  notes?: string;
};

/**
 * Get a specific shipment with all its tracking events
 */
export async function getShipment(id: string): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    const whereClause: any = { id };
    
    // If not admin, only show shipments from their org
    if (user.orgId && user.role !== 'ADMIN') {
      whereClause.organisationId = user.orgId;
    }

    const shipment = await db.shipment.findFirst({
      where: whereClause,
      include: {
        timeline: {
          orderBy: {
            timestamp: 'desc',
          },
        },
        TrackingEvent: {
          orderBy: {
            timestamp: 'desc',
          },
        },
        documents: {
          include: {
            uploadedBy: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            uploadedAt: 'desc',
          },
        },
        creator: {
          select: {
            name: true,
            image: true,
          },
        },
        Customer: true,
        checkpoints: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!shipment) {
      return {
        success: false,
        error: "Shipment not found",
        data: null,
      };
    }

    return {
      success: true,
      data: shipment,
    };
  } catch (error) {
    console.error("Failed to fetch shipment:", error);
    return {
      success: false,
      error: "Failed to fetch shipment: " + (error as Error).message,
      data: null,
    };
  }
}

/**
 * Get all shipments with optional filtering
 */
export async function getShipments(filters?: ShipmentFilter): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    const whereClause: any = {};
    
    // If not admin, only show shipments from their org
    if (user.orgId) {
      whereClause.organisationId = user.orgId;
    }
    
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        whereClause.status = filters.status;
      }
      
      if (filters.search && filters.search.trim() !== '') {
        whereClause.OR = [
          { reference: { contains: filters.search, mode: 'insensitive' } },
          { origin: { contains: filters.search, mode: 'insensitive' } },
          { destination: { contains: filters.search, mode: 'insensitive' } },
          { 
            Customer: { 
              name: { contains: filters.search, mode: 'insensitive' } 
            } 
          }
        ];
      }
      
      if (filters.dateRange) {
        whereClause.arrivalDate = {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to,
        };
      }
    }

    const shipments = await db.shipment.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            name: true,
            image: true,
          },
        },
        Customer: {
          select: {
            name: true,
          },
        },
        TrackingEvent: {
          take: 1,
          orderBy: {
            timestamp: 'desc',
          },
        },
        documents: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return {
      success: true,
      data: shipments,
    };
  } catch (error) {
    console.error("Failed to fetch shipments:", error);
    return {
      success: false,
      error: "Failed to fetch shipments: " + (error as Error).message,
      data: null,
    };
  }
}

/**
 * Add a new tracking event to a shipment
 */
export async function createTrackingEvent(data: TrackingEventInput): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    const shipment = await db.shipment.findUnique({
      where: { id: data.shipmentId },
    });

    if (!shipment) {
      return {
        success: false,
        error: "Shipment not found",
        data: null,
      };
    }

    // Create the tracking event
    const trackingEvent = await db.trackingEvent.create({
      data: {
        shipmentId: data.shipmentId,
        status: data.status,
        location: data.location,
        notes: data.notes,
      },
    });

    // Update the shipment status
    await db.shipment.update({
      where: { id: data.shipmentId },
      data: { status: data.status },
    });

    // Add timeline event
    await db.timelineEvent.create({
      data: {
        shipmentId: data.shipmentId,
        status: data.status,
        notes: data.notes || `Shipment status updated to ${data.status}`,
        location: data.location,
        createdBy: user.id,
      },
    });

    revalidatePath(`/dashboard/shipments/${data.shipmentId}`);
    revalidatePath('/dashboard/shipments');
    revalidatePath('/tracking');

    return {
      success: true,
      data: trackingEvent,
    };
  } catch (error) {
    console.error("Failed to create tracking event:", error);
    return {
      success: false,
      error: "Failed to create tracking event: " + (error as Error).message,
      data: null,
    };
  }
}

/**
 * Get shipment by reference number (public tracking)
 */
export async function getShipmentByReference(reference: string): Promise<ApiResponse<any>> {
  try {
    // No auth required for public tracking
    const shipment = await db.shipment.findFirst({
      where: { reference },
      include: {
        timeline: {
          orderBy: {
            timestamp: 'desc',
          },
        },
        TrackingEvent: {
          orderBy: {
            timestamp: 'desc',
          },
        },
        creator: {
          select: {
            name: true,
            organisation: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
        checkpoints: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!shipment) {
      return {
        success: false,
        error: "Shipment not found with the provided reference number",
        data: null,
      };
    }

    return {
      success: true,
      data: shipment,
    };
  } catch (error) {
    console.error("Failed to fetch shipment by reference:", error);
    return {
      success: false,
      error: "Failed to fetch shipment: " + (error as Error).message,
      data: null,
    };
  }
}