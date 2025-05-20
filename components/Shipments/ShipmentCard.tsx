import React from 'react';
import { Calendar, MapPin, Package, User, Truck, Ship, Plane } from 'lucide-react';
import { Shipment, ShipmentType } from '@/types/shipments';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import StatusBadge from '@/components/status-badge';
import { formatDate } from '@/utils/dateUtils';
import { ShipmentListItem } from '@/actions/trakit-shipments';

interface ShipmentCardProps {
  shipment: ShipmentListItem;
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment }) => {
  // Get the appropriate icon based on shipment type
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

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link 
              href={`/dashboard/shipments-trakit/${shipment.id}`} 
              className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors line-clamp-1"
            >
              {shipment.reference}
            </Link>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <User size={16} className="mr-2 text-gray-400" /> 
              <span>{shipment.client}</span>
            </div>
          </div>
          <StatusBadge status={shipment.status} />
        </div>
        
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