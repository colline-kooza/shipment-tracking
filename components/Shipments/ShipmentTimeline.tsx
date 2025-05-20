import React from 'react';
import {  Checkpoint } from '../../types/shipments';
import { formatDate } from '../../utils/dateUtils';
import { TimelineEvent } from '@/types/types';

interface ShipmentTimelineProps {
  events: TimelineEvent[];
  checkpoints: Checkpoint[];
}

export const ShipmentTimeline: React.FC<ShipmentTimelineProps> = ({ events, checkpoints }) => {
  // Sort events chronologically (newest first)
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {sortedEvents.map((event, index) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {index !== sortedEvents.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center ring-8 ring-white">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.05 3.05a.75.75 0 011.06 0l1.062 1.06a.75.75 0 11-1.061 1.061L5.05 4.11a.75.75 0 010-1.06zM10 4a6 6 0 100 12 6 6 0 000-12zm-1.25 9a.75.75 0 01.75-.75h1a.75.75 0 010 1.5h-1a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {event.status.replace(/_/g, ' ')}
                      {event.location && (
                        <span className="ml-1.5 text-sm font-normal text-gray-500">
                          at {event.location}
                        </span>
                      )}
                    </p>
                    {event.notes && (
                      <p className="text-sm text-gray-500 mt-0.5">{event.notes}</p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={event.timestamp.toDateString()}>
                      {formatDate(new Date(event.timestamp))}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShipmentTimeline;