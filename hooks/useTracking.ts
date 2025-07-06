"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShipmentStatus } from "@prisma/client";
import { createTrackingEvent, getShipment, getShipmentByReference, getShipments, ShipmentFilter, TrackingEventInput } from "@/actions/trackings";


// React Query keys
export const shipmentKeys = {
  all: ["shipments"] as const,
  lists: () => [...shipmentKeys.all, "list"] as const,
  filtered: (filters: ShipmentFilter) => [...shipmentKeys.lists(), filters] as const,
  details: () => [...shipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
  tracking: () => [...shipmentKeys.all, "tracking"] as const,
  trackByRef: (reference: string) => [...shipmentKeys.tracking(), reference] as const,
};

/**
 * Hook for fetching shipments with optional filtering
 */
export function useShipments(filters: ShipmentFilter = {}) {
  return useQuery({
    queryKey: shipmentKeys.filtered(filters),
    queryFn: async () => {
      const response = await getShipments(filters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch shipments");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for fetching a single shipment by ID
 */
export function useShipment(id: string) {
  return useQuery({
    queryKey: shipmentKeys.detail(id),
    queryFn: async () => {
      const response = await getShipment(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch shipment");
      }
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute - shorter for active tracking
    enabled: !!id, // Only run if id is provided
  });
}

/**
 * Hook for tracking a shipment by reference number (public)
 */
export function useShipmentTracking(trackingNumber: string) {
  return useQuery({
    queryKey: shipmentKeys.trackByRef(trackingNumber),
    queryFn: async () => {
      const response = await getShipmentByReference(trackingNumber);
      if (!response.success) {
        throw new Error(response.error || "Failed to track shipment");
      }
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds - very short for active tracking
    enabled: !!trackingNumber && trackingNumber.length > 0, // Only run if reference is provided
  });
}

/**
 * Hook for adding a new tracking event
 */
export function useCreateTrackingEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrackingEventInput) => createTrackingEvent(data),
    onSuccess: (response, variables) => {
      if (response.success) {
        const statusText = variables.status.replace(/_/g, ' ').toLowerCase();
        
        toast.success(`Tracking updated`, {
          description: `Shipment status changed to ${statusText}`,
        });
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(variables.shipmentId) });
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
        
        // If this was a public tracking update, invalidate that too
        const shipment = queryClient.getQueryData(shipmentKeys.detail(variables.shipmentId));
        if (shipment && (shipment as any).reference) {
          queryClient.invalidateQueries({ 
            queryKey: shipmentKeys.trackByRef((shipment as any).reference) 
          });
        }
      } else {
        toast.error("Failed to update tracking", {
          description: response.error || "Unknown error occurred",
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to update tracking", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}

// Helper function to get status label
export function getStatusLabel(status: ShipmentStatus): string {
  return status.replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper function to get status color
export function getStatusColor(status: ShipmentStatus): string {
  const statusMap: Record<ShipmentStatus, string> = {
    CREATED: "bg-red-500",
    DOCUMENT_RECEIVED: "bg-blue-500",
    DOCUMENTS_SENT: "bg-indigo-500",
    CARGO_ARRIVED: "bg-purple-500",
    DELIVERY_CONFIRMED: "bg-teal-500",
    ENTRY_REGISTERED: "bg-cyan-500",
    CLEARED: "bg-green-500",
    IN_TRANSIT: "bg-amber-500",
    DELIVERED: "bg-emerald-500",
    COMPLETED: "bg-green-600",
    DOCUMENT_REJECTED: "bg-red-500"
  };

  return statusMap[status] || "bg-gray-500";
}

// Helper function to get status badge color
export function getStatusBadgeColor(status: ShipmentStatus): string {
  const statusMap: Record<ShipmentStatus, string> = {
    CREATED: "bg-gray-100 text-gray-800",
    DOCUMENT_RECEIVED: "bg-blue-100 text-blue-800",
    DOCUMENTS_SENT: "bg-indigo-100 text-indigo-800",
    CARGO_ARRIVED: "bg-purple-100 text-purple-800",
    DELIVERY_CONFIRMED: "bg-teal-100 text-teal-800",
    ENTRY_REGISTERED: "bg-cyan-100 text-cyan-800",
    CLEARED: "bg-green-100 text-green-800",
    IN_TRANSIT: "bg-amber-100 text-amber-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
    COMPLETED: "bg-green-100 text-green-800",
    DOCUMENT_REJECTED: "bg-red-100 text-red-800"
  };

  return statusMap[status] || "bg-gray-100 text-gray-800";
}