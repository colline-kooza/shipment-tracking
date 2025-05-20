"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DocumentStatus, DocumentType } from "@prisma/client";
import { 
  createDocument, 
  updateDocumentStatus, 
  getDocuments, 
  DocumentFilter 
} from "@/actions/documents";

export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  filtered: (filters: DocumentFilter) => [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
};

/**
 * Hook for fetching documents with optional filtering
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
  });
}

/**
 * Hook for creating a new document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      shipmentId: string | null;
      type: DocumentType;
      file: { url: string; name: string };
      referenceNumber:string | null | undefined;
    }) => createDocument(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Document uploaded successfully", {
          description: `Document: ${response.data?.name}`,
        });
        // Invalidate both shipment and document queries
        queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
        queryClient.invalidateQueries({ queryKey: ["shipments"] });
      } else {
        toast.error("Failed to upload document", {
          description: response.error || "Unknown error occurred",
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
 * Hook for updating document status
 */
export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: DocumentStatus;
      notes?: string;
    }) => updateDocumentStatus(id, status),
    onSuccess: (response) => {
      if (response.success) {
        const statusText = response.data?.status.toLowerCase();
        toast.success(`Document ${statusText}`, {
          description: response.data?.status === DocumentStatus.VERIFIED 
            ? "Document has been verified successfully" 
            : "Document has been rejected"
        });
        
        // Invalidate both document and shipment queries
        queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
        queryClient.invalidateQueries({ queryKey: ["shipments"] });
      } else {
        toast.error("Failed to update document status", {
          description: response.error || "Unknown error occurred",
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