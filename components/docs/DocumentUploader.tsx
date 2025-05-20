"use client";

import React, { useState } from "react";
import { FileText, X, Info, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploader from "./FileUploader";
import DocumentTypeSelector, {
  DocumentType,
  documentLabels,
  documentDescriptions,
} from "./DocumentTypeSelector";
import { Badge } from "@/components/ui/badge";

export interface DocumentUpload {
  type: DocumentType;
  file: {
    url: string;
    name: string;
  };
}

interface DocumentUploaderProps {
  documents: DocumentUpload[];
  onChange: (documents: DocumentUpload[]) => void;
  requiredTypes?: DocumentType[];
  maxDocuments?: number;
}

const DocumentUploader = ({
  documents,
  onChange,
  requiredTypes,
  maxDocuments = 10,
}: DocumentUploaderProps) => {
  const [newDocType, setNewDocType] = useState<DocumentType | "">("");

  // Filtered list of document types that haven't been uploaded yet
  const availableTypes = requiredTypes?.filter(
    (type) => !documents.some((doc) => doc.type === type)
  );

  const handleAddDocument = () => {
    if (newDocType && documents.length < maxDocuments) {
      // Initialize with empty file data
      onChange([
        ...documents,
        { type: newDocType, file: { url: "", name: "" } },
      ]);
      setNewDocType(""); // Reset selection
    }
  };

  const handleRemoveDocument = (index: number) => {
    const newDocuments = [...documents];
    newDocuments.splice(index, 1);
    onChange(newDocuments);
  };

  const handleUpdateDocument = (index: number, url: string, name: string) => {
    const newDocuments = [...documents];
    newDocuments[index] = {
      ...newDocuments[index],
      file: { url, name },
    };
    onChange(newDocuments);
  };

  return (
    <div className="space-y-6">
      {/* Document cards */}
      <div className="space-y-4">
        {documents.map((doc, index) => {
          const isComplete = !!doc.file.url;
          
          return (
            <Card
              key={`${doc.type}-${index}`}
              className={`p-4 border transition-colors ${
                isComplete ? "border-green-200 bg-green-50" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <FileText
                    className={`h-5 w-5 mr-2 ${
                      isComplete ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {documentLabels[doc.type]}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {documentDescriptions[doc.type]}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDocument(index)}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4">
                <FileUploader
                  endpoint="fileUploads"
                  value={doc.file.url}
                  onChange={(url, name) => handleUpdateDocument(index, url, name)}
                  isUploaded={isComplete}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Required documents checklist */}
      {requiredTypes && requiredTypes.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start mb-2">
            <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <p className="text-sm text-blue-700 font-medium">Required Documents Checklist</p>
          </div>
          <div className="space-y-2 ml-7">
            {requiredTypes.map((type) => {
              const uploaded = documents.some(
                (doc) => doc.type === type && doc.file.url
              );
              
              return (
                <div
                  key={type}
                  className="flex items-center text-sm"
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                    uploaded ? "bg-green-100" : "border border-gray-300"
                  }`}>
                    {uploaded && <Check className="h-3 w-3 text-green-500" />}
                  </div>
                  <span className={uploaded ? "text-green-700" : "text-gray-600"}>
                    {documentLabels[type]}
                  </span>
                  {uploaded && (
                    <Badge className="ml-2 text-xs bg-green-100 text-green-800 border-green-200">
                      Uploaded
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add new document */}
      {documents.length < maxDocuments && (
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <DocumentTypeSelector
              value={newDocType}
              onChange={setNewDocType}
              availableTypes={availableTypes}
            />
          </div>
          <Button
            type="button"
            onClick={handleAddDocument}
            disabled={!newDocType}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add Document
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;