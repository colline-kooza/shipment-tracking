"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, X } from 'lucide-react';
import FileUploader from '../docs/FileUploader';
import { Document, DocumentStatus, DocumentType } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import StatusBadge from '@/components/status-badge';


interface DocumentUploadFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DocumentUpload) => void;
  isSubmitting: boolean;
  shipmentReference?: string;
  isReference?: boolean;
  documents?: Document[];
}

interface DocumentUpload {
  type: DocumentType;
  file: {
    url: string;
    name: string;
  };
  referenceNumber?: string; 
}

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
  shipmentReference,
  isReference = false,
  documents = [], 
}) => {
  const [uploadData, setUploadData] = useState<DocumentUpload>({
    type: DocumentType.COMMERCIAL_INVOICE,
    file: { url: '', name: '' },
    referenceNumber: shipmentReference || '',
  });

  const [fileUploaded, setFileUploaded] = useState(false);
  
  const getAvailableDocumentTypes = () => {
    if (isReference) {
      return Object.values(DocumentType);
    }
    
    const uploadedTypes = documents.map(doc => doc.type);
    
    // Filter out already uploaded document types
    return Object.values(DocumentType).filter(type => !uploadedTypes.includes(type));
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog closes
      setUploadData({
        type: DocumentType.COMMERCIAL_INVOICE,
        file: { url: '', name: '' },
        referenceNumber: shipmentReference || '',
      });
      setFileUploaded(false);
    } else {
      const availableTypes = getAvailableDocumentTypes();
      if (availableTypes.length > 0) {
        setUploadData(prev => ({
          ...prev,
          type: availableTypes[0]
        }));
      }
    }
  }, [isOpen, shipmentReference, documents]);

  const handleSubmit = () => {
    if (!uploadData.file.url) {
      toast.error("Please select a document type and file");
      return;
    }
    
    // if (isReference && !uploadData.referenceNumber) {
    //   toast.error("Please enter a reference number");
    //   return;
    // }
    
    onSubmit(uploadData);
  };

  // Handle file upload change
  const handleFileChange = (url: string, name: string) => {
    setUploadData((prev) => ({
      ...prev,
      file: { url, name },
    }));
    
    if (url) {
      setFileUploaded(true);
      console.log("File uploaded successfully:", url, name);
    } else {
      setFileUploaded(false);
    }
  };

  // Available document types after filtering
  const availableDocumentTypes = getAvailableDocumentTypes();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogDescription>
            Upload a new document {shipmentReference ? `for shipment ${shipmentReference}` : ''}
          </DialogDescription>
        </DialogHeader>
        
        {/* Show already uploaded documents if isReference is false and documents exist */}
        {!isReference && documents.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Existing Documents</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>{doc.type.replace(/_/g, ' ')}</span>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          {isReference && (
            <div className="grid gap-2">
              <label htmlFor="reference-number" className="text-sm font-medium">
                Reference Number {isReference ? '(required)' : '(optional)'}
              </label>
              <Input
                id="reference-number"
                placeholder="Enter shipment reference number"
                value={uploadData.referenceNumber || ''}
                onChange={(e) =>
                  setUploadData((prev) => ({ ...prev, referenceNumber: e.target.value }))
                }
              />
            </div>
          )}
          <div className="grid gap-2">
            <label htmlFor="document-type" className="text-sm font-medium">
              Document Type
            </label>
            {availableDocumentTypes.length > 0 ? (
              <Select
                value={uploadData.type}
                onValueChange={(value) =>
                  setUploadData((prev) => ({ ...prev, type: value as DocumentType }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {availableDocumentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                All document types have been uploaded. You can view them in the documents tab.
              </div>
            )}
          </div>
          
          {availableDocumentTypes.length > 0 && (
            <div className="grid gap-2">
              <label className="text-sm font-medium">File</label>
              <FileUploader
                endpoint="fileUploads"
                value={uploadData.file.url}
                onChange={handleFileChange}
                isUploaded={fileUploaded}
                label="Upload Document"
                description="Drag and drop your document here or click to browse"
              />
              {fileUploaded && (
                <p className="text-sm text-green-600">File uploaded successfully: {uploadData.file.name}</p>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="sticky bottom-0 bg-white pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {availableDocumentTypes.length > 0 && (
            <Button
              className="bg-[#0f2557]"
              onClick={handleSubmit}
              disabled={isSubmitting || !uploadData.type || !fileUploaded}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};