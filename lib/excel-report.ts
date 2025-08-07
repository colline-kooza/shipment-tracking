import * as XLSX from "xlsx";
import type {
  ReportData,
  ReportType,
  ReportFilters,
  DailyShipmentEntry,
} from "@/actions/reports";

export async function generateExcelReport(
  reportData: ReportData,
  reportType: ReportType,
  filters: ReportFilters
): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();
  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString() : "N/A";

  const getReportTitle = (type: ReportType) => {
    const titles = {
      SHIPMENTS_SUMMARY: "Shipments Summary Report",
      DOCUMENT_STATUS: "Document Status Report",
      CUSTOMER_ANALYTICS: "Customer Analytics Report",
      REVENUE_ANALYSIS: "Revenue Analysis Report",
      USER_ACTIVITY: "User Activity Report",
      TIMELINE_ANALYTICS: "Timeline Analytics Report",
      ROUTE_ANALYTICS: "Route Analytics Report",
      PERFORMANCE_METRICS: "Performance Metrics Report",
      DAILY_SHIPMENT_REPORT: "Daily Shipment Report",
    };
    return titles[type] || "Report";
  };

  const reportTitle = getReportTitle(reportType);
  const filterPeriod = filters.dateRange
    ? `Period: ${formatDate(filters.dateRange.from)} - ${formatDate(
        filters.dateRange.to
      )}`
    : "";

  if (reportType === "DAILY_SHIPMENT_REPORT" && reportData.dailyShipments) {
    const header = [
      "REF No.",
      "CONSIGNEE",
      "B/L No.",
      "DOCUMENT RECEIVED DATE",
      "DOCUMENT SENT DATE",
      "ACTUAL TIME OF ARRIVAL MOMBASA",
      "CONTAINER No & SIZE.",
      "DELIVERY ORDER RECEIVED",
      "ENTRY REGISTERED DATE",
      "CUSTOMS RELEASE DATE",
      "TRUCK ALLOCATION DATE",
      "TRUCK No.",
      "PORT DEPARTURE",
      "ARRIVAL MALABA",
      "DEPARTURE MALABA",
      "ARRIVAL NIMULE",
      "BORDER RELEASED NIMULE",
      "FINAL DELIVERY DATE",
    ];

    const data = reportData.dailyShipments.map(
      (shipment: DailyShipmentEntry) => [
        shipment.refNo,
        shipment.consignee || "N/A",
        shipment.billOfLadingNumber || "N/A",
        formatDate(shipment.documentReceivedDate),
        formatDate(shipment.documentSentDate),
        formatDate(shipment.actualArrivalMombasaDate),
        shipment.containerNoAndSize || "N/A",
        formatDate(shipment.deliveryOrderReceivedDate),
        formatDate(shipment.entryRegisteredDate),
        formatDate(shipment.customsReleaseDate),
        formatDate(shipment.truckAllocationDate),
        shipment.truckNo || "N/A",
        formatDate(shipment.portDepartureDate),
        formatDate(shipment.arrivalMalabaDate),
        formatDate(shipment.departureMalabaDate),
        formatDate(shipment.arrivalNimuleDate),
        formatDate(shipment.borderReleasedNimuleDate),
        formatDate(shipment.finalDeliveryDate),
      ]
    );

    const ws_data = [
      [reportTitle],
      [`Generated on ${formatDate(new Date())} ${filterPeriod}`],
      [], // Empty row for spacing
      header,
      ...data,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(ws_data);

    // Set column widths (approximate)
    const wscols = [
      { wch: 15 }, // REF No.
      { wch: 20 }, // CONSIGNEE
      { wch: 15 }, // B/L No.
      { wch: 20 }, // DOCUMENT RECEIVED DATE
      { wch: 20 }, // DOCUMENT SENT DATE
      { wch: 25 }, // ACTUAL TIME OF ARRIVAL MOMBASA
      { wch: 20 }, // CONTAINER No & SIZE.
      { wch: 25 }, // DELIVERY ORDER RECEIVED
      { wch: 25 }, // ENTRY REGISTERED DATE
      { wch: 25 }, // CUSTOMS RELEASE DATE
      { wch: 25 }, // TRUCK ALLOCATION DATE
      { wch: 15 }, // TRUCK No.
      { wch: 20 }, // PORT DEPARTURE
      { wch: 20 }, // ARRIVAL MALABA
      { wch: 20 }, // DEPARTURE MALABA
      { wch: 20 }, // ARRIVAL NIMULE
      { wch: 25 }, // BORDER RELEASED NIMULE
      { wch: 20 }, // FINAL DELIVERY DATE
    ];
    worksheet["!cols"] = wscols;

    // Merge cells for title and subtitle
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: header.length - 1 } },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Shipments");
  } else {
    // Handle other report types for Excel if needed, or provide a default summary
    const summarySheetData = [
      [reportTitle],
      [`Generated on ${formatDate(new Date())} ${filterPeriod}`],
      [],
      ["Summary Metrics"],
      ["Total Shipments", reportData.summary.totalShipments],
      ["Active Shipments", reportData.summary.activeShipments],
      ["Completed Shipments", reportData.summary.completedShipments],
      ["Total Customers", reportData.summary.totalCustomers],
      ["Total Documents", reportData.summary.totalDocuments],
      ["Pending Documents", reportData.summary.pendingDocuments],
      [
        "On-Time Delivery Rate",
        `${reportData.performanceMetrics.onTimeDeliveryRate}%`,
      ],
      [
        "Document Approval Rate",
        `${reportData.performanceMetrics.documentApprovalRate}%`,
      ],
      [
        "Average Delivery Time",
        `${reportData.performanceMetrics.averageDeliveryTime} days`,
      ],
    ];
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summarySheetData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");
  }

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });

  return excelBuffer;
}
