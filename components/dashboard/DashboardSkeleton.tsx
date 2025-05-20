import React from 'react';
import { Card } from "@/components/ui/card";

export const StatCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-7 bg-gray-200 rounded w-16 mb-3"></div>
            <div className="flex items-center">
              <div className="h-3 bg-gray-200 rounded w-12"></div>
              <div className="h-3 bg-gray-200 rounded w-24 ml-3"></div>
            </div>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg ml-4">
            <div className="bg-gray-200 p-2 h-8 w-8 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ShipmentCardSkeleton = () => {
  return (
    <Card className="animate-pulse">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-36 mb-3"></div>
            <div className="flex items-center mt-2">
              <div className="h-4 bg-gray-200 rounded-full w-4 mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        
        <div className="space-y-4 mb-4">
          <div className="flex items-center">
            <div className="h-4 bg-gray-200 rounded-full w-4 mr-3"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          
          <div className="flex items-center">
            <div className="h-4 bg-gray-200 rounded-full w-4 mr-3"></div>
            <div className="h-4 bg-gray-200 rounded w-40"></div>
          </div>
          
          <div className="flex items-center">
            <div className="h-4 bg-gray-200 rounded-full w-4 mr-3"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="h-3 bg-gray-200 rounded w-28"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </Card>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-64"></div>
      </div>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Alerts Section Skeleton */}
      <Card className="mb-8 bg-gray-50 border border-gray-100 p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-gray-200 rounded-full mr-3"></div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </Card>
      
      {/* Recent Shipments Skeleton */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-200 rounded w-36"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <ShipmentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;