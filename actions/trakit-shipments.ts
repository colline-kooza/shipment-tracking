
"use server";

import { getAuthUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { ShipmentType } from "@prisma/client";
import { generateShipmentReference } from "@/utils/shipmentUtils";

// Define DTO types
export type DocumentUpload = {
  type: string;
  file: {
    url: string;
    name: string;
  };
};

export type CreateShipmentDTO = {
  type: ShipmentType;
  client: string;
  reference?: string;
  trackingNumber?: string;
  origin: string;
  destination: string;
  arrivalDate: Date;
  container?: string;
  truck?: string;
  documents: DocumentUpload[];
};
export type ShipmentFilters = {
  searchQuery?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'status';
  sortOrder?: 'asc' | 'desc';
};

// Minimal shipment type for list view
export type ShipmentListItem = {
  id: string;
  reference: string;
  trackingNumber: string | null;
  client: string;
  origin: string;
  destination: string;
  status: string;
  arrivalDate: Date | null;
  container: string | null;
  truck: string | null;
  createdAt: Date;
  type: string;
  
  
};

export type ShipmentListResponse = {
  shipments: ShipmentListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
export async function createShipment(data: CreateShipmentDTO) {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    const reference = data.reference || await generateShipmentReference(data.type);
    
    const shipment = await db.shipment.create({
      data: {
        reference,
        type: data.type,
        client: data.client,
        origin: data.origin,
        destination: data.destination,
        arrivalDate: data.arrivalDate,
        container: data.container,
        truck: data.truck,
        trackingNumber:data.trackingNumber,
        creator: {
          connect: { id: user.id } // Ensure proper relation connection
        },
       
        timeline: {
          create: {
            status: 'CREATED',
            notes: `Shipment ${reference} created`,
            createdBy: user.id,
          }
        }
      },
    });

    // Create documents if any
    if (data.documents && data.documents.length > 0) {
      await Promise.all(
        data.documents.map(async (doc) => {
          await db.document.create({
            data: {
              name: doc.file.name,
              type: doc.type as any,
              fileUrl: doc.file.url,
              shipmentId: shipment.id,
              userId: user.id,
            },
          });
        })
      );

      // Add timeline event for document upload
      await db.timelineEvent.create({
        data: {
          shipmentId: shipment.id,
          status: 'DOCUMENT_RECEIVED',
          notes: 'Documents uploaded with shipment creation',
          createdBy: user.id,
        }
      });
    }

    revalidatePath('/dashboard/shipments');
    
    return {
      success: true,
      data: shipment,
      error: null,
    };
  } catch (error) {
    console.error("Failed to create shipment:", error);
    return {
      success: false,
      error: "Failed to create shipment: " + (error as Error).message,
      data: null,
    };
  }
}


export async function updateShipmentStatus(id: string, status: string, notes?: string) {
  try {
    const user = await getAuthUser();
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    // Update shipment status
    const updatedShipment = await db.shipment.update({
      where: { id },
      data: { status: status as any },
    });

    // Create timeline event
    await db.timelineEvent.create({
      data: {
        shipmentId: id,
        status: status as any,
        notes: notes || `Status updated to ${status}`,
        createdBy: user.id,
      }
    });

    revalidatePath(`/dashboard/shipments/${id}`);
    revalidatePath('/dashboard/shipments');

    return {
      success: true,
      data: updatedShipment,
      error: null,
    };
  } catch (error) {
    console.error("Failed to update shipment status:", error);
    return {
      success: false,
      error: "Failed to update shipment status",
      data: null,
    };
  }
}


export async function getShipments(filters: ShipmentFilters = {}): Promise<ShipmentListResponse> {
  const { 
    searchQuery = '', 
    status = 'all', 
    page = 1, 
    limit = 10,
    sortBy = 'date',
    sortOrder = 'desc'
  } = filters;
  
  const skip = (page - 1) * limit;
  
  // Base query conditions
  const where: any = {};
  
  // Add status filter if not 'all'
  if (status !== 'all') {
    where.status = status;
  }
  
  if (searchQuery) {
    where.OR = [
      { reference: { contains: searchQuery, mode: 'insensitive' } },
      { client: { contains: searchQuery, mode: 'insensitive' } },
      { trackingNumber: { contains: searchQuery, mode: 'insensitive' } } 
    ];
  }
  
  const totalCount = await db.shipment.count({ where });
  
  // Sort order mapping
  let orderBy: any = {};
  
  if (sortBy === 'date') {
    orderBy.createdAt = sortOrder;
  } else {
    orderBy.createdAt = sortOrder;
  }
  
  let shipments = await db.shipment.findMany({
    where,
    select: {
      id: true,
      reference: true,
      client: true,
      origin: true,
      destination: true,
      status: true,
      arrivalDate: true,
      container: true,
      truck: true,
      createdAt: true,
      type: true,
      trackingNumber: true
    },
    orderBy,
    skip,
    take: limit,
  });
  
  // If sorting by status, we need to sort in memory
  if (sortBy === 'status') {
    // Status rank mapping for sorting
    const statusRank: Record<string, number> = {
      CREATED: 1,
      DOCUMENT_RECEIVED: 2,
      DOCUMENTS_SENT: 3,
      CARGO_ARRIVED: 4,
      DELIVERY_CONFIRMED: 5,
      ENTRY_REGISTERED: 6,
      CLEARED: 7,
      IN_TRANSIT: 8,
      DELIVERED: 9,
      COMPLETED: 10,
    };
    
    shipments = shipments.sort((a, b) => {
      const rankA = statusRank[a.status as keyof typeof statusRank] || 0;
      const rankB = statusRank[b.status as keyof typeof statusRank] || 0;
      
      return sortOrder === 'asc' ? rankA - rankB : rankB - rankA;
    });
  }
  
  return {
    shipments,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/**
 * Get a single shipment by ID with detailed information
 */
export async function getShipmentById(id: string) {
  try {
    const shipment = await db.shipment.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        documents: true,
        timeline: {
          orderBy: {
            timestamp: 'desc',
          },
        },
        checkpoints: true,
        Customer: true,
      },
    });

    if (!shipment) {
      return {
        success: false,
        error: "Shipment not found",
      } as ApiResponse<null>;
    }

    return {
      success: true,
      data: shipment,
    } as ApiResponse<typeof shipment>;
  } catch (error) {
    console.error("Error fetching shipment:", error);
    return {
      success: false,
      error: "Failed to fetch shipment details",
    } as ApiResponse<null>;
  }
}