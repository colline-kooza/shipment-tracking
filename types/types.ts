import { DocumentStatus, DocumentType, ShipmentStatus } from "@prisma/client";

export type CategoryProps = {
  title: string;
  slug: string;
  imageUrl: string;
  description: string;
};
export type SavingProps = {
  amount: number;
  month: string;
  name: string;
  userId: string;
  paymentDate: any;
};
export type UserProps = {
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  image: string;
  email: string;
  password: string;
};
export type LoginProps = {
  email: string;
  password: string;
};
export type ForgotPasswordProps = {
  email: string;
};
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  groupId: string;
  createdAt: Date;
}

export interface ContactImport {
  name?: string;
  phone: string;
}

// Define TargetPeriod enum to match your schema
export type TargetPeriod = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";

/**
 * Interface for the payload required to create a new sales target
 */
export interface SaleTargetPayload {
  title: string;
  targetAmount: number;
  currentBalance: number;
  period: TargetPeriod;
  slug: string;
}
export interface ProductPayload {
  name: string;
  price: string;
  numberPlate: string;
  modelId: string;
  modelName: string;
}

export interface SalesPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  salesCount: number;
  salesTotal: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Interface for creating a new sales person
 */
export interface CreateSalesPersonPayload {
  name: string;
  phone: string;
  email: string;
}

/**
 * Interface for updating an existing sales person
 */
export interface UpdateSalesPersonPayload {
  name?: string;
  phone?: string;
  email?: string;
}

/**
 * Interface for API responses when working with sales person data
 */
export interface SalesPersonApiResponse {
  success: boolean;
  data?: SalesPerson;
  error?: string;
}

/**
 * Interface for API responses when listing multiple sales persons
 */
export interface SalesPersonsListApiResponse {
  success: boolean;
  data?: SalesPerson[];
  error?: string;
}

/**
 * Interface representing a Sale Target entity
 */
export interface SaleTarget {
  id: string;
  title: string;
  slug: string;
  targetAmount: number;
  currentBalance: number;
  period: TargetPeriod;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Interface for creating a new sale target
 */
export interface CreateSaleTargetPayload {
  title: string;
  targetAmount: number;
  period: TargetPeriod;
  slug?: string;
  currentBalance?: number;
  userId?: string;
}

/**
 * Interface for updating an existing sale target
 */
export interface UpdateSaleTargetPayload {
  title?: string;
  targetAmount?: number;
  period?: TargetPeriod;
  slug?: string;
  currentBalance?: number;
}

/**
 * Interface for API responses when working with sale target data
 */
export interface SaleTargetApiResponse {
  success: boolean;
  data?: SaleTarget;
  error?: string;
}

/**
 * Interface for API responses when listing multiple sale targets
 */
export interface SaleTargetsListApiResponse {
  success: boolean;
  data?: SaleTarget[];
  error?: string;
}
/**
 * Interface representing a Sale entity
 */
export interface Sale {
  id: string;
  salesPersonId: string;
  salesPersonName: string;
  targetId: string;
  total: number;
  productId: string;
  productName: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Interface for creating a new sale
 */
export interface CreateSalePayload {
  salesPersonId: string;
  salesPersonName: string;
  targetId: string;
  total: number;
  productId: string;
  modelId: string;
  productName: string;
}

/**
 * Interface for updating an existing sale
 */
export interface UpdateSalePayload {
  salesPersonId?: string;
  salesPersonName?: string;
  targetId?: string;
  total?: number;
  productId?: string;
  productName?: string;
}

/**
 * Interface for API responses when working with sale data
 */
export interface SaleApiResponse {
  success: boolean;
  data?: Sale;
  error?: string;
}

/**
 * Interface for API responses when listing multiple sales
 */
export interface SalesListApiResponse {
  success: boolean;
  data?: Sale[];
  error?: string;
}

/**
 * Interface representing a SaleTarget entity (for reference in Sale)
 */
export interface SaleTarget {
  id: string;
  title: string;
  slug: string;
  targetAmount: number;
  currentBalance: number;
  period: TargetPeriod;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Interface representing a SalesPerson entity (for reference in Sale)
 */
export interface SalesPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  salesCount: number;
  salesTotal: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Interface representing a Product entity (for reference in Sale)
 */
export interface Product {
  id: string;
  name: string;
  price: string;
  modelId: string;
  modelName: string;
  numberPlate: string;
  salesCount: number;
  salesTotal: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
export type Document = {
  id: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  uploadedAt: Date;
  userId: string;
  shipmentId: string;
  status: DocumentStatus;
  notes?: string | null;
};

export type TimelineEvent = {
  id: string;
  shipmentId: string | null;
  status: ShipmentStatus;
  notes?: string | null;
  location?: string | null;
  timestamp: Date;
  createdBy: string;
};

export type Checkpoint = {
  id: string;
  name: string;
  location: string;
  order: number;
};
export type DocumentWithShipment = {
  id: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  uploadedAt: Date;
  userId: string;
  shipmentId?: string;
  status: DocumentStatus;
  notes: any;
  shipment?: {
    reference: string;
  };
};

// types/shipment-export.ts
export interface ShipmentExportData {
  // Basic Information
  reference: string;
  trackingNumber?: string;
  client: string;
  status: string;
  invoiceStatus: string;
  type: string;

  // Route Information
  origin: string;
  destination: string;

  // Dates
  createdAt: string;
  arrivalDate?: string;
  departureDate?: string;

  // Transport Details
  container?: string;
  truck?: string;
  vessel?: string;
  flight?: string;

  // Progress Metrics
  completedDocuments: number;
  totalDocuments: number;
  completionPercentage: number;
  daysToArrival?: number;
  timelineEvents: number;

  // Documents
  documents: ExportDocumentData[];

  // Timeline
  timeline: ExportTimelineEvent[];

  // Checkpoints
  checkpoints: ExportCheckpoint[];

  // Export Metadata
  exportedAt: string;
  exportedBy?: string;
}

export interface ExportDocumentData {
  name: string;
  type: string;
  status: string;
  uploadedAt: string;
  notes?: string;
  verifiedAt?: string;
  rejectedAt?: string;
}

export interface ExportTimelineEvent {
  id: string;
  event: string;
  description?: string;
  timestamp: string;
  location?: string;
  status?: string;
}

export interface ExportCheckpoint {
  id: string;
  location: string;
  status: string;
  timestamp: string;
  description?: string;
}

export type ExportFormat = "pdf" | "excel" | "csv" | "json";

export interface ExportOptions {
  format: ExportFormat;
  includeDocuments?: boolean;
  includeTimeline?: boolean;
  includeCheckpoints?: boolean;
  customFields?: string[];
}
