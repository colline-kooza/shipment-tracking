"use client";

import {
  createCustomer,
  CreateCustomerDTO,
  CustomerFilters,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  searchCustomers,
  updateCustomer,
  UpdateCustomerDTO,
} from "@/actions/customers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters: CustomerFilters) =>
    [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  search: (query: string) => [...customerKeys.all, "search", query] as const,
};

// Get customers with pagination and filtering
export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => getCustomers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get customer by ID
export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomerById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Search customers
export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: customerKeys.search(query),
    queryFn: () => searchCustomers(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create customer mutation
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerDTO) => createCustomer(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Customer created successfully", {
          description: `Customer "${response.data?.name}" has been created.`,
        });
        // Invalidate customers list to trigger a refetch
        queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      } else {
        toast.error("Failed to create customer", {
          description: response.error || "Unknown error occurred",
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to create customer", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}

// Update customer mutation
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCustomerDTO) => updateCustomer(data),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success("Customer updated successfully", {
          description: `Customer "${response.data?.name}" has been updated.`,
        });
        // Invalidate customers list and specific customer detail
        queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: customerKeys.detail(variables.id),
        });
      } else {
        toast.error("Failed to update customer", {
          description: response.error || "Unknown error occurred",
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to update customer", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}

// Delete customer mutation
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Customer deleted successfully");
        // Invalidate customers list to trigger a refetch
        queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      } else {
        toast.error("Failed to delete customer", {
          description: response.error || "Unknown error occurred",
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to delete customer", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}
