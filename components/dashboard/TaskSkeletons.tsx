import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskSkeletonsProps {
  count?: number;
}

const TaskSkeletons: React.FC<TaskSkeletonsProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card className="overflow-hidden border-l-4 border-l-gray-300 p-5" key={index}>
          <div className="flex justify-between mb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center">
                <Skeleton className="h-6 w-6 rounded-full mr-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TaskSkeletons;