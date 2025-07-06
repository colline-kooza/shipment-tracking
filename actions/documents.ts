"use server";

import { db } from "@/prisma/db";
import { getAuthUser } from "@/config/useAuth";
import { revalidatePath } from "next/cache";
import {
  DocumentStatus,
  type DocumentType,
  NotificationType,
} from "@prisma/client";

export type DocumentUpload = {
  type: DocumentType;
  file: {
    url: string;
    name: string;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Improved DocumentFilter type
export type DocumentFilter = {
  status?: DocumentStatus;
  type?: DocumentType;
  search?: string;
};

export async function getDocuments(
  filters: DocumentFilter = {}
): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();

    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    // Build where clause more efficiently
    const whereClause: any = {};

    // Apply filters only if they have valid values
    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.search?.trim()) {
      whereClause.OR = [
        {
          name: {
            contains: filters.search.trim(),
            mode: "insensitive",
          },
        },
        {
          shipment: {
            reference: {
              contains: filters.search.trim(),
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const documents = await db.document.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: {
            name: true,
            image: true,
          },
        },
        shipment: {
          select: {
            reference: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return {
      success: false,
      error: "Failed to fetch documents: " + (error as Error).message,
      data: null,
    };
  }
}

export async function createDocument(data: {
  shipmentId: string | null;
  referenceNumber: string | null | undefined;
  type: DocumentType;
  file: { url: string; name: string };
}): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    // Add detailed logging
    console.log("Auth user:", user);
    console.log("User ID:", user?.id);

    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    // Use transaction for data consistency
    const result = await db.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          name: data.file.name,
          type: data.type,
          fileUrl: data.file.url,
          shipmentId: data.shipmentId,
          userId: user.id,
          status: DocumentStatus.PENDING,
          referenceNo: data.referenceNumber,
        },
      });

      // Create timeline event only if shipmentId exists
      if (data.shipmentId) {
        await tx.timelineEvent.create({
          data: {
            shipmentId: data.shipmentId,
            status: "DOCUMENT_RECEIVED",
            notes: `New document uploaded: ${data.file.name}`,
            createdBy: user.id,
          },
        });
      }

      // Create notification
      await tx.notification.create({
        data: {
          type: NotificationType.DOCUMENT_ALERT,
          title: "New Document Uploaded",
          message: `Document ${data.file.name} has been uploaded and is pending review`,
          userId: user.id,
          shipmentId: data.shipmentId,
          documentId: document.id,
        },
      });

      return document;
    });

    // Revalidate paths after successful transaction
    if (data.shipmentId) {
      revalidatePath(`/dashboard/shipments/${data.shipmentId}`);
    }
    revalidatePath("/dashboard/documents");
    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to create document:", error);
    return {
      success: false,
      error: "Failed to create document: " + (error as Error).message,
      data: null,
    };
  }
}

export async function updateDocumentStatus(
  documentId: string,
  status: DocumentStatus
): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();

    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    // Use transaction for data consistency
    const result = await db.$transaction(async (tx) => {
      const document = await tx.document.findUnique({
        where: { id: documentId },
        select: {
          shipmentId: true,
          name: true,
          userId: true,
        },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      const updatedDocument = await tx.document.update({
        where: { id: documentId },
        data: { status },
        include: {
          uploadedBy: {
            select: {
              name: true,
            },
          },
          shipment: {
            select: {
              reference: true,
            },
          },
        },
      });

      // Create timeline event only if shipmentId exists
      if (document.shipmentId) {
        await tx.timelineEvent.create({
          data: {
            shipmentId: document.shipmentId,
            status:
              status === DocumentStatus.VERIFIED
                ? "DOCUMENT_RECEIVED"
                : "DOCUMENT_REJECTED",
            notes: `Document ${document.name} ${status.toLowerCase()}`,
            createdBy: user.id,
          },
        });
      }

      // Create notification
      await tx.notification.create({
        data: {
          type: NotificationType.STATUS_CHANGE,
          title: `Document ${
            status === DocumentStatus.VERIFIED ? "Verified" : "Rejected"
          }`,
          message: `Document "${
            document.name
          }" has been ${status.toLowerCase()}`,
          userId: document.userId,
          shipmentId: document.shipmentId,
          documentId: documentId,
        },
      });

      return updatedDocument;
    });

    // Revalidate paths after successful transaction
    if (result.shipment) {
      revalidatePath(`/dashboard/shipments/${result.shipmentId}`);
    }
    revalidatePath("/dashboard/documents");
    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to update document status:", error);
    return {
      success: false,
      error: "Failed to update document status: " + (error as Error).message,
      data: null,
    };
  }
}
