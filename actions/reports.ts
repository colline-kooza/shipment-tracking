"use server";
import { db } from "@/prisma/db";
import { Resend } from "resend";
import type {
  ShipmentStatus,
  ShipmentType,
  DocumentStatus,
  UserRole,
  DocumentType,
  NotificationType,
} from "@prisma/client";
import { generatePDFReport } from "@/components/emails/pdf-report";
import ReportEmailTemplate from "@/components/emails/report-email-template";
import { generateExcelReport } from "@/lib/excel-report"; // Import the new Excel utility
import ReportEmailTemplate2 from "@/components/emails/report-email-template2";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Enhanced types for comprehensive reporting
export type ReportType =
  | "SHIPMENTS_SUMMARY"
  | "DOCUMENT_STATUS"
  | "CUSTOMER_ANALYTICS"
  | "REVENUE_ANALYSIS"
  | "USER_ACTIVITY"
  | "TIMELINE_ANALYTICS"
  | "ROUTE_ANALYTICS"
  | "PERFORMANCE_METRICS"
  | "DAILY_SHIPMENT_REPORT"; // New report type

export type DateRange = {
  from: Date;
  to: Date;
};

export type ReportFilters = {
  type: ReportType;
  dateRange?: DateRange; // General date range for other reports
  dailyReportDate?: Date; // Specific date for daily report
  dailyReportCustomerId?: string; // Specific customer for daily report
  status?: ShipmentStatus[];
  shipmentType?: ShipmentType[];
  customerId?: string;
  userId?: string;
};

export type DailyShipmentEntry = {
  id: string;
  refNo: string;
  consignee: string | null;
  billOfLadingNumber: string | null;
  documentReceivedDate: Date | null;
  documentSentDate: Date | null;
  actualArrivalMombasaDate: Date | null;
  containerNoAndSize: string | null;
  deliveryOrderReceivedDate: Date | null;
  entryRegisteredDate: Date | null;
  customsReleaseDate: Date | null;
  truckAllocationDate: Date | null;
  truckNo: string | null;
  portDepartureDate: Date | null;
  arrivalMalabaDate: Date | null;
  departureMalabaDate: Date | null;
  arrivalNimuleDate: Date | null;
  borderReleasedNimuleDate: Date | null;
  finalDeliveryDate: Date | null;
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
  dailyShipments?: DailyShipmentEntry[]; // New field for daily shipment report
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type EmailNotificationResult = {
  success: boolean;
  error?: string;
};

export type SendReportEmailData = {
  recipientEmail: string;
  reportData: ReportData; // This is a placeholder, actual data is generated inside
  reportType: ReportType;
  filters: ReportFilters;
  customerSpecific?: boolean;
  attachmentFormat: "pdf" | "excel"; // New parameter
};

// Generate report (optimized)
export async function generateReport(
  filters: ReportFilters
): Promise<ApiResponse<ReportData>> {
  try {
    const {
      type,
      dateRange,
      status,
      shipmentType,
      customerId,
      userId,
      dailyReportDate,
      dailyReportCustomerId,
    } = filters;

    // Base filters that apply to most shipment-related queries
    let shipmentBaseFilters: any = {
      ...(status?.length && { status: { in: status } }),
      ...(shipmentType?.length && { type: { in: shipmentType } }),
      ...(customerId && { customerId }),
      ...(userId && { createdBy: userId }),
    };

    // Date filtering logic
    let dateFilter: any = {};
    if (type === "DAILY_SHIPMENT_REPORT") {
      const targetDate = dailyReportDate || new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
      if (dailyReportCustomerId) {
        shipmentBaseFilters = {
          ...shipmentBaseFilters,
          customerId: dailyReportCustomerId,
        };
      }
    } else if (dateRange) {
      dateFilter = {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      };
    }

    // Combine shipment-specific filters with date filters for shipment queries
    const finalShipmentWhere = { ...shipmentBaseFilters, ...dateFilter };

    // Fetch all shipments with their timeline events for the daily report
    let dailyShipments: DailyShipmentEntry[] | undefined;
    if (type === "DAILY_SHIPMENT_REPORT") {
      const shipmentsWithTimeline = await db.shipment.findMany({
        where: finalShipmentWhere, // This is the key for daily report
        select: {
          id: true,
          reference: true,
          consignee: true,
          billOfLadingNumber: true,
          container: true,
          truck: true,
          createdAt: true,
          updatedAt: true,
          timeline: {
            select: {
              status: true,
              timestamp: true,
              location: true,
            },
            orderBy: { timestamp: "asc" },
          },
        },
      });

      dailyShipments = shipmentsWithTimeline.map((shipment) => {
        const getTimelineDate = (status: ShipmentStatus, location?: string) => {
          const event = shipment.timeline.find(
            (t) => t.status === status && (!location || t.location === location)
          );
          return event?.timestamp || null;
        };

        return {
          id: shipment.id,
          refNo: shipment.reference,
          consignee: shipment.consignee,
          billOfLadingNumber: shipment.billOfLadingNumber,
          documentReceivedDate: getTimelineDate("DOCUMENT_RECEIVED"),
          documentSentDate: getTimelineDate("DOCUMENTS_SENT"),
          actualArrivalMombasaDate: getTimelineDate("ARRIVAL_MOMBASA"),
          containerNoAndSize: shipment.container,
          deliveryOrderReceivedDate: getTimelineDate("DELIVERY_ORDER_OBTAINED"),
          entryRegisteredDate: getTimelineDate("ENTRY_REGISTERED"),
          customsReleaseDate: getTimelineDate("CUSTOM_RELEASED"),
          truckAllocationDate: getTimelineDate("TRUCK_ALLOCATED"),
          truckNo: shipment.truck,
          portDepartureDate: getTimelineDate("PORT_DEPARTURE"),
          arrivalMalabaDate: getTimelineDate("ARRIVAL_MALABA"),
          departureMalabaDate: getTimelineDate("DEPARTURE_MALABA"),
          arrivalNimuleDate: getTimelineDate("ARRIVAL_NIMULE"),
          borderReleasedNimuleDate: getTimelineDate("NIMULE_BORDER_RELEASED"),
          finalDeliveryDate:
            getTimelineDate("DELIVERED") || getTimelineDate("EMPTY_RETURNED"),
        };
      });
    }

    // Apply finalShipmentWhere to all shipment-related counts/groups.
    // For non-shipment entities (customers, documents, users, notifications),
    // use the original dateRange or no date filter if dateRange is not provided.
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
      customerAnalytics,
      timelineEvents,
      notifications,
      totalCompletedShipments,
      totalVerifiedDocs,
    ] = await Promise.all([
      db.shipment.count({ where: finalShipmentWhere }),
      db.shipment.count({
        where: {
          ...finalShipmentWhere,
          status: { in: ["CREATED", "IN_TRANSIT", "CARGO_ARRIVED"] },
        },
      }),
      db.shipment.count({
        where: {
          ...finalShipmentWhere,
          status: { in: ["DELIVERED", "EMPTY_RETURNED"] },
        },
      }),
      // For non-shipment related counts, use the original dateRange or no filter
      db.customer.count({
        where: dateRange
          ? { createdAt: { gte: dateRange.from, lte: dateRange.to } }
          : {},
      }),
      db.document.count({
        where: dateRange
          ? { uploadedAt: { gte: dateRange.from, lte: dateRange.to } }
          : {},
      }),
      db.document.count({
        where: {
          status: "PENDING",
          ...(dateRange && {
            uploadedAt: { gte: dateRange.from, lte: dateRange.to },
          }),
        },
      }),
      db.user.count({
        where: dateRange
          ? { createdAt: { gte: dateRange.from, lte: dateRange.to } }
          : {},
      }),
      db.shipment.groupBy({
        by: ["status"],
        _count: { status: true },
        where: finalShipmentWhere,
      }),
      db.shipment.groupBy({
        by: ["type"],
        _count: { type: true },
        where: finalShipmentWhere,
      }),
      db.document.groupBy({
        by: ["status"],
        _count: { status: true },
        where: dateRange
          ? { uploadedAt: { gte: dateRange.from, lte: dateRange.to } }
          : {},
      }),
      db.document.groupBy({
        by: ["type"],
        _count: { type: true },
        where: dateRange
          ? { uploadedAt: { gte: dateRange.from, lte: dateRange.to } }
          : {},
      }),
      db.customer.findMany({
        where: dateRange
          ? { createdAt: { gte: dateRange.from, lte: dateRange.to } }
          : {},
        select: {
          id: true,
          name: true,
          shipments: {
            where: finalShipmentWhere, // Shipments within customer analytics should respect the daily filter if it's a daily report
            select: {
              id: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              documents: { select: { id: true } },
            },
          },
        },
        take: 20,
        orderBy: { shipments: { _count: "desc" } },
      }),
      db.timelineEvent.groupBy({
        by: ["status"],
        _count: { status: true },
        where: dateRange
          ? { timestamp: { gte: dateRange.from, lte: dateRange.to } }
          : {},
      }),
      db.notification.groupBy({
        by: ["type"],
        _count: { type: true },
        where: dateRange
          ? { timestamp: { gte: dateRange.from, lte: dateRange.to } }
          : {},
      }),
      db.shipment.findMany({
        where: {
          ...finalShipmentWhere,
          status: { in: ["DELIVERED", "EMPTY_RETURNED"] },
        },
        select: {
          createdAt: true,
          updatedAt: true,
          origin: true,
          destination: true,
        },
      }),
      db.document.count({
        where: {
          status: "VERIFIED",
          ...(dateRange && {
            uploadedAt: { gte: dateRange.from, lte: dateRange.to },
          }),
        },
      }),
    ]);

    const statusData = shipmentsByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
      percentage: totalShipments
        ? Math.round((item._count.status / totalShipments) * 100)
        : 0,
    }));

    const typeData = shipmentsByType.map((item) => ({
      type: item.type,
      count: item._count.type,
      percentage: totalShipments
        ? Math.round((item._count.type / totalShipments) * 100)
        : 0,
    }));

    const docStatusData = documentsByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
      percentage: totalDocuments
        ? Math.round((item._count.status / totalDocuments) * 100)
        : 0,
    }));

    const docTypeData = documentsByType.map((item) => ({
      type: item.type,
      count: item._count.type,
      percentage: totalDocuments
        ? Math.round((item._count.type / totalDocuments) * 100)
        : 0,
    }));

    const customerData = customerAnalytics.map((customer) => {
      const completedShipments = customer.shipments.filter((s) =>
        ["DELIVERED", "EMPTY_RETURNED"].includes(s.status)
      );
      const avgDeliveryTime =
        completedShipments.length > 0
          ? completedShipments.reduce(
              (sum, shipment) =>
                sum +
                (shipment.updatedAt.getTime() - shipment.createdAt.getTime()) /
                  (1000 * 60 * 60 * 24),
              0
            ) / completedShipments.length
          : 0;

      return {
        customerId: customer.id,
        customerName: customer.name,
        totalShipments: customer.shipments.length,
        pendingShipments: customer.shipments.filter(
          (s) => !["DELIVERED", "EMPTY_RETURNED"].includes(s.status)
        ).length,
        completedShipments: completedShipments.length,
        averageDeliveryTime: Math.round(avgDeliveryTime),
        totalDocuments: customer.shipments.reduce(
          (sum, shipment) => sum + shipment.documents.length,
          0
        ),
      };
    });

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
                ...finalShipmentWhere, // Apply filter here
                createdAt: { gte: month.start, lte: month.end },
              },
            }),
            db.document.count({
              where: { uploadedAt: { gte: month.start, lte: month.end } },
            }),
            db.shipment.count({
              where: {
                ...finalShipmentWhere, // Apply filter here
                createdAt: { gte: month.start, lte: month.end },
                status: { in: ["DELIVERED", "EMPTY_RETURNED"] },
              },
            }),
          ]);

        return {
          month: month.label,
          shipments: shipmentCount,
          documents: documentCount,
          completionRate: shipmentCount
            ? Math.round((completedCount / shipmentCount) * 100)
            : 0,
        };
      })
    );

    const routeDeliveryTimes = new Map<
      string,
      { totalTime: number; count: number }
    >();
    totalCompletedShipments.forEach((shipment) => {
      const routeKey = `${shipment.origin} → ${shipment.destination}`;
      const deliveryTime =
        (shipment.updatedAt.getTime() - shipment.createdAt.getTime()) /
        (1000 * 60 * 60 * 24);
      const existing = routeDeliveryTimes.get(routeKey) || {
        totalTime: 0,
        count: 0,
      };
      routeDeliveryTimes.set(routeKey, {
        totalTime: existing.totalTime + deliveryTime,
        count: existing.count + 1,
      });
    });

    const routeData = await db.shipment.groupBy({
      by: ["origin", "destination"],
      _count: { id: true },
      where: {
        ...finalShipmentWhere,
        status: { in: ["DELIVERED", "EMPTY_RETURNED"] },
      }, // Apply filter here
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const topRoutes = routeData.map((route) => {
      const routeKey = `${route.origin} → ${route.destination}`;
      const deliveryData = routeDeliveryTimes.get(routeKey);
      return {
        route: routeKey,
        count: route._count.id,
        percentage: totalShipments
          ? Math.round((route._count.id / totalShipments) * 100)
          : 0,
        averageDeliveryTime: deliveryData
          ? Math.round(deliveryData.totalTime / deliveryData.count)
          : 0,
      };
    });

    const userActivity = await db.user.findMany({
      where: dateRange
        ? { createdAt: { gte: dateRange.from, lte: dateRange.to } }
        : {},
      select: {
        id: true,
        name: true,
        role: true,
        updatedAt: true,
        _count: {
          select: {
            shipments: { where: finalShipmentWhere }, // Apply filter here
            documents: {
              where: dateRange
                ? { uploadedAt: { gte: dateRange.from, lte: dateRange.to } }
                : {},
            },
          },
        },
      },
      take: 15,
      orderBy: { shipments: { _count: "desc" } },
    });

    const userData = userActivity.map((user) => ({
      userId: user.id,
      userName: user.name,
      role: user.role,
      shipmentsCreated: user._count.shipments,
      documentsUploaded: user._count.documents,
      lastActivity: user.updatedAt,
    }));

    const timelineAnalytics = timelineEvents.map((event) => ({
      status: event.status,
      averageTimeInStatus: 0, // Placeholder for timeline logic
      totalTransitions: event._count.status,
    }));

    const totalNotifications = notifications.reduce(
      (sum, n) => sum + n._count.type,
      0
    );
    const notificationData = notifications.map((notification) => ({
      type: notification.type,
      count: notification._count.type,
      percentage: totalNotifications
        ? Math.round((notification._count.type / totalNotifications) * 100)
        : 0,
    }));

    const totalDeliveryTime = totalCompletedShipments.reduce(
      (sum, shipment) =>
        sum +
        (shipment.updatedAt.getTime() - shipment.createdAt.getTime()) /
          (1000 * 60 * 60 * 24),
      0
    );

    const performanceMetrics = {
      averageDeliveryTime: totalCompletedShipments.length
        ? Math.round(totalDeliveryTime / totalCompletedShipments.length)
        : 0,
      onTimeDeliveryRate: totalShipments
        ? Math.round((completedShipments / totalShipments) * 100)
        : 0,
      documentApprovalRate: totalDocuments
        ? Math.round((totalVerifiedDocs / totalDocuments) * 100)
        : 0,
      customerSatisfactionScore: 85, // Placeholder for feedback system
    };

    const reportData: ReportData = {
      summary: {
        totalShipments,
        totalCustomers,
        totalDocuments,
        totalUsers,
        totalRevenue: 0, // Placeholder for revenue logic
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
      ...(type === "DAILY_SHIPMENT_REPORT" && { dailyShipments }), // Conditionally add dailyShipments
    };

    return { success: true, data: reportData };
  } catch (error) {
    console.error("Error generating report:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate report",
    };
  }
}

// Get report metadata
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

    return { success: true, data: { customers, users } };
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

// Get customers for email selection
export async function getCustomersForEmail(): Promise<
  ApiResponse<Array<{ id: string; name: string; email: string | null }>>
> {
  try {
    const customers = await db.customer.findMany({
      select: { id: true, name: true, email: true },
      where: { isActive: true, email: { not: null } },
      orderBy: { name: "asc" },
    });

    return { success: true, data: customers };
  } catch (error) {
    console.error("Error fetching customers for email:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch customers for email",
    };
  }
}

// Send report email with PDF/Excel attachment
export async function sendReportEmail({
  recipientEmail,
  reportData, // This is a placeholder, actual data is generated inside
  reportType,
  filters,
  customerSpecific = false,
  attachmentFormat, // Destructure new parameter
}: SendReportEmailData): Promise<ApiResponse<{ messageId: string }>> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    // Generate the report data dynamically based on filters
    const generatedReportResponse = await generateReport(filters);
    if (!generatedReportResponse.success || !generatedReportResponse.data) {
      throw new Error(
        generatedReportResponse.error ||
          "Failed to generate report data for email."
      );
    }
    const actualReportData = generatedReportResponse.data;

    const attachmentBuffer = await generateReportAttachment(
      actualReportData,
      reportType,
      filters,
      attachmentFormat
    );

    const reportTypeName =
      {
        SHIPMENTS_SUMMARY: "Shipments Summary",
        DOCUMENT_STATUS: "Document Status",
        CUSTOMER_ANALYTICS: "Customer Analytics",
        REVENUE_ANALYSIS: "Revenue Analysis",
        USER_ACTIVITY: "User Activity",
        TIMELINE_ANALYTICS: "Timeline Analytics",
        ROUTE_ANALYTICS: "Route Analytics",
        PERFORMANCE_METRICS: "Performance Metrics",
        DAILY_SHIPMENT_REPORT: "Daily Shipment", // Title for the new report type
      }[reportType] || "Report";

    const attachmentFilename = `${reportType.toLowerCase()}_report_${
      new Date().toISOString().split("T")[0]
    }.${attachmentFormat === "pdf" ? "pdf" : "xlsx"}`;
    const attachmentContentType =
      attachmentFormat === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const subject = customerSpecific
      ? `Your ${reportTypeName} Report`
      : `${reportTypeName} Report - ${new Date().toLocaleDateString()}`;

    const response = await resend.emails.send({
      from: "Reports <reports@lubegajovan.com>",
      to: [recipientEmail],
      subject,
      react: ReportEmailTemplate2({
        reportType: reportTypeName,
        generatedAt: new Date(),
        filters,
      }),
      attachments: [
        {
          filename: attachmentFilename,
          content: attachmentBuffer,
          contentType: attachmentContentType,
        },
      ],
    });

    if (!response.data?.id) {
      throw new Error("Failed to send email - no response from service");
    }

    return { success: true, data: { messageId: response.data.id } };
  } catch (error) {
    console.error("Failed to send report email:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send report email",
    };
  }
}

// New action for direct download
// Fixed downloadReport function - only the relevant parts that need to be updated

// New action for direct download - FIXED VERSION
export async function downloadReport(
  filters: ReportFilters,
  format: "pdf" | "excel"
): Promise<ApiResponse<string>> {
  // Returns base64 string
  try {
    // Validate format parameter
    if (!format || (format !== "pdf" && format !== "excel")) {
      console.error("Invalid format provided:", format);
      return {
        success: false,
        error: "Invalid format. Must be 'pdf' or 'excel'.",
      };
    }

    console.log(`Starting report generation with format: ${format}`);

    const generatedReportResponse = await generateReport(filters);
    if (!generatedReportResponse.success || !generatedReportResponse.data) {
      throw new Error(
        generatedReportResponse.error ||
          "Failed to generate report data for download."
      );
    }
    const actualReportData = generatedReportResponse.data;

    console.log(
      `Generating ${format} attachment for report type: ${filters.type}`
    );

    const buffer = await generateReportAttachment(
      actualReportData,
      filters.type,
      filters,
      format
    );

    console.log(`Successfully generated ${format} report`);

    return { success: true, data: buffer.toString("base64") };
  } catch (error) {
    console.error("Error downloading report:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to download report",
    };
  }
}

// Also fix the generateReportAttachment function - FIXED VERSION
async function generateReportAttachment(
  reportData: ReportData,
  reportType: ReportType,
  filters: ReportFilters,
  format: "pdf" | "excel"
): Promise<Buffer> {
  try {
    console.log(
      `generateReportAttachment called with format: ${format}, reportType: ${reportType}`
    );

    // Validate format parameter
    if (!format) {
      throw new Error("Format parameter is required");
    }

    if (format === "pdf") {
      console.log("Generating PDF report...");
      return await generatePDFReport({ reportData, reportType, filters });
    } else if (format === "excel") {
      console.log("Generating Excel report...");
      return await generateExcelReport(reportData, reportType, filters);
    } else {
      throw new Error(`Unsupported attachment format: ${format}`);
    }
  } catch (error) {
    console.error(`Error generating ${format} report:`, error);
    throw new Error(
      `Failed to generate ${format} attachment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
