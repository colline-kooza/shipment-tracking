import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Shipment } from '@prisma/client';

interface ShipmentProgressProps {
  shipment: Shipment;
}
 enum ShipmentStatus {
  CREATED = 'CREATED',
  DOCUMENT_RECEIVED = 'DOCUMENT_RECEIVED',
  DOCUMENTS_SENT = 'DOCUMENTS_SENT',
  CARGO_ARRIVED = 'CARGO_ARRIVED',
  DELIVERY_CONFIRMED = 'DELIVERY_CONFIRMED',
  ENTRY_REGISTERED = 'ENTRY_REGISTERED',
  CLEARED = 'CLEARED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED'  // Add this missing status
}

 enum ShipmentType {
  SEA = 'SEA',
  AIR = 'AIR',
  ROAD = 'ROAD'
}
const workflowSteps: {
  status: ShipmentStatus;
  label: string;
}[] = [
  { status: ShipmentStatus.DOCUMENT_RECEIVED, label: 'Documents Received' },
  { status: ShipmentStatus.DOCUMENTS_SENT, label: 'Documents Sent' },
  { status: ShipmentStatus.CARGO_ARRIVED, label: 'Cargo Arrived' },
  { status: ShipmentStatus.DELIVERY_CONFIRMED, label: 'Delivery Confirmed' },
  { status: ShipmentStatus.ENTRY_REGISTERED, label: 'Entry Registered' },
  { status: ShipmentStatus.CLEARED, label: 'Entry Approved' },
  { status: ShipmentStatus.IN_TRANSIT, label: 'In Transit' },
  { status: ShipmentStatus.DELIVERED, label: 'Delivered' },
  { status: ShipmentStatus.COMPLETED, label: 'Completed' },
  
];

// Status rank map using ShipmentStatus enum
const statusRankMap: Record<ShipmentStatus, number> = {
  [ShipmentStatus.CREATED]: 0,
  [ShipmentStatus.DOCUMENT_RECEIVED]: 1,
  [ShipmentStatus.DOCUMENTS_SENT]: 2,
  [ShipmentStatus.CARGO_ARRIVED]: 3,
  [ShipmentStatus.DELIVERY_CONFIRMED]: 4,
  [ShipmentStatus.ENTRY_REGISTERED]: 5,
  [ShipmentStatus.CLEARED]: 6,
  [ShipmentStatus.IN_TRANSIT]: 7,
  [ShipmentStatus.DELIVERED]: 8,
  [ShipmentStatus.COMPLETED]: 9,
  [ShipmentStatus.DOCUMENT_REJECTED]: 1, // Added missing status with appropriate rank
};


export const ShipmentProgress: React.FC<ShipmentProgressProps> = ({ shipment }) => {
    const currentStatusRank = shipment.status in statusRankMap
    ? statusRankMap[shipment.status]
    : -1; 

  // Adjust displayed steps based on shipment type
  const displaySteps = shipment.type === ShipmentType.SEA
    ? [0, 2, 4, 6, 8] // Sea freight steps
    : [0, 2, 4, 7, 8]; // Air freight steps

  const filteredSteps = displaySteps.map(index => workflowSteps[index]);

  return (
    <div className="px-4 py-5 sm:px-6">
      <h3 className="text-base font-semibold leading-6 text-gray-900">Shipment Progress</h3>
      
      <div className="mt-4">
        <div className="overflow-hidden">
          <ul className="flex items-center justify-between w-full">
            {filteredSteps.map((step, index) => {
              const stepRank = statusRankMap[step.status];
              const isCompleted = currentStatusRank >= stepRank;
              const isCurrent = currentStatusRank === stepRank;
              
              return (
                <li key={step.status} className="relative flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isCompleted ? 'bg-green-600' : 
                      isCurrent ? 'border-2 border-blue-600 bg-white' : 'bg-gray-200'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Circle className={`h-5 w-5 ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <p className={`mt-2 text-xs text-center ${
                      isCompleted ? 'text-green-600' : 
                      isCurrent ? 'text-blue-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  
                  {index < filteredSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      statusRankMap[filteredSteps[index + 1].status] <= currentStatusRank 
                        ? 'bg-green-600' 
                        : 'bg-gray-200'
                    }`} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShipmentProgress;