"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  generateReport,
  getReportMetadata,
  getCustomersForEmail,
  sendReportEmail,
  downloadReport, // Import the new action
  type ReportFilters,
  type ReportData,
  type ReportType,
  type ApiResponse,
} from "@/actions/reports";

export function useReportMetadata() {
  return useQuery({
    queryKey: ["report-metadata"],
    queryFn: async () => {
      const result = await getReportMetadata();
      if (!result.success)
        throw new Error(result.error || "Failed to fetch metadata");
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
      if (!result.success)
        throw new Error(result.error || "Failed to generate report");
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useReportData(filters: ReportFilters, enabled = false) {
  return useQuery({
    queryKey: ["report-data", filters],
    queryFn: async () => {
      const result = await generateReport(filters);
      if (!result.success)
        throw new Error(result.error || "Failed to generate report");
      return result.data!;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCustomersForEmail() {
  return useQuery({
    queryKey: ["customers-for-email"],
    queryFn: async () => {
      const result = await getCustomersForEmail();
      if (!result.success)
        throw new Error(result.error || "Failed to fetch customers for email");
      return result.data!;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSendReportEmail() {
  return useMutation({
    mutationFn: async ({
      recipientEmail,
      reportData,
      reportType,
      filters,
      customerSpecific,
      attachmentFormat, // Add this parameter
    }: {
      recipientEmail: string;
      reportData: ReportData;
      reportType: ReportType;
      filters: ReportFilters;
      customerSpecific: boolean;
      attachmentFormat: "pdf" | "excel"; // Add this to the type definition
    }) => {
      const result = await sendReportEmail({
        recipientEmail,
        reportData,
        reportType,
        filters,
        customerSpecific,
        attachmentFormat, // Pass it to the function
      });
      if (!result.success)
        throw new Error(result.error || "Failed to send report email");
      return result.data;
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async ({
      filters,
      format,
    }: {
      filters: ReportFilters;
      format: "pdf" | "excel";
    }) => {
      const result = await downloadReport(filters, format);
      if (!result.success) {
        throw new Error(result.error || `Failed to download ${format} report`);
      }
      return result.data;
    },
  });
}
