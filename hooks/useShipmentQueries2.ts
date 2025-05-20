import { createShipment, CreateShipmentDTO, getShipmentById, getShipments, ShipmentFilters, updateShipmentStatus } from "@/actions/trakit-shipments";
import { 
  useQuery, 
  useSuspenseQuery, 
  useMutation, 
  useQueryClient,
  useInfiniteQuery
} from "@tanstack/react-query";
import { toast } from "sonner";


// Query keys for caching
export const shipmentKeys = {
  all: ["shipments"] as const,
  lists: () => [...shipmentKeys.all, "list"] as const,
  list: (filters: ShipmentFilters) => [...shipmentKeys.lists(), { filters }] as const,
  details: () => [...shipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
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
          description: `Reference: ${response.data?.reference}`,
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
export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: string;
      notes?: string;
    }) => updateShipmentStatus(id, status, notes),
    onSuccess: (response, { id }) => {
      if (response.success) {
        toast.success("Shipment status updated successfully");
        // Invalidate specific shipment and the list
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
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