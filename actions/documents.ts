"use server";

import { db } from "@/prisma/db";
import { getAuthUser } from "@/config/useAuth";
import { revalidatePath } from "next/cache";
import { DocumentStatus, DocumentType, NotificationType } from "@prisma/client";

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

export type DocumentFilter = {
  status?: DocumentStatus | 'all';
  type?: DocumentType | 'all';
  search?: string;
};


export async function getDocuments(filters?: DocumentFilter): Promise<ApiResponse<any>> {
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
    
    // if (user.orgId) {
    //   whereClause.userId = {
    //     in: await db.user
    //       .findMany({ 
    //         where: { orgId: user.orgId },
    //         select: { id: true }
    //       })
    //       .then(users => users.map(u => u.id))
    //   };
    // } else {
    //   whereClause.userId = user.id;
    // }
    
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        whereClause.status = filters.status;
      }
      
      if (filters.type && filters.type !== 'all') {
        whereClause.type = filters.type;
      }
      
      if (filters.search && filters.search.trim() !== '') {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { 
            shipment: { 
              reference: { contains: filters.search, mode: 'insensitive' } 
            } 
          }
        ];
      }
    }

    const documents = await db.document.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: {
            name: true,
            image: true
          }
        },
        shipment: {
          select: {
            reference: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
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
    
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
        data: null,
      };
    }

    const document = await db.document.create({
      data: {
        name: data.file.name,
        type: data.type,
        fileUrl: data.file.url,
        shipmentId: data.shipmentId,
        userId: user.id,
        status: DocumentStatus.PENDING,
        referenceNo: data.referenceNumber
      },
    });

    // Create timeline event for document upload
    await db.timelineEvent.create({
      data: {
        shipmentId: data.shipmentId!,
        status: "DOCUMENT_RECEIVED",
        notes: `New document uploaded: ${data.file.name}`,
        createdBy: user.id,
      },
    });

    // Create notification for document upload
    await db.notification.create({
      data: {
        type: NotificationType.DOCUMENT_ALERT,
        title: "New Document Uploaded",
        message: `Document ${data.file.name} has been uploaded and is pending review`,
        userId: user.id,
        shipmentId: data.shipmentId,
        documentId: document.id
      }
    });

    revalidatePath(`/dashboard/shipments/${data.shipmentId}`);
    revalidatePath('/dashboard/documents');
    revalidatePath('/dashboard/notifications');

    return {
      success: true,
      data: document,
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
  status: DocumentStatus,
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

    const document = await db.document.findUnique({
      where: { id: documentId },
      select: { 
        shipmentId: true, 
        name: true,
        userId: true 
      }
    });

    if (!document) {
      return {
        success: false,
        error: "Document not found",
        data: null,
      };
    }

    const updatedDocument = await db.document.update({
      where: { id: documentId },
      data: { 
        status, 
      },
      include: {
        uploadedBy: {
          select: {
            name: true
          }
        },
        shipment: {
          select: {
            reference: true
          }
        }
      }
    });

    await db.timelineEvent.create({
      data: {
        shipmentId: document.shipmentId!,
        status: status === DocumentStatus.VERIFIED ? "DOCUMENT_RECEIVED" : "DOCUMENT_REJECTED",
        notes: `Document ${document.name} ${status.toLowerCase()}`,
        createdBy: user.id,
      },
    });

    // Create notification for document status update
    await db.notification.create({
      data: {
        type: NotificationType.STATUS_CHANGE,
        title: `Document ${status === DocumentStatus.VERIFIED ? "Verified" : "Rejected"}`,
        message: `Document "${document.name}" has been ${status.toLowerCase()}`,
        userId: document.userId, // Send notification to document uploader
        shipmentId: document.shipmentId,
        documentId: documentId
      }
    });

    revalidatePath(`/dashboard/shipments/${document.shipmentId}`);
    revalidatePath('/dashboard/documents');
    revalidatePath('/dashboard/notifications');

    return {
      success: true,
      data: updatedDocument,
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