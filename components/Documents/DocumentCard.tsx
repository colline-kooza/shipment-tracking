import React from 'react';
import { File, CheckCircle, AlertTriangle, Clock, CheckSquare, XSquare } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { Card } from '../ui/card';
import StatusBadge from '../status-badge';
import { DocumentStatus, DocumentType } from '@prisma/client';

// Define a more flexible interface for the document prop
interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    type: DocumentType;
    status: DocumentStatus;
    uploadedAt: Date;
    fileUrl: string;
    notes: string | null;
    userId?: string;
    shipmentId?: string;
  };
  onViewClick?: () => void;
  onVerifyClick?: () => void;
  onRejectClick?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onViewClick,
  onVerifyClick,
  onRejectClick
}) => {
  // Document type to display name mapping
  const documentTypeMap: Record<string, string> = {
    commercial_invoice: 'Commercial Invoice',
    packing_list: 'Packing List',
    bill_of_lading: 'Bill of Lading',
    airway_bill: 'Airway Bill',
    import_licence: 'Import Licence',
    certificate_of_conformity: 'Certificate of Conformity',
    tax_exemption: 'Tax Exemption',
    certificate_of_origin: 'Certificate of Origin',
    cmr_waybill: 'CMR Waybill'
  };

  // Icon based on document status
  const StatusIcon = () => {
    switch (document.status) {
      case DocumentStatus.VERIFIED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case DocumentStatus.REJECTED:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Card className="overflow-hidden border-l-4 transition-all hover:shadow-md" 
      style={{ 
        borderLeftColor: document.status === DocumentStatus.VERIFIED 
          ? '#10b981' 
          : document.status === DocumentStatus.REJECTED 
            ? '#ef4444' 
            : '#f59e0b' 
      }}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4 bg-gray-100 p-3 rounded-lg">
            <File className="h-6 w-6 text-gray-700" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900 truncate text-base">{document.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {documentTypeMap[document.type] || document.type}
                </p>
              </div>
              <div className="flex items-center ml-2">
                <StatusIcon />
                <div className="ml-2">
                  <StatusBadge status={document.status} />
                </div>
              </div>
            </div>
            
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Uploaded {formatDate(new Date(document.uploadedAt))}</span>
            </div>
            
            {document.notes && (
              <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-100">
                <span className="font-medium">Notes:</span> {document.notes}
              </div>
            )}
            
            <div className="mt-4 flex items-center space-x-3">
              <button 
                onClick={onViewClick} 
                className="inline-flex text-xs items-center px-3 py-1.5 font-medium text-white bg-[#0F2557] hover:bg-blue-800 rounded-md transition-colors"
              >
                View Document
              </button>
              
              {document.status === DocumentStatus.PENDING && (
                <>
                  <button 
                    onClick={onVerifyClick}
                    className="inline-flex items-center px-3 py-1.5 font-medium text-green-600 hover:text-white hover:bg-green-600 transition-colors border border-green-200 rounded-md bg-green-50 text-xs"
                  >
                    <CheckSquare className="h-3.5 w-3.5 mr-1" />
                    Verify
                  </button>
                  <button 
                    onClick={onRejectClick}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 transition-colors border border-red-200 rounded-md bg-red-50"
                  >
                    <XSquare className="h-3.5 w-3.5 mr-1" />
                    Reject
                  </button>
                </>
              )}
              {document.status === DocumentStatus.REJECTED && (
                <button 
                  onClick={onVerifyClick}
                  className="inline-flex items-center px-3 py-1.5 font-medium text-green-600 hover:text-white hover:bg-green-600 transition-colors border border-green-200 rounded-md bg-green-50 text-xs"
                >
                  <CheckSquare className="h-3.5 w-3.5 mr-1" />
                  Approve
                </button>
              )}
              {document.status === DocumentStatus.VERIFIED && (
                <button 
                  onClick={onRejectClick}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 transition-colors border border-red-200 rounded-md bg-red-50"
                >
                  <XSquare className="h-3.5 w-3.5 mr-1" />
                  Mark as Invalid
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DocumentCard;