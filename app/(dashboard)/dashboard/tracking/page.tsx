"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Package2, TrendingUp, MapPin, Calendar, 
  Truck, Ship, Plane, AlertCircle, Clock, ArrowRight, 
  CheckCircle2, XCircle, Loader2, Send, ChevronRight, FileText, Info
} from 'lucide-react';
import { ShipmentStatus, ShipmentType } from '@prisma/client';
import { useShipmentTracking, getStatusLabel, getStatusColor, getStatusBadgeColor } from '@/hooks/useTracking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchedReference, setSearchedReference] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'timeline' | 'details'>('status');
  
  // Track shipment query
  const { data: shipment, isLoading, isError, error } = useShipmentTracking(searchedReference);
  
  // Check if URL contains tracking number on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setTrackingNumber(ref);
      setSearchedReference(ref);
    }
  }, []);
  
  // Handle tracking search
  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }
    
    setSearchedReference(trackingNumber.trim());
    
    // Update URL with tracking number without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set('ref', trackingNumber.trim());
    window.history.pushState({}, '', url.toString());
  };
  
  // Handle type icon display
  const getTypeIcon = (type: ShipmentType) => {
    switch (type) {
      case 'SEA':
        return <Ship className="h-5 w-5" />;
      case 'AIR':
        return <Plane className="h-5 w-5" />;
      case 'ROAD':
        return <Truck className="h-5 w-5" />;
      default:
        return <Package2 className="h-5 w-5" />;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  // Format datetime for display
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy - h:mm a');
  };

  // Determine if checkpoint is active based on shipment status
  const determineCheckpointActive = (status: ShipmentStatus, checkpointName: string) => {
    const statusOrder: Record<ShipmentStatus, number> = {
      CREATED: 1,
      DOCUMENT_RECEIVED: 2,
      DOCUMENTS_SENT: 3,
      IN_TRANSIT: 4,
      CARGO_ARRIVED: 5,
      ENTRY_REGISTERED: 6,
      CLEARED: 7,
      DELIVERY_CONFIRMED: 8,
      DELIVERED: 9,
      COMPLETED: 10,
      DOCUMENT_REJECTED: 0
    };
    
    const checkpointOrder: Record<string, number> = {
      'Created': 1,
      'Documentation': 2,
      'In Transit': 3,
      'Customs Clearance': 4,
      'Delivery': 5
    };
    
    return statusOrder[status] >= checkpointOrder[checkpointName];
  };
  
  // Get progress percentage based on status
  const getProgressPercentage = (status: ShipmentStatus) => {
    const statusPercentage: Record<ShipmentStatus, number> = {
      CREATED: 10,
      DOCUMENT_RECEIVED: 20,
      DOCUMENTS_SENT: 30,
      IN_TRANSIT: 40,
      CARGO_ARRIVED: 60,
      ENTRY_REGISTERED: 70,
      CLEARED: 80,
      DELIVERY_CONFIRMED: 90,
      DELIVERED: 100,
      COMPLETED: 100,
      DOCUMENT_REJECTED: 0
    };
    
    return statusPercentage[status];
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with search */}
      <div className="bg-[#0f2557] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center mb-6">
            <Package2 className="h-8 w-8 mr-2" />
            <h1 className="text-xl sm:text-2xl font-bold">Shipment Tracking</h1>
          </div>
          
          <form onSubmit={handleTrackSearch} className="max-w-xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Enter tracking or reference number"
                  className="pl-10 py-6 bg-white text-black"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-6"
              >
                Track
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* When nothing is searched yet */}
        {!searchedReference && (
          <Card className="p-8 text-center">
            <Package2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">Track Your Shipment</h2>
            <p className="text-gray-500 mb-6">
              Enter your tracking or reference number above to get detailed status information
            </p>
          </Card>
        )}
        
        {/* Loading state */}
        {isLoading && searchedReference && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {/* Error state */}
        {isError && searchedReference && (
          <Card className="p-8 text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Tracking Failed</h2>
            <p className="text-gray-500 mb-6">
              {error instanceof Error ? error.message : "We couldn't find any shipment with that reference number. Please check and try again."}
            </p>
            <Button 
              className="bg-[#0f2557]"
              onClick={() => {
                setTrackingNumber('');
                setSearchedReference('');
                const url = new URL(window.location.href);
                url.searchParams.delete('ref');
                window.history.pushState({}, '', url.toString());
              }}
            >
              Try Again
            </Button>
          </Card>
        )}
        
        {/* Shipment found */}
        {shipment && !isLoading && !isError && (
          <div className="space-y-6">
            {/* Shipment Overview */}
            <Card className="overflow-hidden shadow-md">
              <div className="bg-[#0f2557] p-5 text-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {getTypeIcon(shipment.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium opacity-80">Tracking Number</p>
                      <h2 className="text-xl font-bold">{shipment.referenceNumber}</h2>
                    </div>
                  </div>
                  
                  <Badge className={`${getStatusBadgeColor(shipment.status)} px-3 py-1 text-sm`}>
                    {getStatusLabel(shipment.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium">{shipment.origin}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center items-center text-blue-400">
                    <ArrowRight className="hidden md:block h-8 w-8 text-2xl" />
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">To</p>
                      <p className="font-medium">{shipment.destination}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Expected Arrival</p>
                      <p className="font-medium">{formatDate(shipment.arrivalDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">
                        {shipment.TrackingEvent && shipment.TrackingEvent.length > 0 
                          ? formatDate(shipment.TrackingEvent[0].timestamp)
                          : formatDate(shipment.updatedAt)
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <TrendingUp className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Shipment Type</p>
                      <p className="font-medium">
                        {shipment.type === 'SEA' ? 'Sea Freight' : 
                         shipment.type === 'AIR' ? 'Air Freight' : 'Road Freight'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Package2 className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">{shipment.client}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Progress bar */}
            <div className="bg-white p-5 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-600">Shipment Progress</h3>
                <p className="text-sm font-bold">{getProgressPercentage(shipment.status)}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${getProgressPercentage(shipment.status)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Tabs */}
            <Tabs 
              defaultValue="status" 
              value={activeTab} 
              onValueChange={(val) => setActiveTab(val as 'status' | 'timeline' | 'details')}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto bg-gray-100">
                <TabsTrigger value="status" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Status</TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Timeline</TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Details</TabsTrigger>
              </TabsList>
              
              {/* Status Tab */}
              <TabsContent value="status" className="space-y-4">
                <Card className="p-6 shadow-md">
                  <h3 className="text-lg font-semibold mb-6">Tracking Progress</h3>
                  
                  {/* Checkpoints */}
                  <div className="relative">
                    {/* Progress line */}
                    <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
                    
                    {/* Map over checkpoints or default ones if not available */}
                    {(shipment.checkpoints?.length > 0 ? shipment.checkpoints : [
                      { name: 'Created', order: 1 },
                      { name: 'Documentation', order: 2 },
                      { name: 'In Transit', order: 3 },
                      { name: 'Customs Clearance', order: 4 },
                      { name: 'Delivery', order: 5 },
                    ]).map((checkpoint:any, index:any) => {
                      // Determine if this checkpoint is active based on shipment status 
                      const isActive = determineCheckpointActive(shipment.status, checkpoint.name);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex mb-8 relative"
                        >
                          {/* Step marker */}
                          <div className={`rounded-full h-12 w-12 flex items-center justify-center z-10 
                            ${isActive 
                              ? 'bg-amber-500 text-white' 
                              : 'bg-gray-100 text-gray-400 border border-gray-300'}`}
                          >
                            {isActive ? <CheckCircle2 className="h-6 w-6" /> : index + 1}
                          </div>
                          
                          {/* Step content */}
                          <div className="ml-4 flex-grow">
                            <h4 className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                              {checkpoint.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {isActive ? 'Completed' : 'Pending'}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>
                
                {/* Current Status */}
                <Card className="p-6 shadow-md">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`rounded-full p-3 ${getStatusColor(shipment.status)}`}>
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Current Status</h3>
                      <p className="text-gray-500">Last updated at {
                        shipment.TrackingEvent && shipment.TrackingEvent.length > 0 
                          ? formatDateTime(shipment.TrackingEvent[0].timestamp)
                          : formatDateTime(shipment.updatedAt)
                      }</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h4 className="font-medium mb-2">
                      {getStatusLabel(shipment.status)}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {shipment.TrackingEvent && shipment.TrackingEvent.length > 0 && shipment.TrackingEvent[0].notes 
                        ? shipment.TrackingEvent[0].notes 
                        : `Your shipment is currently ${getStatusLabel(shipment.status).toLowerCase()}.`
                      }
                    </p>
                  </div>
                </Card>
              </TabsContent>
              
              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4">
                <Card className="p-6 shadow-md">
                  <h3 className="text-lg font-semibold mb-6">Shipment Timeline</h3>
                  
                  {/* Timeline Events */}
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
                    
                    {shipment.TrackingEvent && shipment.TrackingEvent.length > 0 ? (
                      shipment.TrackingEvent.map((event:any, index:any) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex mb-8 relative"
                        >
                          {/* Event marker */}
                          <div className={`rounded-full h-12 w-12 flex items-center justify-center z-10 ${getStatusColor(event.status)}`}>
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          
                          {/* Event content */}
                          <div className="ml-4 bg-white rounded-lg border border-gray-100 p-4 shadow-sm flex-grow">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900">
                                {getStatusLabel(event.status)}
                              </h4>
                              <Badge variant="outline" className="text-sm">
                                {formatDate(event.timestamp)}
                              </Badge>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center mt-2 text-gray-500 text-sm">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            
                            {event.notes && (
                              <p className="mt-2 text-gray-600 text-sm">{event.notes}</p>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center p-8">
                        <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">No tracking events available yet</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
              
              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <Card className="p-6 shadow-md">
                  <h3 className="text-lg font-semibold mb-6">Shipment Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Shipment Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                          Shipment Information
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <p className="text-gray-600">Reference No.</p>
                            <p className="font-medium text-sm">{shipment.reference}</p>
                          </div>
                          
                          <div className="flex justify-between">
                            <p className="text-gray-600">Type</p>
                            <div className="flex items-center">
                              {getTypeIcon(shipment.type)}
                              <span className="ml-2 font-medium text-sm">
                                {shipment.type === 'SEA' ? 'Sea Freight' : 
                                 shipment.type === 'AIR' ? 'Air Freight' : 'Road Freight'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <p className="text-gray-600">Client</p>
                            <p className="font-medium text-sm">{shipment.client}</p>
                          </div>
                          
                          <div className="flex justify-between">
                            <p className="text-gray-600">Created At</p>
                            <p className="font-medium text-sm">{formatDate(shipment.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Route Details */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                          Route Details
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-gray-600 mb-1">Origin</p>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-amber-500" />
                              <p className="font-medium text-sm">{shipment.origin}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-gray-600 mb-1">Destination</p>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-amber-500" />
                              <p className="font-medium text-sm">{shipment.destination}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Dates */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                          Important Dates
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <p className="text-gray-600">Departure Date</p>
                            <p className="font-medium text-sm">
                              {shipment.departureDate ? formatDate(shipment.departureDate) : 'Not available'}
                            </p>
                          </div>
                          
                          <div className="flex justify-between">
                            <p className="text-gray-600">Expected Arrival</p>
                            <p className="font-medium text-sm">{formatDate(shipment.arrivalDate)}</p>
                          </div>
                          
                          <div className="flex justify-between">
                            <p className="text-gray-600">Last Updated</p>
                            <p className="font-medium text-sm">
                              {shipment.TrackingEvent && shipment.TrackingEvent.length > 0 
                                ? formatDate(shipment.TrackingEvent[0].timestamp)
                                : formatDate(shipment.updatedAt)
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Documents (if available) */}
                      {shipment.documents && shipment.documents.length > 0 ? (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                            Documents
                          </h4>
                          
                          <div className="space-y-2">
                            {shipment.documents.map((doc:any, index:any) => (
                              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-500 mr-3" />
                                <div className="flex-grow">
                                  <p className="font-medium text-sm">{doc.name || `Document ${index + 1}`}</p>
                                  <p className="text-sm text-gray-500">
                                    {doc.status || 'Available'}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-gray-500">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      
                      {/* Contact Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                          Contact Information
                        </h4>
                        
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <div className="flex items-start">
                            <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm text-blue-600 mb-2">Need assistance with this shipment?</p>
                              <p className="text-sm text-gray-600">Contact our support team with your tracking number:</p>
                              <Button className="mt-3 bg-blue-600 hover:bg-blue-700">
                                <Send className="h-4 w-4 mr-2" />
                                Contact Support
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}