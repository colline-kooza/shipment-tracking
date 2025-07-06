"use client";

import React from "react";
import { Check, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DocumentType =
  | "COMMERCIAL_INVOICE"
  | "PACKING_LIST"
  | "BILL_OF_LADING"
  | "AIRWAY_BILL"
  | "IMPORT_LICENCE"
  | "CERTIFICATE_OF_CONFORMITY"
  | "TAX_EXEMPTION"
  | "CERTIFICATE_OF_ORIGIN"
  | "CMR_WAYBILL";

interface DocumentTypeSelectorProps {
  value: DocumentType | "";
  onChange: (value: DocumentType) => void;
  availableTypes?: DocumentType[];
  label?: string;
}

export const documentLabels: Record<DocumentType, string> = {
  COMMERCIAL_INVOICE: "Commercial Invoice",
  PACKING_LIST: "Packing List",
  BILL_OF_LADING: "Bill of Lading",
  AIRWAY_BILL: "Airway Bill",
  IMPORT_LICENCE: "Import License",
  CERTIFICATE_OF_CONFORMITY: "Certificate of Conformity",
  TAX_EXEMPTION: "Tax Exemption",
  CERTIFICATE_OF_ORIGIN: "Certificate of Origin",
  CMR_WAYBILL: "CMR Waybill",
};

export const documentDescriptions: Record<DocumentType, string> = {
  COMMERCIAL_INVOICE: "Bill for the goods from the seller to the buyer",
  PACKING_LIST: "Detailed list of items in the shipment",
  BILL_OF_LADING: "Receipt of goods and contract of carriage",
  AIRWAY_BILL: "Air transport document for international shipments",
  IMPORT_LICENCE: "Authorization to import restricted goods",
  CERTIFICATE_OF_CONFORMITY: "Confirms products meet quality standards",
  TAX_EXEMPTION: "Documentation for tax-exempt status",
  CERTIFICATE_OF_ORIGIN: "Document certifying where goods were manufactured",
  CMR_WAYBILL: "Contract for international road transport",
};

export const getRequiredDocumentTypes = (
  shipmentType: "SEA" | "AIR" | "ROAD"
): DocumentType[] => {
  const baseDocuments: DocumentType[] = [
    "COMMERCIAL_INVOICE",
    "PACKING_LIST",
    "IMPORT_LICENCE",
    "CERTIFICATE_OF_CONFORMITY",
    "TAX_EXEMPTION",
    "CERTIFICATE_OF_ORIGIN",
  ];

  switch (shipmentType) {
    case "SEA":
      return [...baseDocuments, "BILL_OF_LADING"];
    case "AIR":
      return [...baseDocuments, "AIRWAY_BILL"];
    case "ROAD":
      return [...baseDocuments, "CMR_WAYBILL"];
    default:
      return baseDocuments;
  }
};

const DocumentTypeSelector = ({
  value,
  onChange,
  availableTypes,
  label = "Document Type",
}: DocumentTypeSelectorProps) => {
  // Use all document types if none specified
  const types = availableTypes || Object.keys(documentLabels) as DocumentType[];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as DocumentType)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a document type" />
        </SelectTrigger>
        <SelectContent>
          {types.map((type) => (
            <SelectItem key={type} value={type}>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>{documentLabels[type]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DocumentTypeSelector;