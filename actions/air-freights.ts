"use server";

import { db } from "@/prisma/db";
import { getAuthUser } from "@/config/useAuth";
import { revalidatePath } from "next/cache";
import { ShipmentStatus, ShipmentType } from "@prisma/client";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type AirFreightFilter = {
  status?: ShipmentStatus | 'all';
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  airWaybill?: string;
};

/**
 * Get all air freight shipments with optional filtering
 */
export async function getAirFreightShipments(filters?: AirFreightFilter): Promise<ApiResponse<any>> {
  try {
    const whereClause: any = {
      type: ShipmentType.AIR,
    };
    
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        whereClause.status = filters.status;
      }
      
      if (filters.search && filters.search.trim() !== '') {
        whereClause.OR = [
          { reference: { contains: filters.search, mode: 'insensitive' } },
          { origin: { contains: filters.search, mode: 'insensitive' } },
          { destination: { contains: filters.search, mode: 'insensitive' } },
          { airWaybill: { contains: filters.search, mode: 'insensitive' } },
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
      
      if (filters.airWaybill) {
        whereClause.airWaybill = { contains: filters.airWaybill, mode: 'insensitive' };
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
            company: true,
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
            type: true,
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
    console.error("Failed to fetch air freight shipments:", error);
    return {
      success: false,
      error: "Failed to fetch air freight shipments: " + (error as Error).message,
      data: null,
    };
  }
}

/**
 * Get dashboard stats for air freight
 */
export async function getAirFreightStats(): Promise<ApiResponse<any>> {
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
      type: ShipmentType.AIR,
    };
    
    if (user.orgId) {
      whereClause.organisationId = user.orgId;
    }

    const totalCount = await db.shipment.count({
      where: whereClause,
    });

    const statusCounts = await Promise.all(
      Object.values(ShipmentStatus).map(async (status) => {
        const count = await db.shipment.count({
          where: {
            ...whereClause,
            status,
          },
        });
        
        return { status, count };
      })
    );

    const missingDocumentsCount = await db.shipment.count({
      where: {
        ...whereClause,
        documents: {
          none: {},
        },
      },
    });

    const pendingDocumentsCount = await db.shipment.count({
      where: {
        ...whereClause,
        documents: {
          some: {
            status: "PENDING",
          },
        },
      },
    });

    return {
      success: true,
      data: {
        totalCount,
        statusCounts,
        missingDocumentsCount,
        pendingDocumentsCount,
      },
    };
  } catch (error) {
    console.error("Failed to fetch air freight stats:", error);
    return {
      success: false,
      error: "Failed to fetch air freight stats: " + (error as Error).message,
      data: null,
    };
  }
}