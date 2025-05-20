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
import { Loader2 } from 'lucide-react';
import FileUploader from '../docs/FileUploader';
import { DocumentType } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface DocumentUploadFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DocumentUpload) => void;
  isSubmitting: boolean;
  shipmentReference?: string;
  isReference?: boolean; 
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
}) => {
  const [uploadData, setUploadData] = useState<DocumentUpload>({
    type: DocumentType.COMMERCIAL_INVOICE,
    file: { url: '', name: '' },
    referenceNumber: shipmentReference || '',
  });

  const [fileUploaded, setFileUploaded] = useState(false);

  // Reset form when the dialog opens or closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog closes
      setUploadData({
        type: DocumentType.COMMERCIAL_INVOICE,
        file: { url: '', name: '' },
        referenceNumber: shipmentReference || '',
      });
      setFileUploaded(false);
    }
  }, [isOpen, shipmentReference]);

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
  const handleFileChange = (url:string, name:string) => {
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

  // Debug information
  console.log("Current form state:", {
    type: uploadData.type,
    fileUrl: uploadData.file.url,
    fileName: uploadData.file.name,
    fileUploaded,
    buttonDisabled: isSubmitting || !uploadData.type || !fileUploaded
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogDescription>
            Upload a new document {shipmentReference ? `for shipment ${shipmentReference}` : ''}
          </DialogDescription>
        </DialogHeader>
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
                {Object.values(DocumentType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
        </div>
        <DialogFooter className="sticky bottom-0 bg-white pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};