"use client";

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Truck, 
  Calendar, 
  FileText, 
  User, 
  Clock,
  ArrowLeft,
  Download,
  Edit,
  Upload,
  Eye,
  X,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/utils/dateUtils';
import ShipmentTimeline from '@/components/Shipments/ShipmentTimeline';
import DocumentCard from '@/components/Documents/DocumentCard';
import { useCreateDocument, useUpdateDocumentStatus } from '@/hooks/useDocuments';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { ShipmentStatus, DocumentType, DocumentStatus } from '@prisma/client';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ShipmentProgress from '@/components/trakit-dashboard/ShipmentProgress';
import { toast } from 'sonner';
import { useShipmentById, useUpdateShipmentStatus } from '@/hooks/useShipmentQueries2';
import FileUploader from '../docs/FileUploader';
import { DocumentUploadForm } from './DocumentUploadForm';

interface ShipmentDetailProps {
  id: string;
}

interface DocumentUpload {
  type: DocumentType;
  file: {
    url: string;
    name: string;
  };
}

export const ShipmentDetail: React.FC<ShipmentDetailProps> = ({ id }) => {
  // State variables
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'timeline'>('overview');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isViewDocumentDialogOpen, setIsViewDocumentDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState('');
  
  // Upload state
  const [uploadData, setUploadData] = useState<DocumentUpload>({
    type: DocumentType.COMMERCIAL_INVOICE,
    file: {
      url: '',
      name: ''
    }
  });

  // Fetch shipment data using React Query
  const { data: shipmentResponse, isLoading, error } = useShipmentById(id);
  const updateStatusMutation = useUpdateShipmentStatus();
  const createDocumentMutation = useCreateDocument();
  const updateDocumentStatusMutation = useUpdateDocumentStatus();

  // Extract shipment from response
  const shipment = shipmentResponse?.success ? shipmentResponse.data : null;

  // Set initial status when shipment data loads
  useEffect(() => {
    if (shipment?.status) {
      setSelectedStatus(shipment.status);
    }
  }, [shipment]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    
    updateStatusMutation.mutate({
      id,
      status: selectedStatus,
      notes: statusNotes
    }, {
      onSuccess: () => {
        setIsStatusDialogOpen(false);
        setStatusNotes('');
        toast.success("Shipment status updated successfully");
      }
    });
  };

  // Handle view document
  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setIsViewDocumentDialogOpen(true);
  };

  // Handle document verification
  const handleVerifyDocument = async (documentId: string) => {
    updateDocumentStatusMutation.mutate({
      id: documentId,
      status: DocumentStatus.VERIFIED,
    });
  };

  // Handle document rejection
  const handleRejectDocument = async (documentId: string) => {
    updateDocumentStatusMutation.mutate({
      id: documentId,
      status: DocumentStatus.REJECTED,
    });
  };

  // Handle upload document
  const handleUploadDocument = async () => {
    // if ( !uploadData.file.url) {
    //   toast.error("Please select a document type and file");
    //   return;
    // }

    createDocumentMutation.mutate({
      shipmentId: id,
      type: uploadData.type,
      file: uploadData.file,
      referenceNumber:null
    }, {
      onSuccess: () => {
        setIsUploadDialogOpen(false);
        setUploadData({
          type: DocumentType.COMMERCIAL_INVOICE,
          file: { url: '', name: '' }
        });
      }
    });
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3 py-8">
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-full mb-8" />
          <Skeleton className="h-40 w-full mb-8" />
          <Skeleton className="h-8 w-full mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-60 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div>
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If error, show error message
  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Shipment Not Found</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                {error ? 'An error occurred loading this shipment.' : 'The shipment you\'re looking for doesn\'t exist or has been removed from the system.'}
              </p>
              <Link 
                href="/dashboard/shipments-trakit" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shipments
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Extract timeline events
  const timelineEvents = shipment.timeline || [];
  
  // Extract checkpoints
  const checkpoints = shipment.checkpoints || [];

  // Document completion stats
  const requiredDocTypes = [
    DocumentType.COMMERCIAL_INVOICE,
    DocumentType.PACKING_LIST,
    shipment.type === 'SEA' ? DocumentType.BILL_OF_LADING : DocumentType.AIRWAY_BILL,
    DocumentType.IMPORT_LICENCE,
    DocumentType.CERTIFICATE_OF_CONFORMITY,
    DocumentType.TAX_EXEMPTION,
    DocumentType.CERTIFICATE_OF_ORIGIN
  ];
  
  const totalRequiredDocs = requiredDocTypes.length;
  const completedDocs = shipment.documents.filter(doc => doc.status === DocumentStatus.VERIFIED).length;
  const completionPercentage = Math.round((completedDocs / totalRequiredDocs) * 100);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              href="/dashboard/shipments-trakit" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Back to Shipments</span>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Shipment {shipment.reference}
              </h1>
              <div className="flex items-center gap-3">
                <StatusBadge status={shipment.status} />
                <span className="text-sm text-gray-500">
                  Created {formatDate(new Date(shipment.createdAt))}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2 text-xs">
                <Download className="w-4 h-4" />
                Export Details
              </Button>
              <Button 
                className="flex items-center gap-2 text-xs bg-[#0f2557]"
                onClick={() => setIsStatusDialogOpen(true)}
              >
                <Edit className="w-4 h-4" />
                Update Status
              </Button>
            </div>
          </div>
        </div>
        
        {/* Progress Card */}
        <Card className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipment Progress</h3>
            <ShipmentProgress shipment={shipment} />
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-xl font-bold text-blue-600">{completedDocs}</div>
                <div className="text-sm text-gray-600">Documents Verified</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-xl font-bold text-green-600">{completionPercentage}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-xl font-bold text-purple-600">
                  {shipment.arrivalDate ? 
                    Math.ceil((new Date(shipment.arrivalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
                    : 'TBD'
                  }
                </div>
                <div className="text-xs text-gray-600">Days to Arrival</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">
                  {timelineEvents.length}
                </div>
                <div className="text-sm text-gray-600">Timeline Events</div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 bg-white rounded-t-lg">
            <nav className="flex p-1">
              {[
                { key: 'overview', label: 'Overview', icon: Package },
                { key: 'documents', label: `Documents (${shipment.documents.length})`, icon: FileText },
                { key: 'timeline', label: 'Timeline', icon: Clock }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-xs font-medium rounded-lg transition-all ${
                    activeTab === key
                      ? 'border-b-[2px] border-blue-600 text-black shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipment Information */}
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Reference Number</h4>
                        <p className="text-sm font-semibold text-gray-900">{shipment.reference}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Client</h4>
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{shipment.client}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Route</h4>
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {shipment.origin} → {shipment.destination}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Created Date</h4>
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(new Date(shipment.createdAt))}
                          </span>
                        </div>
                      </div>
                      
                      {shipment.arrivalDate && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Expected Arrival</h4>
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(new Date(shipment.arrivalDate))}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Invoice Status</h4>
                        <div className="flex items-center">
                          <span className={`inline-flex h-3 w-3 rounded-full mr-2 ${
                            shipment.invoiceStatus === 'PENDING' ? 'bg-yellow-400' : 
                            shipment.invoiceStatus === 'PAID' ? 'bg-green-400' : 
                            'bg-red-400'
                          }`} />
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {shipment.invoiceStatus.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {(shipment.container || shipment.truck) && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {shipment.container && (
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                            <h4 className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-2">Container</h4>
                            <div className="flex items-center">
                              <Package className="w-5 h-5 text-blue-600 mr-2" />
                              <span className="text-sm font-semibold text-blue-900">{shipment.container}</span>
                            </div>
                          </div>
                        )}
                        
                        {shipment.truck && (
                          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                            <h4 className="text-xs font-medium text-green-700 uppercase tracking-wide mb-2">Assigned Truck</h4>
                            <div className="flex items-center">
                              <Truck className="w-5 h-5 text-green-600 mr-2" />
                              <span className="text-sm font-semibold text-green-900">{shipment.truck}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Recent Activity */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    {timelineEvents.length > 3 && (
                      <button
                        onClick={() => setActiveTab('timeline')}
                        className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
                      >
                        View All →
                      </button>
                    )}
                  </div>
                  <ShipmentTimeline 
                    events={timelineEvents.slice(0, 3)} 
                    checkpoints={checkpoints} 
                  />
                  
                  {timelineEvents.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400">No Recent Activity</h3>
                      <p className="text-sm text-gray-500 mt-2">Activity will appear here as the shipment progresses.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
            
            {/* Sidebar - Document Status */}
            <div>
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-gray-900">Required Documents</h3>
                    <div className="text-sm text-gray-500">
                      {completedDocs}/{totalRequiredDocs} Complete
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {requiredDocTypes.map((docType) => {
                      const document = shipment.documents.find(d => d.type === docType);
                      const status = document?.status || DocumentStatus.PENDING;
                      
                      const docTypeLabel = docType
                        .split('_')
                        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                        .join(' ');
                      
                      return (
                        <div key={docType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-gray-500 mr-3" />
                            <span className="text-xs font-medium text-gray-900">{docTypeLabel}</span>
                          </div>
                          <StatusBadge status={status} />
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => setActiveTab('documents')}
                    >
                      <FileText className="w-4 h-4" />
                      Manage Documents
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Document Management</h2>
                <p className="text-sm text-gray-600">
                  {completedDocs} of {totalRequiredDocs} required documents verified
                </p>
              </div>
              <Button 
                className="flex items-center gap-2 bg-[#0f2557] text-xs"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload className="w-4 h-4" />
                Upload New Document
              </Button>
            </div>
            
            <div className="grid gap-4">
              {shipment.documents.map((document) => (
                <DocumentCard 
                  key={document.id} 
                  document={{
                    id: document.id,
                    name: document.name,
                    type: document.type,
                    status: document.status,
                    uploadedAt: document.uploadedAt,
                    fileUrl: document.fileUrl,
                    notes: document.notes
                  }}
                  onViewClick={() => handleViewDocument(document)}
                  onVerifyClick={() => handleVerifyDocument(document.id)}
                  onRejectClick={() => handleRejectDocument(document.id)}
                />
              ))}
              
              {shipment.documents.length === 0 && (
                <Card>
                  <div className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Uploaded</h3>
                    <p className="text-gray-600 mb-6">Start by uploading the required documents for this shipment.</p>
                    <Button 
                      className="flex items-center gap-2"
                      onClick={() => setIsUploadDialogOpen(true)}
                    >
                      <Upload className="w-4 h-4" />
                      Upload First Document
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'timeline' && (
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Complete Timeline</h2>
              <ShipmentTimeline 
                events={timelineEvents} 
                checkpoints={checkpoints} 
              />
              
              {timelineEvents.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Timeline Events</h3>
                  <p className="text-gray-600">Timeline events will appear here as the shipment progresses.</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Shipment Status</DialogTitle>
            <DialogDescription>
              Change the status of shipment {shipment.reference}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select 
                value={selectedStatus} 
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ShipmentStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </label>
              <Textarea
                id="notes"
                placeholder="Add notes about this status change"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="bg-[#0f2557]"
              disabled={updateStatusMutation.isPending}
              onClick={handleStatusUpdate}
            >
              {updateStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={isViewDocumentDialogOpen} onOpenChange={setIsViewDocumentDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Document Type</p>
                <p className="text-sm text-gray-600">{selectedDocument?.type?.replace(/_/g, ' ')}</p>
              </div>
              <StatusBadge status={selectedDocument?.status} />
            </div>
            
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative">
              {selectedDocument?.fileUrl ? (
                <iframe
                  src={selectedDocument.fileUrl}
                  className="w-full h-full rounded-lg"
                  title={selectedDocument.name}
                />
              ) : (
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Document preview not available</p>
                </div>
              )}
            </div>
            
            {selectedDocument?.notes && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Notes:</span> {selectedDocument.notes}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog with Scroll View */}
     <DocumentUploadForm
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onSubmit={handleUploadDocument}
        isSubmitting={createDocumentMutation.isPending}
        shipmentReference={shipment?.reference}
        isReference={false}
      />
    </div>
  );
};

export default ShipmentDetail;