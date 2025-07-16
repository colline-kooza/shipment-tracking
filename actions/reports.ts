"use server";

import { db } from "@/prisma/db";
import type {
  ShipmentStatus,
  ShipmentType,
  DocumentStatus,
  UserRole,
  DocumentType,
  NotificationType,
} from "@prisma/client";

// Enhanced types for comprehensive reporting
export type ReportType =
  | "SHIPMENTS_SUMMARY"
  | "DOCUMENT_STATUS"
  | "CUSTOMER_ANALYTICS"
  | "REVENUE_ANALYSIS"
  | "USER_ACTIVITY"
  | "TIMELINE_ANALYTICS"
  | "ROUTE_ANALYTICS"
  | "PERFORMANCE_METRICS";

export type DateRange = {
  from: Date;
  to: Date;
};

export type ReportFilters = {
  type: ReportType;
  dateRange?: DateRange;
  status?: ShipmentStatus[];
  shipmentType?: ShipmentType[];
  customerId?: string;
  userId?: string;
};

export type ReportData = {
  summary: {
    totalShipments: number;
    totalCustomers: number;
    totalDocuments: number;
    totalUsers: number;
    totalRevenue: number;
    activeShipments: number;
    completedShipments: number;
    pendingDocuments: number;
  };
  shipmentsByStatus: Array<{
    status: ShipmentStatus;
    count: number;
    percentage: number;
  }>;
  shipmentsByType: Array<{
    type: ShipmentType;
    count: number;
    percentage: number;
  }>;
  documentsByStatus: Array<{
    status: DocumentStatus;
    count: number;
    percentage: number;
  }>;
  documentsByType: Array<{
    type: DocumentType;
    count: number;
    percentage: number;
  }>;
  customerAnalytics: Array<{
    customerId: string;
    customerName: string;
    totalShipments: number;
    pendingShipments: number;
    completedShipments: number;
    averageDeliveryTime: number;
    totalDocuments: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    shipments: number;
    documents: number;
    completionRate: number;
  }>;
  topRoutes: Array<{
    route: string;
    count: number;
    percentage: number;
    averageDeliveryTime: number;
  }>;
  userActivity: Array<{
    userId: string;
    userName: string;
    role: UserRole;
    shipmentsCreated: number;
    documentsUploaded: number;
    lastActivity: Date;
  }>;
  timelineAnalytics: Array<{
    status: ShipmentStatus;
    averageTimeInStatus: number;
    totalTransitions: number;
  }>;
  performanceMetrics: {
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
    documentApprovalRate: number;
    customerSatisfactionScore: number;
  };
  notifications: Array<{
    type: NotificationType;
    count: number;
    percentage: number;
  }>;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function generateReport(
  filters: ReportFilters
): Promise<ApiResponse<ReportData>> {
  try {
    const { type, dateRange, status, shipmentType, customerId, userId } =
      filters;

    // Base query conditions
    const baseWhere = {
      ...(dateRange && {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      }),
      ...(status && status.length > 0 && { status: { in: status } }),
      ...(shipmentType &&
        shipmentType.length > 0 && { type: { in: shipmentType } }),
      ...(customerId && { customerId }),
      ...(userId && { createdBy: userId }),
    };

    // Get comprehensive summary data
    const [
      totalShipments,
      activeShipments,
      completedShipments,
      totalCustomers,
      totalDocuments,
      pendingDocuments,
      totalUsers,
      shipmentsByStatus,
      shipmentsByType,
      documentsByStatus,
      documentsByType,
    ] = await Promise.all([
      db.shipment.count({ where: baseWhere }),
      db.shipment.count({
        where: {
          ...baseWhere,
          status: { in: ["CREATED", "IN_TRANSIT", "CARGO_ARRIVED"] },
        },
      }),
      db.shipment.count({
        where: {
          ...baseWhere,
          status: { in: ["DELIVERED", "EMPTY_RETURNED"] },
        },
      }),
      db.customer.count({
        where: {
          ...(dateRange && {
            createdAt: {
              gte: dateRange.from,
              lte: dateRange.to,
            },
          }),
        },
      }),
      db.document.count({
        where: {
          ...(dateRange && {
            uploadedAt: {
              gte: dateRange.from,
              lte: dateRange.to,
            },
          }),
        },
      }),
      db.document.count({
        where: {
          status: "PENDING",
          ...(dateRange && {
            uploadedAt: {
              gte: dateRange.from,
              lte: dateRange.to,
            },
          }),
        },
      }),
      db.user.count({
        where: {
          ...(dateRange && {
            createdAt: {
              gte: dateRange.from,
              lte: dateRange.to,
            },
          }),
        },
      }),
      // Shipments by status
      db.shipment.groupBy({
        by: ["status"],
        _count: { status: true },
        where: baseWhere,
      }),
      // Shipments by type
      db.shipment.groupBy({
        by: ["type"],
        _count: { type: true },
        where: baseWhere,
      }),
      // Documents by status
      db.document.groupBy({
        by: ["status"],
        _count: { status: true },
        where: {
          ...(dateRange && {
            uploadedAt: {
              gte: dateRange.from,
              lte: dateRange.to,
            },
          }),
        },
      }),
      // Documents by type
      db.document.groupBy({
        by: ["type"],
        _count: { type: true },
        where: {
          ...(dateRange && {
            uploadedAt: {
              gte: dateRange.from,
              lte: dateRange.to,
            },
          }),
        },
      }),
    ]);

    // Calculate percentages for distributions
    const statusData = shipmentsByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
      percentage:
        totalShipments > 0
          ? Math.round((item._count.status / totalShipments) * 100)
          : 0,
    }));

    const typeData = shipmentsByType.map((item) => ({
      type: item.type,
      count: item._count.type,
      percentage:
        totalShipments > 0
          ? Math.round((item._count.type / totalShipments) * 100)
          : 0,
    }));

    const docStatusData = documentsByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
      percentage:
        totalDocuments > 0
          ? Math.round((item._count.status / totalDocuments) * 100)
          : 0,
    }));

    const docTypeData = documentsByType.map((item) => ({
      type: item.type,
      count: item._count.type,
      percentage:
        totalDocuments > 0
          ? Math.round((item._count.type / totalDocuments) * 100)
          : 0,
    }));

    // Get enhanced customer analytics
    const customerAnalytics = await db.customer.findMany({
      where: {
        ...(dateRange && {
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        }),
      },
      select: {
        id: true,
        name: true,
        shipments: {
          where: baseWhere,
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            documents: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      take: 20,
      orderBy: {
        shipments: {
          _count: "desc",
        },
      },
    });

    const customerData = customerAnalytics.map((customer) => {
      const completedShipments = customer.shipments.filter((s) =>
        ["DELIVERED", "COMPLETED"].includes(s.status)
      );
      const avgDeliveryTime =
        completedShipments.length > 0
          ? completedShipments.reduce((sum, shipment) => {
              const deliveryTime =
                shipment.updatedAt.getTime() - shipment.createdAt.getTime();
              return sum + deliveryTime / (1000 * 60 * 60 * 24); // Convert to days
            }, 0) / completedShipments.length
          : 0;

      return {
        customerId: customer.id,
        customerName: customer.name,
        totalShipments: customer.shipments.length,
        pendingShipments: customer.shipments.filter(
          (s) => !["DELIVERED", "COMPLETED"].includes(s.status)
        ).length,
        completedShipments: completedShipments.length,
        averageDeliveryTime: Math.round(avgDeliveryTime),
        totalDocuments: customer.shipments.reduce(
          (sum, shipment) => sum + shipment.documents.length,
          0
        ),
      };
    });

    // Get monthly trends (last 12 months)
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
        label: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      };
    }).reverse();

    const monthlyTrends = await Promise.all(
      last12Months.map(async (month) => {
        const [shipmentCount, documentCount, completedCount] =
          await Promise.all([
            db.shipment.count({
              where: {
                ...baseWhere,
                createdAt: {
                  gte: month.start,
                  lte: month.end,
                },
              },
            }),
            db.document.count({
              where: {
                uploadedAt: {
                  gte: month.start,
                  lte: month.end,
                },
              },
            }),
            db.shipment.count({
              where: {
                ...baseWhere,
                createdAt: {
                  gte: month.start,
                  lte: month.end,
                },
                status: { in: ["DELIVERED", "EMPTY_RETURNED"] },
              },
            }),
          ]);

        return {
          month: month.label,
          shipments: shipmentCount,
          documents: documentCount,
          completionRate:
            shipmentCount > 0
              ? Math.round((completedCount / shipmentCount) * 100)
              : 0,
        };
      })
    );

    // Get top routes with performance metrics - FIXED VERSION
    const routeData = await db.shipment.groupBy({
      by: ["origin", "destination"],
      _count: { id: true },
      where: {
        ...baseWhere,
        status: { in: ["DELIVERED", "EMPTY_RETURNED"] },
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // Get detailed shipment data for delivery time calculations
    const completedShipmentsForRoutes = await db.shipment.findMany({
      where: {
        ...baseWhere,
        status: { in: ["DELIVERED", "EMPTY_RETURNED"] },
      },
      select: {
        origin: true,
        destination: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Calculate average delivery times per route
    const routeDeliveryTimes = new Map<
      string,
      { totalTime: number; count: number }
    >();

    completedShipmentsForRoutes.forEach((shipment) => {
      const routeKey = `${shipment.origin} → ${shipment.destination}`;
      const deliveryTime =
        shipment.updatedAt.getTime() - shipment.createdAt.getTime();
      const deliveryDays = deliveryTime / (1000 * 60 * 60 * 24); // Convert to days

      if (routeDeliveryTimes.has(routeKey)) {
        const existing = routeDeliveryTimes.get(routeKey)!;
        routeDeliveryTimes.set(routeKey, {
          totalTime: existing.totalTime + deliveryDays,
          count: existing.count + 1,
        });
      } else {
        routeDeliveryTimes.set(routeKey, {
          totalTime: deliveryDays,
          count: 1,
        });
      }
    });

    const topRoutes = routeData.map((route) => {
      const routeKey = `${route.origin} → ${route.destination}`;
      const deliveryData = routeDeliveryTimes.get(routeKey);
      const averageDeliveryTime = deliveryData
        ? Math.round(deliveryData.totalTime / deliveryData.count)
        : 0;

      return {
        route: routeKey,
        count: route._count.id,
        percentage:
          totalShipments > 0
            ? Math.round((route._count.id / totalShipments) * 100)
            : 0,
        averageDeliveryTime,
      };
    });

    // Get user activity analytics
    const userActivity = await db.user.findMany({
      where: {
        ...(dateRange && {
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        }),
      },
      select: {
        id: true,
        name: true,
        role: true,
        updatedAt: true,
        _count: {
          select: {
            shipments: {
              where: baseWhere,
            },
            documents: {
              where: {
                ...(dateRange && {
                  uploadedAt: {
                    gte: dateRange.from,
                    lte: dateRange.to,
                  },
                }),
              },
            },
          },
        },
      },
      take: 15,
      orderBy: {
        shipments: {
          _count: "desc",
        },
      },
    });

    const userData = userActivity.map((user) => ({
      userId: user.id,
      userName: user.name,
      role: user.role,
      shipmentsCreated: user._count.shipments,
      documentsUploaded: user._count.documents,
      lastActivity: user.updatedAt,
    }));

    // Get timeline analytics
    const timelineEvents = await db.timelineEvent.groupBy({
      by: ["status"],
      _count: { status: true },
      where: {
        ...(dateRange && {
          timestamp: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        }),
      },
    });

    const timelineAnalytics = timelineEvents.map((event) => ({
      status: event.status,
      averageTimeInStatus: 0, // Calculate based on your timeline logic
      totalTransitions: event._count.status,
    }));

    // Get notification analytics
    const notifications = await db.notification.groupBy({
      by: ["type"],
      _count: { type: true },
      where: {
        ...(dateRange && {
          timestamp: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        }),
      },
    });

    const totalNotifications = notifications.reduce(
      (sum, n) => sum + n._count.type,
      0
    );
    const notificationData = notifications.map((notification) => ({
      type: notification.type,
      count: notification._count.type,
      percentage:
        totalNotifications > 0
          ? Math.round((notification._count.type / totalNotifications) * 100)
          : 0,
    }));

    // Calculate performance metrics - ENHANCED VERSION
    const totalCompletedShipments = await db.shipment.findMany({
      where: {
        ...baseWhere,
        status: { in: ["DELIVERED", "EMPTY_RETURNED"] },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalDeliveryTime = totalCompletedShipments.reduce(
      (sum, shipment) => {
        const deliveryTime =
          shipment.updatedAt.getTime() - shipment.createdAt.getTime();
        return sum + deliveryTime / (1000 * 60 * 60 * 24); // Convert to days
      },
      0
    );

    const averageDeliveryTime =
      totalCompletedShipments.length > 0
        ? Math.round(totalDeliveryTime / totalCompletedShipments.length)
        : 0;

    // Get document approval statistics
    const totalVerifiedDocs = await db.document.count({
      where: {
        status: "VERIFIED",
        ...(dateRange && {
          uploadedAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        }),
      },
    });

    const performanceMetrics = {
      averageDeliveryTime,
      onTimeDeliveryRate:
        completedShipments > 0
          ? Math.round((completedShipments / totalShipments) * 100)
          : 0,
      documentApprovalRate:
        totalDocuments > 0
          ? Math.round((totalVerifiedDocs / totalDocuments) * 100)
          : 0,
      customerSatisfactionScore: 85, // This would come from customer feedback system
    };

    const reportData: ReportData = {
      summary: {
        totalShipments,
        totalCustomers,
        totalDocuments,
        totalUsers,
        totalRevenue: 0, // Calculate based on your revenue logic
        activeShipments,
        completedShipments,
        pendingDocuments,
      },
      shipmentsByStatus: statusData,
      shipmentsByType: typeData,
      documentsByStatus: docStatusData,
      documentsByType: docTypeData,
      customerAnalytics: customerData,
      monthlyTrends,
      topRoutes,
      userActivity: userData,
      timelineAnalytics,
      performanceMetrics,
      notifications: notificationData,
    };

    return {
      success: true,
      data: reportData,
    };
  } catch (error) {
    console.error("Error generating report:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate report",
    };
  }
}

export async function getReportMetadata(): Promise<
  ApiResponse<{
    customers: Array<{ id: string; name: string }>;
    users: Array<{ id: string; name: string; role: UserRole }>;
  }>
> {
  try {
    const [customers, users] = await Promise.all([
      db.customer.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
        where: { isActive: true },
      }),
      db.user.findMany({
        select: { id: true, name: true, role: true },
        orderBy: { name: "asc" },
        where: { status: true },
      }),
    ]);

    return {
      success: true,
      data: {
        customers,
        users,
      },
    };
  } catch (error) {
    console.error("Error fetching report metadata:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch report metadata",
    };
  }
}
