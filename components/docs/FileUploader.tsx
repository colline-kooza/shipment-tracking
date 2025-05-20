"use client";

import React, { useState } from "react";
import { Paperclip, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { Badge } from "@/components/ui/badge";
import { UploadDropzone } from "@/lib/uploadthing";

interface FileUploaderProps {
  onChange: (url: string, name: string) => void;
  value?: string;
  endpoint: keyof OurFileRouter;
  label?: string;
  description?: string;
  isUploaded?: boolean;
  className?: string;
}

export const FileUploader = ({
  onChange,
  value,
  endpoint,
  label,
  description,
  isUploaded = false,
  className = "",
}: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {isUploaded && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Check className="h-3 w-3 mr-1" />
              Uploaded
            </Badge>
          )}
        </div>
      )}
      {description && <p className="text-xs text-gray-500">{description}</p>}

      {value && fileName ? (
        <div className="flex items-center justify-between p-2 border rounded-md bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-2 text-sm">
            <Paperclip className="h-4 w-4 text-blue-500" />
            <span className="text-gray-700 truncate max-w-[180px]">{fileName}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange("", "");
              setFileName("");
            }}
            className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <UploadDropzone
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            setUploading(false);
            if (res && res.length > 0) {
              onChange(res[0].url, res[0].name);
              setFileName(res[0].name);
            }
          }}
          onUploadBegin={() => {
            setUploading(true);
          }}
          onUploadError={(error: Error) => {
            setUploading(false);
            console.error("Upload error:", error);
          }}
          className="border-dashed border-2 rounded-md ut-button:bg-blue-600 ut-button:hover:bg-blue-700 ut-label:text-blue-600"
        />
      )}

      {uploading && (
        <div className="flex items-center justify-center p-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
          <span className="text-xs text-gray-500">Uploading file...</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;