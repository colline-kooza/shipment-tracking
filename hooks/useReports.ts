"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  generateReport,
  getReportMetadata,
  type ReportFilters,
  type ReportData,
} from "@/actions/reports";

// Stable query key factory
export const reportKeys = {
  all: ["reports"] as const,
  metadata: () => [...reportKeys.all, "metadata"] as const,
  reports: () => [...reportKeys.all, "list"] as const,
  report: (filters: ReportFilters) => {
    // Create stable key by sorting filter properties
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        const filterKey = key as keyof ReportFilters;
        if (filters[filterKey] !== undefined) {
          (result as Record<string, unknown>)[filterKey as string] =
            filters[filterKey];
        }
        return result;
      }, {} as Record<string, unknown>);
    return [...reportKeys.reports(), sortedFilters] as const;
  },
};

/**
 * Hook for fetching report metadata (customers, organisations, users)
 */
export function useReportMetadata() {
  return useQuery({
    queryKey: reportKeys.metadata(),
    queryFn: async () => {
      const response = await getReportMetadata();
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch report metadata");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

/**
 * Hook for generating reports with caching
 */
export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (filters: ReportFilters) => {
      const response = await generateReport(filters);
      if (!response.success) {
        throw new Error(response.error || "Failed to generate report");
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Report generated successfully", {
        description: "Your report is ready for download",
      });
      // Cache the report data
      queryClient.setQueryData(reportKeys.report(variables), data);
    },
    onError: (error: Error) => {
      toast.error("Failed to generate report", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}

/**
 * Hook for fetching cached report data
 */
export function useReportData(filters: ReportFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: reportKeys.report(filters),
    queryFn: async () => {
      const response = await generateReport(filters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch report data");
      }
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
  });
}

/**
 * Hook for invalidating report cache
 */
export function useInvalidateReports() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: reportKeys.all,
      exact: false,
    });
  };
}

/**
 * Hook for clearing specific report cache
 */
export function useClearReportCache() {
  const queryClient = useQueryClient();
  return (filters?: ReportFilters) => {
    if (filters) {
      queryClient.removeQueries({
        queryKey: reportKeys.report(filters),
        exact: true,
      });
    } else {
      queryClient.removeQueries({
        queryKey: reportKeys.reports(),
        exact: false,
      });
    }
  };
}

/**
 * Hook for prefetching report data
 */
export function usePrefetchReport() {
  const queryClient = useQueryClient();
  return (filters: ReportFilters) => {
    queryClient.prefetchQuery({
      queryKey: reportKeys.report(filters),
      queryFn: async () => {
        const response = await generateReport(filters);
        if (!response.success) {
          throw new Error(response.error || "Failed to prefetch report");
        }
        return response.data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
}
