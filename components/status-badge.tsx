import React from 'react';
import { Check, Truck, Ship, Plane, Package, AlertCircle, Clock } from 'lucide-react';
import { ShipmentStatus, StatusConfig } from '@/types/shipments';

const statusConfig: Record<string, StatusConfig> = {
  [ShipmentStatus.CREATED]: {
    label: 'Created',
    color: 'text-blue-700',
    background: 'bg-blue-100',
    icon: Clock
  },
  [ShipmentStatus.DOCUMENT_RECEIVED]: {
    label: 'Documents Received',
    color: 'text-amber-700',
    background: 'bg-amber-100',
    icon: Package
  },
  [ShipmentStatus.DOCUMENTS_SENT]: {
    label: 'Documents Sent',
    color: 'text-amber-700',
    background: 'bg-amber-100',
    icon: Package
  },
  [ShipmentStatus.CARGO_ARRIVED]: {
    label: 'Cargo Arrived',
    color: 'text-blue-700',
    background: 'bg-blue-100',
    icon: Ship
  },
  [ShipmentStatus.ENTRY_REGISTERED]: {
    label: 'Entry Registered',
    color: 'text-purple-700',
    background: 'bg-purple-100',
    icon: Package
  },
  [ShipmentStatus.DELIVERY_CONFIRMED]: {
    label: 'Delivery Confirmed',
    color: 'text-purple-700',
    background: 'bg-purple-100',
    icon: Check
  },
  [ShipmentStatus.CLEARED]: {
    label: 'Cleared',
    color: 'text-green-700',
    background: 'bg-green-100',
    icon: Check
  },
  [ShipmentStatus.IN_TRANSIT]: {
    label: 'In Transit',
    color: 'text-orange-700',
    background: 'bg-orange-100',
    icon: Truck
  },
  [ShipmentStatus.DELIVERED]: {
    label: 'Delivered',
    color: 'text-green-700',
    background: 'bg-green-100',
    icon: Check
  },
  [ShipmentStatus.COMPLETED]: {
    label: 'Completed',
    color: 'text-green-700',
    background: 'bg-green-100',
    icon: Check
  }
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || statusConfig[ShipmentStatus.CREATED];
  const Icon = config.icon || AlertCircle;
  
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-xs py-1 px-2.5'
  };
  
  return (
    <div 
      className={`
        rounded-full flex items-center ${sizeClasses[size]} 
        ${config.background} ${config.color} font-medium
      `}
    >
      <Icon size={size === 'sm' ? 12 : 14} className="mr-1" />
      {config.label}
    </div>
  );
};

export default StatusBadge;