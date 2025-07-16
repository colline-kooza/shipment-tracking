"use client";

import type React from "react";
import { useState, useMemo, useCallback } from "react";
import {
  FileText,
  Search,
  UploadCloud,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import DocumentCard from "@/components/Documents/DocumentCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateDocument,
  useDocuments,
  useUpdateDocumentStatus,
} from "@/hooks/useDocuments";
import { DocumentStatus, DocumentType } from "@prisma/client";
import type { DocumentFilter } from "@/actions/documents";
import DocumentSkeletons from "@/components/dashboard/DocumentSkeletons";
import { DocumentUploadForm } from "@/components/Shipments/DocumentUploadForm";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { useDebounce2 } from "@/hooks/useDebounce2";
import { Document } from "@/types/types";

// Document type options - moved outside component to prevent recreation
const TYPE_OPTIONS: { value: DocumentType | "all"; label: string }[] = [
  { value: "all", label: "All Document Types" },
  { value: DocumentType.COMMERCIAL_INVOICE, label: "Commercial Invoice" },
  { value: DocumentType.PACKING_LIST, label: "Packing List" },
  { value: DocumentType.BILL_OF_LADING, label: "Bill of Lading" },
  { value: DocumentType.AIRWAY_BILL, label: "Airway Bill" },
  { value: DocumentType.IMPORT_LICENCE, label: "Import Licence" },
  {
    value: DocumentType.CERTIFICATE_OF_CONFORMITY,
    label: "Certificate of Conformity",
  },
  { value: DocumentType.TAX_EXEMPTION, label: "Tax Exemption" },
  { value: DocumentType.CERTIFICATE_OF_ORIGIN, label: "Certificate of Origin" },
  { value: DocumentType.CMR_WAYBILL, label: "CMR Waybill" },

  { value: DocumentType.LETTER_OF_AUTHORIZATION, label: "Letter of Authorization" },
] as const;

// Status options factory function
const createStatusOptions = (counts: {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
}) => [
  { value: "all" as const, label: "All Statuses", count: counts.total },
  { value: DocumentStatus.PENDING, label: "Pending", count: counts.pending },
  { value: DocumentStatus.VERIFIED, label: "Verified", count: counts.verified },
  { value: DocumentStatus.REJECTED, label: "Rejected", count: counts.rejected },
];

export default function DocumentsList() {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "all">("all");
  const [activeTab, setActiveTab] = useState<DocumentStatus | "all">("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce2(searchQuery, 300);

  // Create stable filter object using useMemo with proper dependencies
  const documentFilters = useMemo((): DocumentFilter => {
    const filters: DocumentFilter = {};

    if (activeTab !== "all") {
      filters.status = activeTab;
    }

    if (typeFilter !== "all") {
      filters.type = typeFilter;
    }

    if (debouncedSearchQuery.trim()) {
      filters.search = debouncedSearchQuery.trim();
    }

    return filters;
  }, [activeTab, typeFilter, debouncedSearchQuery]);

  // Fetch documents with stable filters
  const {
    data: documents,
    isLoading,
    isError,
    error,
    refetch,
  } = useDocuments(documentFilters);

  // Mutations
  const updateStatusMutation = useUpdateDocumentStatus();
  const createDocumentMutation = useCreateDocument();

  // Memoize document counts to prevent recalculation
  const documentCounts = useMemo(() => {
    if (!documents) {
      return { pending: 0, verified: 0, rejected: 0, total: 0 };
    }

    return documents.reduce(
      (acc:any, doc: Document) => {
        acc.total++;
        switch (doc.status) {
          case DocumentStatus.PENDING:
            acc.pending++;
            break;
          case DocumentStatus.VERIFIED:
            acc.verified++;
            break;
          case DocumentStatus.REJECTED:
            acc.rejected++;
            break;
        }
        return acc;
      },
      { pending: 0, verified: 0, rejected: 0, total: 0 }
    );
  }, [documents]);

  // Memoize status options
  const statusOptions = useMemo(
    () => createStatusOptions(documentCounts),
    [documentCounts]
  );

  // Memoize pending documents
  const pendingDocuments = useMemo(
    () =>
      documents?.filter(
        (doc: Document) => doc.status === DocumentStatus.PENDING
      ) || [],
    [documents]
  );

  // Memoize filter active state
  const hasActiveFilters = useMemo(
    () => searchQuery !== "" || typeFilter !== "all" || activeTab !== "all",
    [searchQuery, typeFilter, activeTab]
  );

  // Event handlers with useCallback to prevent recreation
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleTypeFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setTypeFilter(e.target.value as DocumentType | "all");
    },
    []
  );

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as DocumentStatus | "all");
  }, []);

  const handleVerifyDocument = useCallback(
    (id: string) => {
      updateStatusMutation.mutate({
        id,
        status: DocumentStatus.VERIFIED,
      });
    },
    [updateStatusMutation]
  );

  const handleRejectDocument = useCallback(
    (id: string) => {
      updateStatusMutation.mutate({
        id,
        status: DocumentStatus.REJECTED,
      });
    },
    [updateStatusMutation]
  );

  const handleViewDocument = useCallback(
    (id: string) => {
      const document = documents?.find((doc: Document) => doc.id === id);
      if (document?.fileUrl) {
        window.open(document.fileUrl, "_blank");
      }
    },
    [documents]
  );

  const handleUploadDocument = useCallback(
    async (data: {
      type: DocumentType;
      file: { url: string; name: string };
      referenceNumber?: string | null;
    }) => {
      createDocumentMutation.mutate(
        {
          shipmentId: null,
          type: data.type,
          file: data.file,
          referenceNumber: data.referenceNumber,
        },
        {
          onSuccess: () => {
            setIsUploadDialogOpen(false);
            toast.success("Document uploaded successfully");
          },
          onError: (error) => {
            toast.error("Failed to upload document", {
              description: error.message,
            });
          },
        }
      );
    },
    [createDocumentMutation]
  );

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setTypeFilter("all");
    setActiveTab("all");
    toast.success("Filters reset successfully");
  }, []);

  const handleViewPending = useCallback(() => {
    setActiveTab(DocumentStatus.PENDING);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleUploadClick = useCallback(() => {
    setIsUploadDialogOpen(true);
  }, []);

  const handleUploadDialogClose = useCallback((open: boolean) => {
    setIsUploadDialogOpen(open);
  }, []);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <Button
          onClick={handleUploadClick}
          className="bg-[#0f2557] flex items-center gap-2 text-xs"
        >
          <UploadCloud size={16} />
          Upload Document
        </Button>
      </div>

      {/* Pending Documents Alert */}
      {pendingDocuments.length > 0 && (
        <Card className="mb-6 bg-yellow-50 border border-yellow-100 p-3">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="font-medium text-yellow-800">
                Documents Pending Verification
              </h3>
              <p className="text-yellow-700 text-sm mt-1">
                You have {pendingDocuments.length} document
                {pendingDocuments.length !== 1 ? "s" : ""} that need
                verification.
              </p>
            </div>
            <Button
              size="sm"
              className="ml-auto bg-[#0f2557]"
              onClick={handleViewPending}
            >
              View Pending
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="all" className="flex items-center justify-center">
            All
            <Badge
              variant="secondary"
              className="ml-2 bg-gray-100 text-gray-700"
            >
              {documentCounts.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value={DocumentStatus.PENDING}
            className="flex items-center justify-center"
          >
            Pending
            <Badge
              variant="secondary"
              className="ml-2 bg-yellow-100 text-yellow-700"
            >
              {documentCounts.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value={DocumentStatus.VERIFIED}
            className="flex items-center justify-center"
          >
            Verified
            <Badge
              variant="secondary"
              className="ml-2 bg-green-100 text-green-700"
            >
              {documentCounts.verified}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value={DocumentStatus.REJECTED}
            className="flex items-center justify-center"
          >
            Rejected
            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
              {documentCounts.rejected}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card className="mb-6 shadow-sm">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by document name or shipment reference..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex gap-2">
            <div className="w-52">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex items-center gap-1 h-10 bg-transparent"
              >
                <RefreshCw size={14} />
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Loading state */}
      {isLoading && <DocumentSkeletons count={3} />}

      {/* Error state */}
      {isError && (
        <Card className="py-12">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Failed to load documents
            </h3>
            <p className="text-gray-500 mb-4">
              {error?.message ||
                "There was an error loading the documents. Please try again."}
            </p>
            <Button onClick={handleRefresh} className="bg-[#0f2557]">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Results count */}
      {!isLoading && !isError && documents && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {documents.length} document
            {documents.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && documents?.length === 0 && (
        <Card className="py-12">
          <div className="text-center flex items-center flex-col justify-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No documents found
            </h3>
            <p className="text-gray-500">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results"
                : "Upload your first document to get started"}
            </p>

            <Button
              onClick={handleUploadClick}
              className="bg-[#0f2557] flex items-center justify-center gap-2 text-xs mt-8"
            >
              <UploadCloud size={16} />
              Upload Document
            </Button>
          </div>
        </Card>
      )}

      {/* Documents list */}
      {!isLoading && !isError && documents && documents.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((document: Document) => (
            <DocumentCard
              key={document.id}
              document={{
                ...document,
                notes: document.notes ?? null, // ensures `notes` always exists
              }}
              onViewClick={() => handleViewDocument(document.id)}
              onVerifyClick={() => handleVerifyDocument(document.id)}
              onRejectClick={() => handleRejectDocument(document.id)}
            />
          ))}
        </div>
      )}

      {/* Upload Document Dialog */}
      <DocumentUploadForm
        isOpen={isUploadDialogOpen}
        onOpenChange={handleUploadDialogClose}
        onSubmit={handleUploadDocument}
        isSubmitting={createDocumentMutation.isPending}
        isReference={true}
      />
    </div>
  );
}
