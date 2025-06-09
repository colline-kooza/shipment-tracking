"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plane, 
  Search, 
  Calendar, 
  Filter, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  BarChart3,
  Info,
  FileText,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ShipmentStatus } from '@prisma/client';

// Component imports
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Import types and hooks
import { AirFreightFilter, AirFreightShipment } from '@/types/air-freight-types';

import { Shipment } from '@/types/shipments';
import { getDocumentStatus, useAirFreightShipments, useAirFreightStats } from '@/hooks/useAirFreight';

export default function AirFreightPage() {
  // State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ShipmentStatus | 'all'>('all');
  const [airWaybillFilter, setAirWaybillFilter] = useState<string>('');
  
  // Create filter object for React Query
  const [filters, setFilters] = useState<AirFreightFilter>({
    status: 'all',
    search: '',
    airWaybill: '',
  });

  // Use React Query to fetch shipments and stats
  const { data: shipmentsResponse, isLoading, isError, error, refetch } = useAirFreightShipments(filters);
  const { data: statsResponse, isLoading: statsLoading } = useAirFreightStats();
  
  const shipments: AirFreightShipment[] = shipmentsResponse?.data || [];
  const stats = statsResponse?.data;

  // Update filters when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        status: activeTab,
        search: searchQuery,
        airWaybill: airWaybillFilter,
      }));
    }, 300); // Debounce search/filter updates

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, airWaybillFilter]);

  // Reset filters function
  const resetFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
    setAirWaybillFilter('');
    setFilters({
      status: 'all',
      search: '',
      airWaybill: '',
    });
  };

  // Count shipments by status for badges
  const getStatusCount = (status: ShipmentStatus | 'all') => {
    if (status === 'all') return shipments.length;
    return shipments.filter(ship => ship.status === status).length;
  };

  // Format date for display
  const formatShipmentDate = (date: string | Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  // Get CSS class based on status
  const getStatusClass = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.CREATED:
      case ShipmentStatus.DOCUMENT_RECEIVED:
        return 'bg-sky-100 text-sky-800';
      case ShipmentStatus.IN_TRANSIT:
      case ShipmentStatus.CARGO_ARRIVED:
      case ShipmentStatus.ENTRY_REGISTERED:
      case ShipmentStatus.CLEARED:
        return 'bg-indigo-100 text-indigo-800';
      case ShipmentStatus.DELIVERED:
        return 'bg-teal-100 text-teal-800';
      case ShipmentStatus.COMPLETED:
        return 'bg-emerald-100 text-emerald-800';
      case ShipmentStatus.DOCUMENT_REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if any filters are active
  const filtersActive = searchQuery !== '' || activeTab !== 'all' || airWaybillFilter !== '';

  // Render functions for different components
  const renderStatusBadge = (status: ShipmentStatus) => {
    const statusMap: Record<ShipmentStatus, { icon: React.ReactNode, label: string }> = {
      [ShipmentStatus.CREATED]: { icon: <Clock size={14} />, label: 'Created' },
      [ShipmentStatus.DOCUMENT_RECEIVED]: { icon: <Clock size={14} />, label: 'Docs Received' },
      [ShipmentStatus.DOCUMENTS_SENT]: { icon: <Clock size={14} />, label: 'Docs Sent' },
      [ShipmentStatus.IN_TRANSIT]: { icon: <Plane size={14} />, label: 'In Transit' },
      [ShipmentStatus.CARGO_ARRIVED]: { icon: <Plane size={14} />, label: 'Cargo Arrived' },
      [ShipmentStatus.ENTRY_REGISTERED]: { icon: <Package size={14} />, label: 'Entry Registered' },
      [ShipmentStatus.CLEARED]: { icon: <CheckCircle2 size={14} />, label: 'Cleared' },
      [ShipmentStatus.DELIVERED]: { icon: <CheckCircle2 size={14} />, label: 'Delivered' },
      [ShipmentStatus.COMPLETED]: { icon: <CheckCircle2 size={14} />, label: 'Completed' },
      [ShipmentStatus.DOCUMENT_REJECTED]: { icon: <XCircle size={14} />, label: 'Doc Rejected' },
      [ShipmentStatus.DELIVERY_CONFIRMED]: { icon: <CheckCircle2 size={14} />, label: 'Delivery Confirmed' },
    };

    const statusInfo = statusMap[status] || { icon: <Clock size={14} />, label: status };

    return (
      <Badge className={`flex items-center gap-1 ${getStatusClass(status)}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const renderDocumentStatusBadge = (shipment: AirFreightShipment) => {
    const docStatus = getDocumentStatus(shipment);
    
    const badgeClasses: Record<string, string> = {
      'missing': 'bg-gray-100 text-gray-800',
      'rejected': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'verified': 'bg-teal-100 text-teal-800',
    };
    
    const icons: Record<string, React.ReactNode> = {
      'missing': <AlertCircle size={14} />,
      'rejected': <XCircle size={14} />,
      'pending': <Clock size={14} />,
      'verified': <CheckCircle size={14} />,
    };
    
    const status = docStatus.status as keyof typeof badgeClasses;
    
    return (
      <Badge className={`flex items-center gap-1 ${badgeClasses[status]}`}>
        {icons[status]}
        {docStatus.label}
      </Badge>
    );
  };

  const renderStats = () => {
    if (statsLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </Card>
          ))}
        </div>
      );
    }

    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-l-4 border-l-sky-600 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Shipments</p>
              <h3 className="text-2xl font-bold text-gray-900">{getStatusCount('all')}</h3>
            </div>
            <div className="bg-sky-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-sky-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">In Transit</p>
              <h3 className="text-2xl font-bold text-gray-900">{getStatusCount(ShipmentStatus.IN_TRANSIT)}</h3>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <Plane className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-teal-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <h3 className="text-2xl font-bold text-gray-900">{getStatusCount(ShipmentStatus.DELIVERED)}</h3>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Documents Rejected</p>
              <h3 className="text-2xl font-bold text-gray-900">{getStatusCount(ShipmentStatus.DOCUMENT_REJECTED)}</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderShipmentCards = () => {
    if (isLoading) {
      return (
        <>
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="mb-4 p-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </>
      );
    }

    if (isError) {
      return (
        <Card className="p-6 flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Shipments</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Failed to load shipments data. Please try again.'}
          </p>
          <Button 
            onClick={() => refetch()} 
            className="flex items-center gap-2 bg-sky-600"
          >
            <RefreshCw size={16} />
            Retry
          </Button>
        </Card>
      );
    }

    if (shipments.length === 0) {
      return (
        <Card className="p-8 flex flex-col items-center text-center">
          <div className="bg-sky-100 p-4 rounded-full mb-4">
            <Plane className="h-12 w-12 text-sky-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Shipments Found</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            {filtersActive 
              ? 'No shipments match your current filters. Try adjusting your search criteria.'
              : 'There are no air freight shipments in the system yet.'}
          </p>
          {filtersActive ? (
            <Button 
              onClick={resetFilters}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Reset Filters
            </Button>
          ) : (
            <Link href="/dashboard/shipments-trakit/new?type=AIR">
              <Button className="bg-sky-600 text-white flex items-center gap-2">
                <Plane size={16} />
                Create First Shipment
              </Button>
            </Link>
          )}
        </Card>
      );
    }

    return (
      <>
        {shipments.map((shipment: AirFreightShipment) => (
          <Link href={`/dashboard/shipments-trakit/${shipment.id}`} key={shipment.id}>
            <Card className="mb-4 p-4 hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-sky-600">
              <div className="flex flex-col gap-3">
                {/* Header - Reference and Client */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                      {shipment.reference}
                      {shipment.airWaybill && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs font-normal">
                                AWB: {shipment.airWaybill}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Air Waybill Number</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {shipment.Customer?.name || shipment.client}
                      {shipment.Customer?.company && ` - ${shipment.Customer.company}`}
                    </p>
                  </div>
                  <div>
                    {renderStatusBadge(shipment.status)}
                  </div>
                </div>
                
                {/* Route */}
                <div className="flex items-center gap-2 text-sm text-gray-600 my-1">
                  <div className="px-3 py-1 bg-gray-100 rounded-md">
                    {shipment.origin}
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                  <div className="px-3 py-1 bg-gray-100 rounded-md">
                    {shipment.destination}
                  </div>
                </div>
                
                {/* Info Row - Dates & Status badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-1 text-gray-500" />
                      <span>Arrival: {formatShipmentDate(shipment.arrivalDate)}</span>
                    </div>
                    
                    {shipment.TrackingEvent && shipment.TrackingEvent.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock size={16} className="mr-1 text-gray-500" />
                        <span>Last Update: {formatShipmentDate(shipment.TrackingEvent[0].timestamp)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    {renderDocumentStatusBadge(shipment)}
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs flex items-center group">
                      <FileText size={14} />
                      <span>View Details</span>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </>
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Plane className="h-8 w-8 text-sky-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Air Freight Shipments</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 h-10"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Link href="/dashboard/shipments-trakit/new?type=AIR">
            <Button className="bg-sky-600 text-white flex items-center gap-2 h-10">
              <Plane size={16} />
              New Air Shipment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStats()}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ShipmentStatus | 'all')} className="mb-6">
        <TabsList className="grid grid-cols-5 md:grid-cols-5 lg:grid-cols-6 w-full max-w-4xl">
          <TabsTrigger value="all" className="flex items-center justify-center">
            All
            <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
              {getStatusCount('all')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value={ShipmentStatus.IN_TRANSIT} className="flex items-center justify-center">
            In Transit
            <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-700">
              {getStatusCount(ShipmentStatus.IN_TRANSIT)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value={ShipmentStatus.CARGO_ARRIVED} className="flex items-center justify-center">
            Arrived
            <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-700">
              {getStatusCount(ShipmentStatus.CARGO_ARRIVED)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value={ShipmentStatus.CLEARED} className="flex items-center justify-center">
            Cleared
            <Badge variant="secondary" className="ml-2 bg-teal-100 text-teal-700">
              {getStatusCount(ShipmentStatus.CLEARED)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value={ShipmentStatus.DELIVERED} className="flex items-center justify-center">
            Delivered
            <Badge variant="secondary" className="ml-2 bg-teal-100 text-teal-700">
              {getStatusCount(ShipmentStatus.DELIVERED)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value={ShipmentStatus.DOCUMENT_REJECTED} className="hidden md:flex items-center justify-center">
            Rejected
            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
              {getStatusCount(ShipmentStatus.DOCUMENT_REJECTED)}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card className="mb-6 shadow-sm">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by reference, origin, destination, or air waybill..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="w-44">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Air Waybill #"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  value={airWaybillFilter}
                  onChange={(e) => setAirWaybillFilter(e.target.value)}
                />
              </div>
            </div>
            
            {filtersActive && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="flex items-center gap-1 h-10"
              >
                <RefreshCw size={14} />
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </Card>
      
      {/* Shipment Cards */}
      {renderShipmentCards()}
    </div>
  );
}