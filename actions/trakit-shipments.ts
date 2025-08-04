"use server";
import { getAuthUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import {
  DocumentStatus,
  type ShipmentStatus,
  type ShipmentType,
  type DocumentType,
  type Prisma,
} from "@prisma/client";
import { generateShipmentReference } from "@/utils/shipmentUtils";
import ShipmentStatusUpdateEmail from "@/components/emails/sendShipmentStatusUpdate";
import { Resend } from "resend";

// Define DTO types
export type DocumentUpload = {
  type: DocumentType; // Use Prisma's DocumentType enum
  file: {
    url: string;
    name: string;
  };
};

export interface CreateShipmentDTO {
  type: ShipmentType;
  client?: string | null;
  customerId: string;
  consignee?: string | null;
  reference: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  arrivalDate: Date;
  container?: string | null;
  truck?: string | null;
  airwayBillNumber?: string | null;
  billOfLadingNumber?: string | null;
  documents?: DocumentUpload[];
}

export interface UpdateShipmentDTO {
  type?: ShipmentType;
  client?: string | null;
  customerId?: string | null; // Allow null for disconnecting
  consignee?: string | null;
  reference?: string;
  trackingNumber?: string;
  origin?: string;
  destination?: string;
  arrivalDate?: Date;
  container?: string | null;
  truck?: string | null;
  airwayBillNumber?: string | null;
  billOfLadingNumber?: string | null;
  // documents?: DocumentUpload[]; // Documents are handled separately, not directly in shipment update
}

export type ShipmentFilters = {
  searchQuery?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "status";
  sortOrder?: "asc" | "desc";
};

// Minimal shipment type for list view - UPDATED
export type ShipmentListItem = {
  id: string;
  reference: string;
  trackingNumber: string | null;
  consignee: string | null;
  origin: string;
  destination: string;
  status: string;
  arrivalDate: Date | null;
  container: string | null;
  truck: string | null;
  airwayBillNumber?: string | null; // Added
  billOfLadingNumber?: string | null; // Added
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

// Email notification types
export type ShipmentEmailData = {
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
  type: string;
  createdAt: Date;
  consignee?: string | null;
  airwayBillNumber?: string | null;
  billOfLadingNumber?: string | null;
};

export type CustomerEmailData = {
  id: string;
  email: string | null;
  name: string;
};

export type EmailNotificationResult = {
  success: boolean;
  error?: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendShipmentStatusUpdateEmail(
  customerEmail: string,
  shipmentData: ShipmentEmailData,
  previousStatus: string,
  notes?: string
): Promise<EmailNotificationResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }
    const response = await resend.emails.send({
      from: "Shipments <info@lubegajovan.com>",
      to: [customerEmail],
      subject: `Shipment Update - ${shipmentData.reference}`,
      react: ShipmentStatusUpdateEmail({
        shipment: shipmentData,
        previousStatus,
        notes,
      }),
    });
    if (!response) {
      throw new Error("Failed to send email - no response from service");
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to send shipment status update email:", error);
    return {
      success: false,
      error: `Failed to send notification email: ${(error as Error).message}`,
    };
  }
}

async function sendShipmentCreationEmail(
  customerEmail: string,
  shipmentData: ShipmentEmailData
): Promise<EmailNotificationResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }
    console.log(customerEmail, "email");
    const response = await resend.emails.send({
      from: "Shipments <info@lubegajovan.com>",
      to: [customerEmail],
      subject: `New Shipment Created - ${shipmentData.reference}`,
      react: ShipmentStatusUpdateEmail({
        shipment: shipmentData,
        previousStatus: "NONE",
        notes: "Your shipment has been created and is now being processed.",
        // isNewShipment: true,
      }),
    });
    console.log(response, "respomse");
    if (!response) {
      throw new Error("Failed to send email - no response from service");
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to send shipment creation email:", error);
    return {
      success: false,
      error: `Failed to send notification email: ${(error as Error).message}`,
    };
  }
}

async function getCustomerEmail(
  customerId: string | null
): Promise<CustomerEmailData | null> {
  if (!customerId) return null;
  try {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    return customer;
  } catch (error) {
    console.error("Failed to get customer email:", error);
    return null;
  }
}

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

    const reference =
      data.reference || (await generateShipmentReference(data.type));
    const shipment = await db.shipment.create({
      data: {
        reference,
        type: data.type,
        client: data.client,
        origin: data.origin,
        destination: data.destination,
        customerId: data.customerId,
        arrivalDate: data.arrivalDate,
        container: data.container,
        consignee: data.consignee,
        truck: data.truck,
        trackingNumber: data.trackingNumber,
        createdBy: user.id,
        status: "CREATED",
        airwayBillNumber: data.airwayBillNumber,
        billOfLadingNumber: data.billOfLadingNumber,
        timeline: {
          create: {
            status: "CREATED",
            notes: `Shipment ${reference} created`,
            createdBy: user.id,
          },
        },
      },
    });

    // Create documents if any
    if (data.documents && data.documents.length > 0) {
      await Promise.all(
        data.documents.map(async (doc) => {
          await db.document.create({
            data: {
              name: doc.file.name,
              type: doc.type, // Use DocumentType directly
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
          status: "DOCUMENT_RECEIVED",
          notes: "Documents uploaded with shipment creation",
          createdBy: user.id,
        },
      });
    }

    // Send email notification to customer
    const customer = await getCustomerEmail(data.customerId);
    if (customer?.email) {
      const shipmentEmailData: ShipmentEmailData = {
        id: shipment.id,
        reference: shipment.reference,
        trackingNumber: shipment.trackingNumber,
        client: shipment.client || customer.name,
        origin: shipment.origin,
        destination: shipment.destination,
        status: shipment.status,
        arrivalDate: shipment.arrivalDate,
        container: shipment.container,
        truck: shipment.truck,
        type: shipment.type,
        createdAt: shipment.createdAt,
        consignee: shipment.consignee,
        airwayBillNumber: shipment.airwayBillNumber,
        billOfLadingNumber: shipment.billOfLadingNumber,
      };
      const emailResult = await sendShipmentCreationEmail(
        customer.email,
        shipmentEmailData
      );
      if (!emailResult.success) {
        console.warn(
          "Failed to send shipment creation email:",
          emailResult.error
        );
      }
    }

    revalidatePath("/dashboard/shipments");
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

export async function updateShipment(id: string, data: UpdateShipmentDTO) {
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    // Destructure customerId from the input data
    const { customerId, ...restOfData } = data;

    // Build the update payload for Prisma's ShipmentUpdateInput
    const updatePayload: Prisma.ShipmentUpdateInput = {
      ...restOfData, // Spread all other fields that can be directly updated
      updatedAt: new Date(),
    };

    // Handle customerId relation update
    if (customerId !== undefined) {
      if (customerId === null) {
        // If customerId is explicitly null, disconnect the existing customer relation
        updatePayload.Customer = { disconnect: true };
      } else {
        // If customerId is a string, connect to the specified customer
        updatePayload.Customer = { connect: { id: customerId } };
      }
    }

    const shipment = await db.shipment.update({
      where: { id },
      data: updatePayload, // Pass the carefully constructed updatePayload
    });

    // Add timeline event for shipment update
    await db.timelineEvent.create({
      data: {
        shipmentId: id,
        status: "UPDATED", // Now "UPDATED" is a valid status in Prisma schema
        notes: "Shipment details updated",
        createdBy: user.id,
      },
    });

    revalidatePath("/dashboard/shipments");
    return {
      success: true,
      data: shipment,
      error: null,
    };
  } catch (error) {
    console.error("Failed to update shipment:", error);
    return {
      success: false,
      error: "Failed to update shipment: " + (error as Error).message,
      data: null,
    };
  }
}

export async function updateShipmentStatus(
  id: string,
  status: ShipmentStatus,
  notes?: string,
  statusDate?: string,
  documentFile?: { url: string; name: string; type: DocumentType } // Use DocumentType directly
) {
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }
    const currentShipment = await db.shipment.findUnique({
      where: { id },
      select: {
        id: true,
        reference: true,
        trackingNumber: true,
        client: true,
        origin: true,
        destination: true,
        status: true,
        arrivalDate: true,
        container: true,
        truck: true,
        type: true,
        createdAt: true,
        consignee: true,
        customerId: true,
        airwayBillNumber: true,
        billOfLadingNumber: true,
      },
    });
    if (!currentShipment) {
      return {
        success: false,
        error: "Shipment not found",
        data: null,
      };
    }
    const previousStatus = currentShipment.status;
    // Update shipment status and statusUpdateDate
    const updatedShipment = await db.shipment.update({
      where: { id },
      data: {
        status: status,
        statusUpdateDate: statusDate ? new Date(statusDate) : undefined,
      },
    });
    // Send email notification to customer if status changed
    if (previousStatus !== status) {
      const customer = await getCustomerEmail(currentShipment.customerId);
      if (customer?.email) {
        const shipmentEmailData: ShipmentEmailData = {
          id: currentShipment.id,
          reference: currentShipment.reference,
          trackingNumber: currentShipment.trackingNumber,
          client: currentShipment.client || customer.name,
          origin: currentShipment.origin,
          destination: currentShipment.destination,
          status: status,
          arrivalDate: currentShipment.arrivalDate,
          container: currentShipment.container,
          truck: currentShipment.truck,
          type: currentShipment.type,
          createdAt: currentShipment.createdAt,
          consignee: currentShipment.consignee,
          airwayBillNumber: currentShipment.airwayBillNumber,
          billOfLadingNumber: currentShipment.billOfLadingNumber,
        };
        const emailResult = await sendShipmentStatusUpdateEmail(
          customer.email,
          shipmentEmailData,
          previousStatus,
          notes
        );
        if (!emailResult.success) {
          console.warn(
            "Failed to send shipment status update email:",
            emailResult.error
          );
        }
      }
    }
    // Create timeline event
    await db.timelineEvent.create({
      data: {
        shipmentId: id,
        status: status,
        notes: notes || `Status updated to ${status}`,
        createdBy: user.id,
        timestamp: statusDate ? new Date(statusDate) : new Date(),
        fileUrl: documentFile?.url || null,
        fileType: documentFile?.type || null,
      },
    });
    // If a document was provided, create a new Document entry
    if (
      documentFile &&
      documentFile.name &&
      documentFile.url &&
      documentFile.type
    ) {
      await db.document.create({
        data: {
          name: documentFile.name,
          type: documentFile.type,
          fileUrl: documentFile.url,
          userId: user.id,
          shipmentId: id,
          notes: `Document attached with status update to ${status}`,
          status: DocumentStatus.VERIFIED,
        },
      });
    }
    revalidatePath(`/dashboard/shipments/${id}`);
    revalidatePath("/dashboard/shipments");
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

export async function getShipments(
  filters: ShipmentFilters = {}
): Promise<ShipmentListResponse> {
  const {
    searchQuery = "",
    status = "all",
    page = 1,
    limit = 10,
    sortBy = "date",
    sortOrder = "desc",
  } = filters;
  const skip = (page - 1) * limit;
  // Base query conditions
  const where: any = {};
  // Add status filter if not 'all'
  if (status !== "all") {
    where.status = status;
  }
  if (searchQuery) {
    where.OR = [
      { reference: { contains: searchQuery, mode: "insensitive" } },
      { client: { contains: searchQuery, mode: "insensitive" } },
      { trackingNumber: { contains: searchQuery, mode: "insensitive" } },
    ];
  }
  const totalCount = await db.shipment.count({ where });
  // Sort order mapping
  const orderBy: any = {};
  if (sortBy === "date") {
    orderBy.createdAt = sortOrder;
  } else {
    orderBy.createdAt = sortOrder;
  }
  let shipments = await db.shipment.findMany({
    where,
    select: {
      id: true,
      reference: true,
      consignee: true,
      origin: true,
      destination: true,
      status: true,
      arrivalDate: true,
      container: true,
      truck: true,
      airwayBillNumber: true, // Added
      billOfLadingNumber: true, // Added
      createdAt: true,
      type: true,
      trackingNumber: true,
    },
    orderBy,
    skip,
    take: limit,
  });
  // If sorting by status, we need to sort in memory
  if (sortBy === "status") {
    // Status rank mapping for sorting
    const statusRank: Record<string, number> = {
      CREATED: 1,
      DOCUMENT_RECEIVED: 2,
      DOCUMENTS_SENT: 3,
      CARGO_ARRIVED: 4,
      TRANSFERRED_TO_CFS: 5,
      ENTRY_REGISTERED: 6,
      CUSTOM_RELEASED: 7,
      DELIVERY_ORDER_OBTAINED: 8,
      TAXES_PAID: 9,
      NIMULE_BORDER_RELEASED: 10,
      ARRIVAL_MALABA: 11,
      DEPARTURE_MALABA: 12,
      ARRIVAL_NIMULE: 13,
      IN_TRANSIT: 14,
      DELIVERED: 15,
      EMPTY_RETURNED: 16,
      DOCUMENT_REJECTED: 17,
      UPDATED: 18,
    };
    shipments = shipments.sort((a, b) => {
      const rankA = statusRank[a.status as keyof typeof statusRank] || 0;
      const rankB = statusRank[b.status as keyof typeof statusRank] || 0;
      return sortOrder === "asc" ? rankA - rankB : rankB - rankA;
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
    const user = await getAuthUser();
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
      } as ApiResponse<null>;
    }
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
            timestamp: "desc",
          },
        },
        checkpoints: true,
        Customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
            consignee: true,
            address: true,
            country: true,
          },
        },
      },
    });
    if (!shipment) {
      return {
        success: false,
        error: "Shipment not found",
      } as ApiResponse<null>;
    }
    // Add consignee to the shipment object for easier access
    const shipmentWithConsignee = {
      ...shipment,
      consignee: shipment.Customer?.consignee || null,
    };
    return {
      success: true,
      data: shipmentWithConsignee,
    } as ApiResponse<typeof shipmentWithConsignee>;
  } catch (error) {
    console.error("Error fetching shipment:", error);
    return {
      success: false,
      error: "Failed to fetch shipment details",
    } as ApiResponse<null>;
  }
}

// Add the delete and update API functions
export async function deleteShipment(id: string) {
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }
    await db.shipment.delete({
      where: { id },
    });
    revalidatePath("/dashboard/shipments");
    return {
      success: true,
      data: null,
      error: null,
    };
  } catch (error) {
    console.error("Failed to delete shipment:", error);
    return {
      success: false,
      error: "Failed to delete shipment: " + (error as Error).message,
      data: null,
    };
  }
}
