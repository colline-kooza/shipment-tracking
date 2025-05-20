// hooks/useSeaFreightQueries.ts
import {
  useQuery,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ShipmentStatus } from "@prisma/client";
import { getSeaFreightShipments, getSeaFreightStats, SeaFreightFilter } from "@/actions/sea-freights";

// Query keys for caching
export const seaFreightKeys = {
  all: ["seaFreight"] as const,
  lists: () => [...seaFreightKeys.all, "list"] as const,
  list: (filters: SeaFreightFilter | undefined) => 
    [...seaFreightKeys.lists(), { filters }] as const,
  stats: () => [...seaFreightKeys.all, "stats"] as const,
};

/**
 * Hook to fetch sea freight shipments with optional filters
 */
export function useSeaFreightShipments(filters?: SeaFreightFilter) {
  return useQuery({
    queryKey: seaFreightKeys.list(filters),
    queryFn: () => getSeaFreightShipments(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Suspense hook to fetch sea freight shipments
 */
export function useSuspenseSeaFreightShipments(filters?: SeaFreightFilter) {
  const { data, refetch } = useSuspenseQuery({
    queryKey: seaFreightKeys.list(filters),
    queryFn: () => getSeaFreightShipments(filters),
  });

  return {
    shipments: data?.data || [],
    refetch,
  };
}

/**
 * Hook to fetch sea freight dashboard stats
 */
export function useSeaFreightStats() {
  return useQuery({
    queryKey: seaFreightKeys.stats(),
    queryFn: getSeaFreightStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Count shipments by status
 */
export function getStatusCounts(shipments: any[] | undefined) {
  if (!shipments || shipments.length === 0) {
    return {
      total: 0,
      pending: 0,
      transit: 0,
      delivered: 0,
      completed: 0,
    };
  }

  return {
    total: shipments.length,
    pending: shipments.filter(s => 
      [ShipmentStatus.CREATED, ShipmentStatus.DOCUMENT_RECEIVED].includes(s.status)
    ).length,
    transit: shipments.filter(s => 
      [ShipmentStatus.IN_TRANSIT, ShipmentStatus.CARGO_ARRIVED, ShipmentStatus.ENTRY_REGISTERED, ShipmentStatus.CLEARED].includes(s.status)
    ).length,
    delivered: shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length,
    completed: shipments.filter(s => s.status === ShipmentStatus.COMPLETED).length,
  };
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get document status for a shipment
 */
export function getDocumentStatus(shipment: any) {
  if (!shipment.documents || shipment.documents.length === 0) {
    return { status: 'missing', label: 'No Documents' };
  }
  
  const hasRejectedDocs = shipment.documents.some((doc: any) => doc.status === 'REJECTED');
  if (hasRejectedDocs) {
    return { status: 'rejected', label: 'Documents Rejected' };
  }
  
  const hasPendingDocs = shipment.documents.some((doc: any) => doc.status === 'PENDING');
  if (hasPendingDocs) {
    return { status: 'pending', label: 'Documents Pending' };
  }
  
  return { status: 'verified', label: 'Documents Verified' };
}