import React, { useState } from 'react';
import { Calendar, MapPin, Package, User, Truck, Ship, Plane, Clipboard, CheckCircle } from 'lucide-react';
import { ShipmentType } from '@/types/shipments';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import StatusBadge from '@/components/status-badge';
import { formatDate } from '@/utils/dateUtils';
import { ShipmentListItem } from '@/actions/trakit-shipments';

interface ShipmentCardProps {
  shipment: ShipmentListItem;
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment }) => {
  const [copied, setCopied] = useState(false);

  const getTransportIcon = () => {
    switch (shipment.type) {
      case ShipmentType.SEA:
        return <Ship size={16} className="mr-3 text-gray-400 flex-shrink-0" />;
      case ShipmentType.AIR:
        return <Plane size={16} className="mr-3 text-gray-400 flex-shrink-0" />;
      case ShipmentType.ROAD:
        return <Truck size={16} className="mr-3 text-gray-400 flex-shrink-0" />;
      default:
        return <Package size={16} className="mr-3 text-gray-400 flex-shrink-0" />;
    }
  };

  // Get the appropriate document number based on shipment type
  const getDocumentNumber = () => {
    if (shipment.type === ShipmentType.SEA && shipment.billOfLadingNumber) {
      return { label: 'B/L:', number: shipment.billOfLadingNumber };
    }
    if (shipment.type === ShipmentType.AIR && shipment.airwayBillNumber) {
      return { label: 'AWB:', number: shipment.airwayBillNumber };
    }
    return null;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const documentNumber = getDocumentNumber();

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div
              className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors line-clamp-1"
            >
              {shipment.reference}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <User size={16} className="mr-2 text-gray-400" /> 
              <span>{shipment.consignee}</span>
            </div>
          </div>
          <StatusBadge status={shipment.status} />
        </div>
        
        {shipment.trackingNumber && (
          <div 
            className="flex items-center justify-between bg-blue-50 p-3 rounded-md mb-4 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => copyToClipboard(shipment.trackingNumber!)}
            title="Click to copy tracking number"
          >
            <div className="flex items-center flex-1 overflow-hidden">
              <Package size={16} className="mr-2 text-blue-600 flex-shrink-0" />
              <div className="mr-2 text-sm font-medium text-gray-700">Tracking:</div>
              <div className="text-sm font-mono text-blue-700 truncate">
                {shipment.trackingNumber}
              </div>
            </div>
            <div className="ml-2 p-1">
              {copied ? (
                <CheckCircle size={18} className="text-green-500" />
              ) : (
                <Clipboard size={18} className="text-gray-500" />
              )}
            </div>
          </div>
        )}

        {documentNumber && (
          <div 
            className="flex items-center justify-between bg-green-50 p-3 rounded-md mb-4 cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => copyToClipboard(documentNumber.number)}
            title={`Click to copy ${documentNumber.label.toLowerCase()}`}
          >
            <div className="flex items-center flex-1 overflow-hidden">
              <Clipboard size={16} className="mr-2 text-green-600 flex-shrink-0" />
              <div className="mr-2 text-sm font-medium text-gray-700">{documentNumber.label}</div>
              <div className="text-sm font-mono text-green-700 truncate">
                {documentNumber.number}
              </div>
            </div>
            <div className="ml-2 p-1">
              {copied ? (
                <CheckCircle size={18} className="text-green-500" />
              ) : (
                <Clipboard size={18} className="text-gray-500" />
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {shipment.origin} → {shipment.destination}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-3 text-gray-400 flex-shrink-0" />
            <span>
              Arrival: {shipment.arrivalDate ? formatDate(new Date(shipment.arrivalDate)) : 'Not scheduled'}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            {getTransportIcon()}
            <span>
              {shipment.type} {shipment.type === ShipmentType.SEA && shipment.container && `- ${shipment.container}`}
              {shipment.type === ShipmentType.ROAD && shipment.truck && `- ${shipment.truck}`}
            </span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <span>Created: {formatDate(new Date(shipment.createdAt))}</span>
          </div>
          <div>
            <Link
              href={`/dashboard/shipments-trakit/${shipment.id}`}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ShipmentCard;