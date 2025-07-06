import { DocumentStatus } from '@prisma/client';
import { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: string;
  permissions: Permission[];
}

export type UserRole = 'admin' | 'staff' | 'agent' | 'client';

export type Permission = 
  | 'manage_users'
  | 'create_shipments'
  | 'view_shipments'
  | 'edit_shipments'
  | 'delete_shipments'
  | 'verify_documents'
  | 'manage_settings'
  | 'view_reports'
  | 'manage_tasks'
  | 'view_analytics';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  status: DocumentStatus;
  notes?: string;
}

export type DocumentType = 
  | 'commercial_invoice' 
  | 'packing_list' 
  | 'bill_of_lading' 
  | 'airway_bill' 
  | 'import_licence' 
  | 'certificate_of_conformity' 
  | 'tax_exemption' 
  | 'certificate_of_origin'
  | 'cmr_waybill';


// Types based on Prisma schema
export enum ShipmentType {
  SEA = "SEA",
  AIR = "AIR",
  ROAD = "ROAD"
}

export enum ShipmentStatus {
  CREATED = "CREATED",
  DOCUMENT_RECEIVED = "DOCUMENT_RECEIVED",
  DOCUMENTS_SENT = "DOCUMENTS_SENT",
  CARGO_ARRIVED = "CARGO_ARRIVED",
  DELIVERY_CONFIRMED = "DELIVERY_CONFIRMED",
  ENTRY_REGISTERED = "ENTRY_REGISTERED",
  CLEARED = "CLEARED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED"
}

export enum InvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  CANCELLED = "CANCELLED"
}

export interface Shipment {
  id: string;
  reference: string;
  type: ShipmentType;
  client: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  container?: string | null;
  truck?: string | null;
  arrivalDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  invoiceStatus: InvoiceStatus;
  createdBy: string;
  organisationId?: string | null;
  customerId?: string | null;
  
}
export type StatusConfig = {
  label: string;
  color: string;
  background: string;
  icon?: React.ElementType;
};

// export type ShipmentStatus = 
//   | 'document_received' 
//   | 'documents_sent' 
//   | 'cargo_arrived' 
//   | 'delivery_confirmed' 
//   | 'entry_registered' 
//   | 'entry_approved' 
//   | 'charges_collected' 
//   | 'truck_allocated'
//   | 'seal_booked'
//   | 'charges_paid'
//   | 'release_processed'
//   | 'container_exited'
//   | 'in_transit'
//   | 'container_returned'
//   | 'invoiced'
//   | 'closed';




export interface Checkpoint {
  id: string;
  name: string;
  location: string;
  order: number;
}

export type NotificationType = 
  | 'document_alert' 
  | 'status_change' 
  | 'task_assigned' 
  | 'payment_reminder'
  | 'document_expiry';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  userId: string;
  shipmentId?: string;
  documentId?: string;
}



export type DocumentFilter = {
  status?: DocumentStatus | 'all';
  type?: DocumentType | 'all';
  search?: string;
};
