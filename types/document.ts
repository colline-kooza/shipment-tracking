import type { Document, DocumentStatus, DocumentType } from "@prisma/client";

// Extended document type with shipment relation
export interface DocumentWithShipment extends Document {
  uploadedBy: {
    name: string;
    image?: string | null;
  };
  shipment?: {
    reference: string;
  } | null;
}

// Document counts interface
export interface DocumentCounts {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
}

// Document upload interface
export interface DocumentUploadData {
  type: DocumentType;
  file: {
    url: string;
    name: string;
  };
  referenceNumber?: string | null;
}

// Document filter interface
export interface DocumentFilter {
  status?: DocumentStatus;
  type?: DocumentType;
  search?: string;
}
