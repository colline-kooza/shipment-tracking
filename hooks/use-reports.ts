"use client";

import {
  generateReport,
  getReportMetadata,
  ReportFilters,
} from "@/actions/reports";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useReportMetadata() {
  return useQuery({
    queryKey: ["report-metadata"],
    queryFn: async () => {
      const result = await getReportMetadata();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch metadata");
      }
      return result.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filters: ReportFilters) => {
      const result = await generateReport(filters);
      if (!result.success) {
        throw new Error(result.error || "Failed to generate report");
      }
      return result.data!;
    },
    onSuccess: () => {
      // Invalidate and refetch any related queries
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useReportData(filters: ReportFilters, enabled = false) {
  return useQuery({
    queryKey: ["report-data", filters],
    queryFn: async () => {
      const result = await generateReport(filters);
      if (!result.success) {
        throw new Error(result.error || "Failed to generate report");
      }
      return result.data!;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
