import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';


export const ShipmentCardSkeleton: React.FC = () => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Skeleton className="h-5 w-32 rounded-md" />
            <div className="mt-2 flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        
        <div className="space-y-3 mb-4">
          {/* Origin and destination */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>
          
          {/* Arrival date */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 w-36 rounded-md" />
          </div>
          
          {/* Container */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 w-40 rounded-md" />
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
      </div>
    </Card>
  );
};

export default ShipmentCardSkeleton;