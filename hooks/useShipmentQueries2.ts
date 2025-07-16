import {
  createShipment,
  CreateShipmentDTO,
  deleteShipment,
  getShipmentById,
  getShipments,
  ShipmentFilters,
  updateShipment,
  UpdateShipmentDTO,
  updateShipmentStatus,
} from "@/actions/trakit-shipments";
import { getAuthUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { ShipmentType } from "@/types/shipments";
import { $Enums, ShipmentStatus } from "@prisma/client";
import {
  useQuery,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { revalidatePath } from "next/cache";
import { toast } from "sonner";

// Query keys for caching
export const shipmentKeys = {
  all: ["shipments"] as const,
  lists: () => [...shipmentKeys.all, "list"] as const,
  list: (filters: ShipmentFilters) =>
    [...shipmentKeys.lists(), { filters }] as const,
  details: () => [...shipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
  documents: (id: string) => [...shipmentKeys.all, "documents", id] as const,
};

export function useShipments(filters: ShipmentFilters = {}) {
  return useQuery({
    queryKey: shipmentKeys.list(filters),
    queryFn: () => getShipments(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useSuspenseShipments(filters: ShipmentFilters = {}) {
  return useSuspenseQuery({
    queryKey: shipmentKeys.list(filters),
    queryFn: () => getShipments(filters),
  });
}

/**
 * Hook for fetching a single shipment by ID
 */
export function useShipmentById(id: string) {
  return useQuery({
    queryKey: shipmentKeys.detail(id),
    queryFn: () => getShipmentById(id),
    enabled: !!id, // Only run if ID is provided
  });
}

/**
 * Hook for creating a new shipment
 */
export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShipmentDTO) => createShipment(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Shipment created successfully", {
          description: `Tracking Number: ${response.data?.trackingNumber}`,
        });
        // Invalidate shipments list to trigger a refetch
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      } else {
        toast.error("Failed to create shipment", {
          description: response.error || "Unknown error occurred",
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to create shipment", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}

/**
 * Hook for updating shipment status
 */
export type DocumentType2 = $Enums.DocumentType;

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
      statusDate,
      documentFile,
    }: {
      id: string;
      status: ShipmentStatus;
      notes?: string;
      statusDate?: string;
      documentFile?: { url: string; name: string; type: DocumentType2 };
    }) => updateShipmentStatus(id, status, notes, statusDate, documentFile),
    onSuccess: (response, { id, documentFile }) => {
      if (response.success) {
        toast.success("Shipment status updated successfully");
        // Invalidate specific shipment and the list
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
        if (documentFile) {
          // Invalidate documents query if a new document was created
          queryClient.invalidateQueries({
            queryKey: shipmentKeys.documents(id),
          });
        }
      } else {
        toast.error("Failed to update shipment status", {
          description: response.error || "Unknown error occurred",
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to update shipment status", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}
// Add this to your existing hooks
export function useDeleteShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteShipment(id),
    onSuccess: () => {
      // Invalidate shipments list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

// Add this to your existing hooks
export function useUpdateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShipmentDTO }) =>
      updateShipment(id, data),
    onSuccess: (response, { id }) => {
      if (response.success) {
        toast.success("Shipment updated successfully");
        // Invalidate both the specific shipment and the list
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      } else {
        toast.error("Failed to update shipment", {
          description: response.error || "Unknown error occurred",
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to update shipment", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}
