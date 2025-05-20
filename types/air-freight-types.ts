import { 
  ShipmentStatus, 
  DocumentStatus, 
  DocumentType, 
} from "@prisma/client";
import { ShipmentType } from "./shipments";

export interface AirFreightShipment {
  id: string;
  reference: string;
  type: ShipmentType.AIR;
  client: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  airWaybill: string | null;
  arrivalDate: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  invoiceStatus: string;
  createdBy: string;
  organisationId: string | null;
  customerId: string | null;
  creator: {
    name: string;
    image: string | null;
  };
  Customer: {
    name: string;
    company: string | null;
  } | null;
  TrackingEvent: {
    id: string;
    status: ShipmentStatus;
    location: string | null;
    notes: string | null;
    timestamp: string | Date;
  }[];
  documents: {
    id: string;
    status: DocumentStatus;
    type: DocumentType;
  }[];
}

export interface AirFreightStatsData {
  totalCount: number;
  statusCounts: {
    status: ShipmentStatus;
    count: number;
  }[];
  missingDocumentsCount: number;
  pendingDocumentsCount: number;
}

export interface AirFreightFilter {
  status?: ShipmentStatus | 'all';
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  airWaybill?: string;
}

export interface DocumentStatusInfo {
  status: 'missing' | 'rejected' | 'pending' | 'verified';
  label: string;
}

export interface StatusCountsInfo {
  total: number;
  pending: number;
  transit: number;
  delivered: number;
  completed: number;
}