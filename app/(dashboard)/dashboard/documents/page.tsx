"use client";

import React, { useState } from 'react';
import { FileText, Filter, Search, UploadCloud, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import DocumentCard from '@/components/Documents/DocumentCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateDocument, useDocuments, useUpdateDocumentStatus } from '@/hooks/useDocuments';
import { DocumentStatus, DocumentType } from '@prisma/client';
import { DocumentFilter } from '@/actions/documents';
import DocumentSkeletons from '@/components/dashboard/DocumentSkeletons';
import { Document } from '@prisma/client';
import { DocumentWithShipment } from '@/types/types';
import { DocumentUploadForm } from '@/components/Shipments/DocumentUploadForm';
import { toast } from 'sonner';

// Document type options
const typeOptions: {value: DocumentType | 'all', label: string}[] = [
  { value: 'all', label: 'All Document Types' },
  { value: DocumentType.COMMERCIAL_INVOICE, label: 'Commercial Invoice' },
  { value: DocumentType.PACKING_LIST, label: 'Packing List' },
  { value: DocumentType.BILL_OF_LADING, label: 'Bill of Lading' },
  { value: DocumentType.AIRWAY_BILL, label: 'Airway Bill' },
  { value: DocumentType.IMPORT_LICENCE, label: 'Import Licence' },
  { value: DocumentType.CERTIFICATE_OF_CONFORMITY, label: 'Certificate of Conformity' },
  { value: DocumentType.TAX_EXEMPTION, label: 'Tax Exemption' },
  { value: DocumentType.CERTIFICATE_OF_ORIGIN, label: 'Certificate of Origin' },
  { value: DocumentType.CMR_WAYBILL, label: 'CMR Waybill' },
];

export default function DocumentsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<DocumentStatus | 'all'>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  // Create filter object for React Query
  const currentFilters: DocumentFilter = {
    status: activeTab !== 'all' ? activeTab : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    search: searchQuery.trim() || undefined,
  };
  
  // Use React Query to fetch documents
const { data: documents, isLoading, isError } = useDocuments(currentFilters) as {
  data: DocumentWithShipment[] | undefined;
  isLoading: boolean;
  isError: boolean;
};
  
  // Use mutation hook for document status updates
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateDocumentStatus();
  
  // Handle document status update
  const handleVerifyDocument = (id: string) => {
    updateStatus({ id, status: DocumentStatus.VERIFIED });
  };
  
  const handleRejectDocument = (id: string) => {
    updateStatus({ id, status: DocumentStatus.REJECTED});
  };
  
  // Handle document view (file preview)
  const handleViewDocument = (id: string) => {
    const document = documents?.find(doc => doc.id === id);
    if (document?.fileUrl) {
      window.open(document.fileUrl, '_blank');
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as DocumentStatus | 'all');
    // Reset status filter when changing tabs since they're redundant
    setStatusFilter('all');
  };
  
  // Reset all filters function
  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setActiveTab('all');
    toast.success("Filters reset successfully");
  };
  
  // Count documents by status for badges
  const getPendingCount = () => 
    documents?.filter(doc => doc.status === DocumentStatus.PENDING).length || 0;
    
  const getVerifiedCount = () => 
    documents?.filter(doc => doc.status === DocumentStatus.VERIFIED).length || 0;
    
  const getRejectedCount = () => 
    documents?.filter(doc => doc.status === DocumentStatus.REJECTED).length || 0;

  // Get filtered documents based on current tab and filters
  const getFilteredDocuments = () => {
    if (!documents) return [];
    
    return documents.filter(document => {
      const matchesSearch = !searchQuery || 
        document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (document.shipment?.reference && 
         document.shipment.reference.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesType = typeFilter === 'all' || document.type === typeFilter;
      
      // Tab selection already filters by status through the API query
      
      return matchesSearch && matchesType;
    });
  };
  
  const filteredDocuments = getFilteredDocuments();
  const pendingDocuments = documents?.filter(doc => doc.status === DocumentStatus.PENDING) || [];
  
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Status filter options with count
  const statusOptions = [
    { value: 'all', label: 'All Statuses', count: documents?.length || 0 },
    { value: DocumentStatus.PENDING, label: 'Pending', count: getPendingCount() },
    { value: DocumentStatus.VERIFIED, label: 'Verified', count: getVerifiedCount() },
    { value: DocumentStatus.REJECTED, label: 'Rejected', count: getRejectedCount() },
  ];
  const createDocumentMutation = useCreateDocument();
const handleUploadDocument = async (data: {
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
      }
    );
  };
  
  // Check if any filters are active to determine whether to show reset button
  const filtersActive = searchQuery !== '' || typeFilter !== 'all' || statusFilter !== 'all' || activeTab !== 'all';
  
  return (
    <div className='p-4'>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <Button onClick={() => setIsUploadDialogOpen(true)} className='bg-[#0f2557] flex items-center gap-2 text-xs'>
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
              <h3 className="font-medium text-yellow-800">Documents Pending Verification</h3>
              <p className="text-yellow-700 text-sm mt-1">
                You have {pendingDocuments.length} document{pendingDocuments.length !== 1 ? 's' : ''} that need verification.
              </p>
            </div>
            <Button 
              size="sm" 
              className="ml-auto bg-[#0f2557]"
              onClick={() => handleTabChange(DocumentStatus.PENDING)}
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
            <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
              {documents?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value={DocumentStatus.PENDING} className="flex items-center justify-center">
            Pending
            <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">
              {getPendingCount()}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value={DocumentStatus.VERIFIED} className="flex items-center justify-center">
            Verified
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
              {getVerifiedCount()}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value={DocumentStatus.REJECTED} className="flex items-center justify-center">
            Rejected
            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
              {getRejectedCount()}
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  onChange={(e) => setTypeFilter(e.target.value as DocumentType | 'all')}
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="w-44">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | 'all')}
                  disabled={activeTab !== 'all'} 
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {filtersActive && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="flex items-center gap-1 h-10"
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
            <h3 className="text-lg font-medium text-gray-900 mb-1">Failed to load documents</h3>
            <p className="text-gray-500">
              There was an error loading the documents. Please try again later.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-[#0f2557]"
            >
              Refresh Page
            </Button>
          </div>
        </Card>
      )}
      
      {/* Results count */}
      {!isLoading && !isError && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
      
      {/* Documents list */}
      {!isLoading && !isError && filteredDocuments.length === 0 && (
        <Card className="py-12">
          <div className="text-center flex items-center flex-col justify-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
            <p className="text-gray-500">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || activeTab !== 'all'
                ? "Try adjusting your filters to see more results" 
                : "Upload your first document to get started"}
            </p>
            
            <Button onClick={() => setIsUploadDialogOpen(true)} className='bg-[#0f2557] flex items-center justify-center gap-2 text-xs mt-8'>
            <UploadCloud size={16} />
            Upload Document
          </Button>
          </div>
        </Card>
      )}
      
      {!isLoading && !isError && filteredDocuments.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map(document => (
            <DocumentCard 
              key={document.id} 
              document={document}
              onViewClick={() => handleViewDocument(document.id)}
              onVerifyClick={() => handleVerifyDocument(document.id)}
              onRejectClick={() => handleRejectDocument(document.id)}
            //   isUpdating={isUpdating}
            />
          ))}
        </div>
      )}

      {/* Upload Document Dialog */}
      <DocumentUploadForm
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onSubmit={handleUploadDocument}
        isSubmitting={createDocumentMutation.isPending}
        isReference={true} 
      />
    </div>
  );
}