"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DocumentStatus, type DocumentType } from "@prisma/client";
import {
  createDocument,
  updateDocumentStatus,
  getDocuments,
  type DocumentFilter,
} from "@/actions/documents";

// Stable query key factory
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  filtered: (filters: DocumentFilter) => {
    // Create a stable key by sorting filter properties
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        const filterKey = key as keyof DocumentFilter;
        if (filters[filterKey] !== undefined) {
          (result as Record<string, unknown>)[filterKey as string] =
            filters[filterKey];
        }
        return result;
      }, {} as Record<string, unknown>);

    return [...documentKeys.lists(), sortedFilters] as const;
  },
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
};

/**
 * Optimized hook for fetching documents with stable query keys
 */
export function useDocuments(filters: DocumentFilter = {}) {
  return useQuery({
    queryKey: documentKeys.filtered(filters),
    queryFn: async () => {
      const response = await getDocuments(filters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch documents");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Optimized hook for creating documents
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      shipmentId: string | null;
      type: DocumentType;
      file: { url: string; name: string };
      referenceNumber: string | null | undefined;
    }) => {
      const response = await createDocument(data);
      if (!response.success) {
        throw new Error(response.error || "Failed to create document");
      }
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Document uploaded successfully", {
        description: `Document: ${data?.name}`,
      });

      // Invalidate and refetch document queries
      queryClient.invalidateQueries({
        queryKey: documentKeys.lists(),
        exact: false,
      });

      // Invalidate shipment queries if document is associated with a shipment
      if (data?.shipmentId) {
        queryClient.invalidateQueries({
          queryKey: ["shipments"],
          exact: false,
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to upload document", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}

/**
 * Optimized hook for updating document status
 */
export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: DocumentStatus;
    }) => {
      const response = await updateDocumentStatus(id, status);
      if (!response.success) {
        throw new Error(response.error || "Failed to update document status");
      }
      return response.data;
    },
    onSuccess: (data) => {
      const statusText = data?.status.toLowerCase();
      toast.success(`Document ${statusText}`, {
        description:
          data?.status === DocumentStatus.VERIFIED
            ? "Document has been verified successfully"
            : "Document has been rejected",
      });

      // Invalidate document queries
      queryClient.invalidateQueries({
        queryKey: documentKeys.lists(),
        exact: false,
      });

      // Invalidate shipment queries if document is associated with a shipment
      if (data?.shipmentId) {
        queryClient.invalidateQueries({
          queryKey: ["shipments"],
          exact: false,
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to update document status", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}
