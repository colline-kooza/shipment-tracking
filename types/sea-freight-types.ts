// types/sea-freight.ts
import { 
  ShipmentStatus, 
  DocumentStatus, 
  DocumentType, 
} from "@prisma/client";
import { ShipmentType } from "./shipments";

export interface SeaFreightShipment {
  id: string;
  reference: string;
  type: ShipmentType.SEA;
  client: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  container: string | null;
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

export interface SeaFreightStatsData {
  totalCount: number;
  statusCounts: {
    status: ShipmentStatus;
    count: number;
  }[];
  missingDocumentsCount: number;
  pendingDocumentsCount: number;
}

export interface SeaFreightFilter {
  status?: ShipmentStatus | 'all';
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  container?: string;
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