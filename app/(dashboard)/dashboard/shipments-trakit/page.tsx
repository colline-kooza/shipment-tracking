"use client"
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ShipmentCard from '@/components/Shipments/ShipmentCard';

import { ShipmentFilters } from '@/actions/trakit-shipments';
import useDebounce from '@/hooks/useDebounce';
import ShipmentCardSkeleton from '@/components/dashboard/ShipmentSkeletonList';
import { useShipments } from '@/hooks/useShipmentQueries2';

// Status options array
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'CREATED', label: 'Created' },
  { value: 'DOCUMENT_RECEIVED', label: 'Documents Received' },
  { value: 'DOCUMENTS_SENT', label: 'Documents Sent' },
  { value: 'CARGO_ARRIVED', label: 'Cargo Arrived' },
  { value: 'DELIVERY_CONFIRMED', label: 'Delivery Confirmed' },
  { value: 'ENTRY_REGISTERED', label: 'Entry Registered' },
  { value: 'CLEARED', label: 'Cleared' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function ShipmentsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounce('', 500);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setDebouncedSearchQuery(searchQuery);
  }, [searchQuery, setDebouncedSearchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter, sortBy, sortOrder]);

  const filters: ShipmentFilters = {
    searchQuery: debouncedSearchQuery,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page: currentPage,
    limit: itemsPerPage,
    sortBy: sortBy,
    sortOrder: sortOrder
  };

  // Fetch shipments with filters
  const { data, isLoading, isError, error } = useShipments(filters);
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  

  return (
    <div className="container mx-auto px-4 pb-4 pt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
        
        <Link href="/dashboard/shipments-trakit/new">
          <Button className="flex items-center gap-2 bg-[#0f2557] text-xs">
            <Plus size={16} />
            New Shipment
          </Button>
        </Link>
      </div>
      
      {/* Filters */}
      <Card className="p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by reference or client..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 h-full"
              onClick={() => {
                setSortBy(sortBy === 'date' ? 'status' : 'date');
                setSortOrder('desc');
              }}
            >
              Sort by: {sortBy === 'date' ? 'Date' : 'Status'}
              <button onClick={(e) => {
                e.stopPropagation();
                toggleSortOrder();
              }} className="p-1">
                <ArrowUpDown size={14} />
              </button>
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Results count & Error handling */}
      <div className="mb-4 flex justify-between items-center">
        {isLoading ? (
          <p className="text-sm text-gray-600">Loading shipments...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">
            Error loading shipments: {error?.message || 'Unknown error'}
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Showing {data?.shipments?.length || 0} of {data?.totalCount || 0} shipment{data?.totalCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      {/* Shipments list */}
      {isLoading ? (
        // Skeleton loading state
        <div className="grid grid-cols-1 gap-4">
          {Array(3).fill(0).map((_, index) => (
            <ShipmentCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        // Error state
        <Card className="py-12 shadow-sm">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-600 mb-1">Failed to load shipments</h3>
            <p className="text-gray-500 mb-4">
              {error?.message || 'An unknown error occurred'}
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setCurrentPage(1);
                // The query will automatically refetch
              }}
            >
              Retry
            </Button>
          </div>
        </Card>
      ) : !data?.shipments || data.shipments.length === 0 ? (
        // Empty state - added null check for data.shipments
        <Card className="py-12 shadow-sm">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No shipments found</h3>
            <p className="text-gray-500">
              {debouncedSearchQuery || statusFilter !== 'all' 
                ? "Try adjusting your filters to see more results" 
                : "Create your first shipment to get started"}
            </p>
            
            <Link className='flex items-center justify-center' href="/dashboard/shipments/new">
              <Button className="mt-4 flex items-center gap-2">
                <Plus size={16} />
                New Shipment
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {data.shipments.map(shipment => (
              <Link href={`/dashboard/shipments-trakit/${shipment.id}`} key={shipment.id}>
                <ShipmentCard shipment={shipment} />
              </Link>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                    // Logic to show 5 pages around the current page
                    let pageToShow;
                    if (data.totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage >= data.totalPages - 2) {
                      pageToShow = data.totalPages - 4 + i;
                    } else {
                      pageToShow = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageToShow}
                        variant={currentPage === pageToShow ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageToShow)}
                        className="w-8 h-8 p-0"
                      >
                        {pageToShow}
                      </Button>
                    );
                  })}
                  
                  {data.totalPages > 5 && currentPage < data.totalPages - 2 && (
                    <>
                      {currentPage < data.totalPages - 3 && (
                        <span className="px-2">...</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(data.totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {data.totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(Math.min(data.totalPages, currentPage + 1))}
                  disabled={currentPage === data.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}