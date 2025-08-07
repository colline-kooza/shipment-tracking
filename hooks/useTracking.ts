"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShipmentStatus } from "@prisma/client";
import {
  createTrackingEvent,
  getShipment,
  getShipmentByReference,
  getShipments,
  ShipmentFilter,
  TrackingEventInput,
} from "@/actions/trackings";

// React Query keys
export const shipmentKeys = {
  all: ["shipments"] as const,
  lists: () => [...shipmentKeys.all, "list"] as const,
  filtered: (filters: ShipmentFilter) =>
    [...shipmentKeys.lists(), filters] as const,
  details: () => [...shipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
  tracking: () => [...shipmentKeys.all, "tracking"] as const,
  trackByRef: (reference: string) =>
    [...shipmentKeys.tracking(), reference] as const,
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
        const statusText = variables.status.replace(/_/g, " ").toLowerCase();

        toast.success(`Tracking updated`, {
          description: `Shipment status changed to ${statusText}`,
        });

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: shipmentKeys.detail(variables.shipmentId),
        });
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });

        // If this was a public tracking update, invalidate that too
        const shipment = queryClient.getQueryData(
          shipmentKeys.detail(variables.shipmentId)
        );
        if (shipment && (shipment as any).reference) {
          queryClient.invalidateQueries({
            queryKey: shipmentKeys.trackByRef((shipment as any).reference),
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
  return status
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Helper function to get status color
export function getStatusColor(status: ShipmentStatus): string {
  const statusMapBg: Record<ShipmentStatus, string> = {
    [ShipmentStatus.CREATED]: "bg-gray-500",
    [ShipmentStatus.UPDATED]: "bg-gray-600",
    [ShipmentStatus.DOCUMENT_RECEIVED]: "bg-blue-500",
    [ShipmentStatus.DOCUMENTS_SENT]: "bg-indigo-500",
    [ShipmentStatus.IN_TRANSIT]: "bg-amber-500",
    [ShipmentStatus.CARGO_ARRIVED]: "bg-purple-500",
    [ShipmentStatus.TRANSFERRED_TO_CFS]: "bg-cyan-500",
    [ShipmentStatus.ENTRY_REGISTERED]: "bg-teal-500",
    [ShipmentStatus.CUSTOM_RELEASED]: "bg-green-500",
    [ShipmentStatus.DELIVERY_ORDER_OBTAINED]: "bg-lime-500",
    [ShipmentStatus.TAXES_PAID]: "bg-orange-500",
    [ShipmentStatus.ARRIVAL_MALABA]: "bg-yellow-500",
    [ShipmentStatus.DEPARTURE_MALABA]: "bg-yellow-600",
    [ShipmentStatus.ARRIVAL_NIMULE]: "bg-pink-500",
    [ShipmentStatus.NIMULE_BORDER_RELEASED]: "bg-emerald-500",
    [ShipmentStatus.DELIVERED]: "bg-green-600",
    [ShipmentStatus.EMPTY_RETURNED]: "bg-green-700",
    [ShipmentStatus.DOCUMENT_REJECTED]: "bg-red-500",

    // ✅ Add the missing keys below:
    [ShipmentStatus.ARRIVAL_MOMBASA]: "bg-blue-400",
    [ShipmentStatus.TRUCK_ALLOCATED]: "bg-violet-400",
    [ShipmentStatus.PORT_DEPARTURE]: "bg-indigo-400",
  };

  return statusMapBg[status] || "bg-gray-500";
}

// Helper function to get status badge color
export function getStatusBadgeColor(status: ShipmentStatus): string {
  const statusMapBg: Record<ShipmentStatus, string> = {
    [ShipmentStatus.CREATED]: "bg-gray-500",
    [ShipmentStatus.UPDATED]: "bg-gray-600",
    [ShipmentStatus.DOCUMENT_RECEIVED]: "bg-blue-500",
    [ShipmentStatus.DOCUMENTS_SENT]: "bg-indigo-500",
    [ShipmentStatus.IN_TRANSIT]: "bg-amber-500",
    [ShipmentStatus.CARGO_ARRIVED]: "bg-purple-500",
    [ShipmentStatus.TRANSFERRED_TO_CFS]: "bg-cyan-500",
    [ShipmentStatus.ENTRY_REGISTERED]: "bg-teal-500",
    [ShipmentStatus.CUSTOM_RELEASED]: "bg-green-500",
    [ShipmentStatus.DELIVERY_ORDER_OBTAINED]: "bg-lime-500",
    [ShipmentStatus.TAXES_PAID]: "bg-orange-500",
    [ShipmentStatus.ARRIVAL_MALABA]: "bg-yellow-500",
    [ShipmentStatus.DEPARTURE_MALABA]: "bg-yellow-600",
    [ShipmentStatus.ARRIVAL_NIMULE]: "bg-pink-500",
    [ShipmentStatus.NIMULE_BORDER_RELEASED]: "bg-emerald-500",
    [ShipmentStatus.DELIVERED]: "bg-green-600",
    [ShipmentStatus.EMPTY_RETURNED]: "bg-green-700",
    [ShipmentStatus.DOCUMENT_REJECTED]: "bg-red-500",

    // ✅ Add these missing ones
    [ShipmentStatus.ARRIVAL_MOMBASA]: "bg-sky-500",
    [ShipmentStatus.TRUCK_ALLOCATED]: "bg-indigo-400",
    [ShipmentStatus.PORT_DEPARTURE]: "bg-blue-400",
  };

  return statusMapBg[status] || "bg-gray-100 text-gray-800";
}
