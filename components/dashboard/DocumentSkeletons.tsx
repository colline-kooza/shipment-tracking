"use client";

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type DocumentSkeletonProps = {
  count?: number;
};

export function DocumentCardSkeleton() {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Document thumbnail/icon section */}
        <div className="w-full md:w-16 flex items-center justify-center p-4 bg-gray-50 border-r border-gray-100">
          <Skeleton className="h-12 w-12 rounded-md" />
        </div>
        
        {/* Document info section */}
        <div className="flex-1 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="w-full">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <div className="flex flex-wrap gap-2 mt-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function DocumentSkeletons({ count = 3 }: DocumentSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <DocumentCardSkeleton key={index} />
      ))}
    </div>
  );
}