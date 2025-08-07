"use client";

import React, { Suspense, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  Package,
  FileText,
  TruckIcon,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/trakit-dashboard/StatCard";
import ShipmentCard from "@/components/Shipments/ShipmentCard";
import { DocumentUploadForm } from "@/components/Shipments/DocumentUploadForm";

import { useSession } from "next-auth/react";
import {
  useDashboardStats,
  useRecentShipments,
  useUnreadNotificationsCount,
} from "@/hooks/useDashboard";
import { useCreateDocument } from "@/hooks/useDocuments";
import DashboardSkeleton, {
  ShipmentCardSkeleton,
  StatCardSkeleton,
} from "@/components/dashboard/DashboardSkeleton";
import { DocumentType } from "@prisma/client";
import { toast } from "sonner";
import ReportGenerationModal from "@/components/dashboard/ReportPreview";
import DailyReportGenerator from "@/components/dashboard/DailyReportGenerator";

interface QuickActionsProps {
  onUploadDocumentClick: () => void;
  onGenerateReportClick: () => void;
}

// Stats section component
const DashboardStats = () => {
  const { data: statsData, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !statsData?.success) {
    return (
      <Card className="p-4 bg-red-50 border-red-100">
        <p className="text-red-600">Failed to load dashboard statistics</p>
      </Card>
    );
  }

  const stats = statsData.data!;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Active Shipments"
        value={stats.activeShipments}
        icon={<Package size={20} />}
        color="blue"
      />
      <StatCard
        title="Pending Documents"
        value={stats.pendingDocuments}
        icon={<FileText size={20} />}
        color="orange"
      />
      <StatCard
        title="In Transit"
        value={stats.inTransitShipments}
        icon={<TruckIcon size={20} />}
        color="teal"
      />
      <StatCard
        title="Pending Invoices"
        value={stats.pendingInvoices}
        icon={<CreditCard size={20} />}
        color="purple"
      />
    </div>
  );
};

// Notifications section component
const NotificationsAlert = () => {
  const {
    data: notificationData,
    isLoading,
    error,
  } = useUnreadNotificationsCount();

  if (isLoading) {
    return null; // Can show a skeleton if desired
  }

  if (error || !notificationData?.success || !notificationData.data) {
    return null;
  }

  const unreadCount = notificationData.data;

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Card className="mb-8 bg-red-50 border border-red-100 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="font-medium text-red-800">Attention Required</h3>
            <p className="text-red-700 text-sm mt-1">
              You have {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""} that require your attention.
            </p>
          </div>
        </div>
        <Link href="/dashboard/notifications">
          <Button variant="destructive" size="sm">
            View All
          </Button>
        </Link>
      </div>
    </Card>
  );
};

// Recent shipments section component
const RecentShipments = () => {
  const { data: shipmentsData, isLoading, error } = useRecentShipments(3);

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Shipments
          </h2>
          <Link href="/dashboard/shipments-trakit">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <ShipmentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !shipmentsData?.success || !shipmentsData.data) {
    return (
      <Card className="p-4 bg-red-50 border-red-100">
        <p className="text-red-600">Failed to load recent shipments</p>
      </Card>
    );
  }

  const shipments = shipmentsData.data;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Recent Shipments</h2>
        <Link href="/dashboard/shipments-trakit">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shipments.length > 0 ? (
          shipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))
        ) : (
          <p className="text-gray-500 col-span-3 text-center py-6">
            No recent shipments found
          </p>
        )}
      </div>
    </div>
  );
};

const QuickActions = ({
  onUploadDocumentClick,
  onGenerateReportClick,
}: QuickActionsProps) => (
  <div>
    <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/dashboard/shipments-trakit/new">
          <Button className="w-full bg-[#0f2557]">Create New Shipment</Button>
        </Link>
        <Button
          variant="secondary"
          className="w-full bg-[#1a91a1] text-white hover:text-black"
          onClick={onUploadDocumentClick}
        >
          Upload Documents
        </Button>
        <DailyReportGenerator />
        <Button
          variant="outline"
          className="w-full"
          onClick={onGenerateReportClick}
        >
          Generate Full Report
        </Button>
        
      </div>
    </Card>
  </div>
);
// Main dashboard page component
export default function DashboardPage() {
  const { data: session } = useSession();

  // State for document upload modal
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Mutations
  const createDocumentMutation = useCreateDocument();

  // Event handlers
  const handleUploadClick = useCallback(() => {
    setIsUploadDialogOpen(true);
  }, []);
  const handleGenerateReportClick = useCallback(() => {
    setIsReportDialogOpen(true);
  }, []);
  const handleUploadDialogClose = useCallback((open: boolean) => {
    setIsUploadDialogOpen(open);
  }, []);

  const handleUploadDocument = useCallback(
    async (data: {
      type: DocumentType;
      file: { url: string; name: string };
      referenceNumber?: string | null;
    }) => {
      createDocumentMutation.mutate(
        {
          shipmentId: null,
          type: data.type,
          file: data.file,
          referenceNumber: data.referenceNumber,
        },
        {
          onSuccess: () => {
            setIsUploadDialogOpen(false);
            toast.success("Document uploaded successfully");
          },
          onError: (error) => {
            toast.error("Failed to upload document", {
              description: error.message,
            });
          },
        }
      );
    },
    [createDocumentMutation]
  );

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session?.user?.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Alerts Section */}
        <NotificationsAlert />

        {/* Recent Shipments */}
        <div className="mb-8">
          <RecentShipments />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions
            onUploadDocumentClick={handleUploadClick}
            onGenerateReportClick={handleGenerateReportClick}
          />
        </div>
      </div>

      {/* Upload Document Dialog */}
      <DocumentUploadForm
        isOpen={isUploadDialogOpen}
        onOpenChange={handleUploadDialogClose}
        onSubmit={handleUploadDocument}
        isSubmitting={createDocumentMutation.isPending}
        isReference={true}
      />
      <ReportGenerationModal
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
      />
    </Suspense>
  );
}
