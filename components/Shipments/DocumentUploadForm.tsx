"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, FileText } from "lucide-react"
import FileUploader from "../docs/FileUploader"
import { type Document, DocumentType } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import StatusBadge from "@/components/status-badge"

// Define proper types
interface DocumentUpload {
  type: DocumentType
  file: {
    url: string
    name: string
  }
  referenceNumber?: string | null
}

interface DocumentUploadFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: DocumentUpload) => void
  isSubmitting: boolean
  shipmentReference?: string
  isReference?: boolean
  documents?: Document[]
}

// Document type labels - moved outside component to prevent recreation
const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.COMMERCIAL_INVOICE]: "Commercial Invoice",
  [DocumentType.PACKING_LIST]: "Packing List",
  [DocumentType.BILL_OF_LADING]: "Bill of Lading",
  [DocumentType.AIRWAY_BILL]: "Airway Bill",
  [DocumentType.IMPORT_LICENCE]: "Import Licence",
  [DocumentType.CERTIFICATE_OF_CONFORMITY]: "Certificate of Conformity",
  [DocumentType.TAX_EXEMPTION]: "Tax Exemption",
  [DocumentType.CERTIFICATE_OF_ORIGIN]: "Certificate of Origin",
  [DocumentType.CMR_WAYBILL]: "CMR Waybill",
  [DocumentType.LETTER_OF_AUTHORIZATION]: "Letter Of Authorization",
}

// All document types - moved outside to prevent recreation
const ALL_DOCUMENT_TYPES = Object.values(DocumentType)

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
  shipmentReference,
  isReference = false,
  documents = [],
}) => {
  // State management
  const [uploadData, setUploadData] = useState<DocumentUpload>({
    type: DocumentType.COMMERCIAL_INVOICE,
    file: { url: "", name: "" },
    referenceNumber: shipmentReference || "",
  })
  const [fileUploaded, setFileUploaded] = useState(false)

  // Memoize available document types to prevent recalculation
  const availableDocumentTypes = useMemo(() => {
    if (isReference) {
      return ALL_DOCUMENT_TYPES
    }

    // Get uploaded document types with proper typing
    const uploadedTypes = documents.map((doc: Document) => doc.type)

    // Filter out already uploaded document types
    return ALL_DOCUMENT_TYPES.filter((type: DocumentType) => !uploadedTypes.includes(type))
  }, [isReference, documents])

  // Memoize the first available type to prevent unnecessary updates
  const firstAvailableType = useMemo(() => {
    return availableDocumentTypes.length > 0 ? availableDocumentTypes[0] : DocumentType.COMMERCIAL_INVOICE
  }, [availableDocumentTypes])

  // Reset form when dialog opens/closes - with stable dependencies
  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog closes
      setUploadData({
        type: DocumentType.COMMERCIAL_INVOICE,
        file: { url: "", name: "" },
        referenceNumber: shipmentReference || "",
      })
      setFileUploaded(false)
    } else {
      // Set initial type when dialog opens
      setUploadData((prev) => ({
        ...prev,
        type: firstAvailableType,
        referenceNumber: shipmentReference || "",
      }))
    }
  }, [isOpen, shipmentReference, firstAvailableType])

  // Handle form submission with useCallback to prevent recreation
  const handleSubmit = useCallback(() => {
    if (!uploadData.file.url) {
      toast.error("Please select a document type and file")
      return
    }

    // Validate reference number if required
    if (isReference && !uploadData.referenceNumber?.trim()) {
      toast.error("Please enter a reference number")
      return
    }

    onSubmit(uploadData)
  }, [uploadData, isReference, onSubmit])

  // Handle file upload change with useCallback
  const handleFileChange = useCallback((url: string, name: string) => {
    setUploadData((prev) => ({
      ...prev,
      file: { url, name },
    }))

    setFileUploaded(!!url)

    if (url) {
      console.log("File uploaded successfully:", url, name)
    }
  }, [])

  // Handle document type change with useCallback
  const handleDocumentTypeChange = useCallback((value: string) => {
    setUploadData((prev) => ({
      ...prev,
      type: value as DocumentType,
    }))
  }, [])

  // Handle reference number change with useCallback
  const handleReferenceNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadData((prev) => ({
      ...prev,
      referenceNumber: e.target.value,
    }))
  }, [])

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const hasFile = !!uploadData.file.url
    const hasType = !!uploadData.type
    const hasReferenceIfRequired = !isReference || !!uploadData.referenceNumber?.trim()

    return hasFile && hasType && hasReferenceIfRequired
  }, [uploadData, isReference])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogDescription>
            Upload a new document {shipmentReference ? `for shipment ${shipmentReference}` : ""}
          </DialogDescription>
        </DialogHeader>

        {/* Show already uploaded documents if isReference is false and documents exist */}
        {!isReference && documents.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Existing Documents</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
              {documents.map((doc: Document) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>{DOCUMENT_TYPE_LABELS[doc.type]}</span>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 py-4">
          {/* Reference Number Input */}
          {isReference && (
            <div className="grid gap-2">
              <label htmlFor="reference-number" className="text-sm font-medium">
                Reference Number (required)
              </label>
              <Input
                id="reference-number"
                placeholder="Enter shipment reference number"
                value={uploadData.referenceNumber || ""}
                onChange={handleReferenceNumberChange}
              />
            </div>
          )}

          {/* Document Type Selection */}
          <div className="grid gap-2">
            <label htmlFor="document-type" className="text-sm font-medium">
              Document Type
            </label>
            {availableDocumentTypes.length > 0 ? (
              <Select value={uploadData.type} onValueChange={handleDocumentTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {availableDocumentTypes.map((type: DocumentType) => (
                    <SelectItem key={type} value={type}>
                      {DOCUMENT_TYPE_LABELS[type]}
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

          {/* File Upload */}
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
            <Button className="bg-[#0f2557]" onClick={handleSubmit} disabled={isSubmitting || !isFormValid}>
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
  )
}
