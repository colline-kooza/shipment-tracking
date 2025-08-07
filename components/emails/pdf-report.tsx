import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { ReportData, ReportType, ReportFilters, DailyShipmentEntry } from "@/actions/reports";

// Define styles for the PDF with improved design
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottom: 3,
    borderBottomColor: "#2563eb",
    paddingBottom: 15,
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
    fontStyle: "italic",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderLeft: 4,
    borderLeftColor: "#3b82f6",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    gap: 8,
  },
  summaryCard: {
    width: "23%",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  table: {
    display: "table" as any,
    width: "100%",
    marginBottom: 15,
    border: "2px solid #e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableRowOdd: {
    backgroundColor: "#f8fafc",
  },
  tableRowEven: {
    backgroundColor: "#ffffff",
  },
  tableColHeader: {
    backgroundColor: "#3b82f6",
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRight: "1px solid #2563eb",
  },
  tableCol: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    borderRight: "1px solid #e2e8f0",
    borderBottom: "1px solid #f1f5f9",
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  tableCell: {
    fontSize: 7,
    color: "#374151",
    textAlign: "center",
    lineHeight: 1.2,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 10,
  },
  noDataMessage: {
    textAlign: "center",
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    padding: 20,
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    border: "1px solid #fbbf24",
  },
  companyInfo: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 10,
  },
});

// Optimized column widths for DAILY_SHIPMENT_REPORT table
const dailyShipmentTableColFlex = [
  { flexGrow: 0.8 },  // REF No.
  { flexGrow: 1.5 },  // CONSIGNEE
  { flexGrow: 1.0 },  // B/L No.
  { flexGrow: 1.2 },  // DOCUMENT RECEIVED DATE
  { flexGrow: 1.2 },  // DOCUMENT SENT DATE
  { flexGrow: 1.3 },  // ACTUAL TIME OF ARRIVAL MOMBASA
  { flexGrow: 1.2 },  // CONTAINER No & SIZE
  { flexGrow: 1.2 },  // DELIVERY ORDER RECEIVED
  { flexGrow: 1.2 },  // ENTRY REGISTERED DATE
  { flexGrow: 1.2 },  // CUSTOMS RELEASE DATE
  { flexGrow: 1.2 },  // TRUCK ALLOCATION DATE
  { flexGrow: 0.8 },  // TRUCK No.
  { flexGrow: 1.1 },  // PORT DEPARTURE
  { flexGrow: 1.1 },  // ARRIVAL MALABA
  { flexGrow: 1.1 },  // DEPARTURE MALABA
  { flexGrow: 1.1 },  // ARRIVAL NIMULE
  { flexGrow: 1.2 },  // BORDER RELEASED NIMULE
  { flexGrow: 1.2 },  // FINAL DELIVERY DATE
];

interface PDFReportProps {
  reportData: ReportData;
  reportType: ReportType;
  filters: ReportFilters;
}

export async function generatePDFReport({ reportData, reportType, filters }: PDFReportProps): Promise<Buffer> {
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const formatDateTime = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const getCustomerName = () => {
    if (reportType === "DAILY_SHIPMENT_REPORT" && filters.dailyReportCustomerId) {
      // You might need to fetch customer name based on ID
      return "Client Specific";
    }
    return "All Clients";
  };

  const MyDocument = (
    <Document>
      <Page size="A4" orientation={reportType === "DAILY_SHIPMENT_REPORT" ? "landscape" : "portrait"} style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyInfo}>TrakIT Logistics Management System</Text>
          <Text style={styles.title}>{getReportTitle(reportType)}</Text>
          <Text style={styles.subtitle}>
            Generated on {formatDateTime(new Date())}
            {filters.dateRange
              ? ` | Period: ${formatDate(filters.dateRange.from)} - ${formatDate(filters.dateRange.to)}`
              : ""}
            {filters.type === "DAILY_SHIPMENT_REPORT" && filters.dailyReportDate
              ? ` | Date: ${formatDate(filters.dailyReportDate)} | Scope: ${getCustomerName()}`
              : ""}
          </Text>
        </View>

        {reportType !== "DAILY_SHIPMENT_REPORT" && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Executive Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatNumber(reportData.summary.totalShipments)}</Text>
                  <Text style={styles.summaryLabel}>Total Shipments</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatNumber(reportData.summary.totalCustomers)}</Text>
                  <Text style={styles.summaryLabel}>Total Customers</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatNumber(reportData.summary.totalDocuments)}</Text>
                  <Text style={styles.summaryLabel}>Total Documents</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatNumber(reportData.summary.activeShipments)}</Text>
                  <Text style={styles.summaryLabel}>Active Shipments</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Shipment Status Distribution</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, { backgroundColor: "#3b82f6" }]}>
                  <View style={[styles.tableColHeader, { flexGrow: 2 }]}>
                    <Text style={styles.tableCellHeader}>Status</Text>
                  </View>
                  <View style={[styles.tableColHeader, { flexGrow: 1 }]}>
                    <Text style={styles.tableCellHeader}>Count</Text>
                  </View>
                  <View style={[styles.tableColHeader, { flexGrow: 1 }]}>
                    <Text style={styles.tableCellHeader}>Percentage</Text>
                  </View>
                </View>
                {reportData.shipmentsByStatus.slice(0, 10).map((status, index) => (
                  <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
                    <View style={[styles.tableCol, { flexGrow: 2 }]}>
                      <Text style={styles.tableCell}>{status.status.replace(/_/g, " ")}</Text>
                    </View>
                    <View style={[styles.tableCol, { flexGrow: 1 }]}>
                      <Text style={styles.tableCell}>{formatNumber(status.count)}</Text>
                    </View>
                    <View style={[styles.tableCol, { flexGrow: 1 }]}>
                      <Text style={styles.tableCell}>{status.percentage}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Performance Metrics</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{reportData.performanceMetrics.onTimeDeliveryRate}%</Text>
                  <Text style={styles.summaryLabel}>On-Time Delivery Rate</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{reportData.performanceMetrics.documentApprovalRate}%</Text>
                  <Text style={styles.summaryLabel}>Document Approval Rate</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{reportData.performanceMetrics.averageDeliveryTime}</Text>
                  <Text style={styles.summaryLabel}>Avg Delivery Days</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{reportData.performanceMetrics.customerSatisfactionScore}%</Text>
                  <Text style={styles.summaryLabel}>Customer Satisfaction</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {reportType === "DAILY_SHIPMENT_REPORT" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📦 Daily Shipment Details ({reportData.dailyShipments?.length || 0} shipments)
            </Text>
            
            {!reportData.dailyShipments || reportData.dailyShipments.length === 0 ? (
              <View style={styles.noDataMessage}>
                <Text>No shipments found for the selected date and criteria.</Text>
              </View>
            ) : (
              <View style={styles.table}>
                <View style={[styles.tableRow, { backgroundColor: "#3b82f6" }]}>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[0]]}>
                    <Text style={styles.tableCellHeader}>REF NO.</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[1]]}>
                    <Text style={styles.tableCellHeader}>CONSIGNEE</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[2]]}>
                    <Text style={styles.tableCellHeader}>B/L NO.</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[3]]}>
                    <Text style={styles.tableCellHeader}>DOC RECEIVED</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[4]]}>
                    <Text style={styles.tableCellHeader}>DOC SENT</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[5]]}>
                    <Text style={styles.tableCellHeader}>ARRIVAL MOMBASA</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[6]]}>
                    <Text style={styles.tableCellHeader}>CONTAINER</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[7]]}>
                    <Text style={styles.tableCellHeader}>DELIVERY ORDER</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[8]]}>
                    <Text style={styles.tableCellHeader}>ENTRY REG.</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[9]]}>
                    <Text style={styles.tableCellHeader}>CUSTOMS REL.</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[10]]}>
                    <Text style={styles.tableCellHeader}>TRUCK ALLOC.</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[11]]}>
                    <Text style={styles.tableCellHeader}>TRUCK NO.</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[12]]}>
                    <Text style={styles.tableCellHeader}>PORT DEP.</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[13]]}>
                    <Text style={styles.tableCellHeader}>ARR. MALABA</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[14]]}>
                    <Text style={styles.tableCellHeader}>DEP. MALABA</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[15]]}>
                    <Text style={styles.tableCellHeader}>ARR. NIMULE</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[16]]}>
                    <Text style={styles.tableCellHeader}>BORDER REL.</Text>
                  </View>
                  <View style={[styles.tableColHeader, dailyShipmentTableColFlex[17]]}>
                    <Text style={styles.tableCellHeader}>FINAL DELIVERY</Text>
                  </View>
                </View>
                
                {reportData.dailyShipments.map((shipment: DailyShipmentEntry, index: number) => (
                  <View style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]} key={shipment.id}>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[0]]}>
                      <Text style={styles.tableCell}>{shipment.refNo}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[1]]}>
                      <Text style={styles.tableCell}>{shipment.consignee || 'N/A'}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[2]]}>
                      <Text style={styles.tableCell}>{shipment.billOfLadingNumber || 'N/A'}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[3]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.documentReceivedDate)}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[4]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.documentSentDate)}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[5]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.actualArrivalMombasaDate)}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[6]]}>
                      <Text style={styles.tableCell}>{shipment.containerNoAndSize || 'N/A'}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[7]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.deliveryOrderReceivedDate)}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[8]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.entryRegisteredDate)}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[9]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.customsReleaseDate)}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[10]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.truckAllocationDate)}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[11]]}>
                      <Text style={styles.tableCell}>{shipment.truckNo || 'N/A'}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[12]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.portDepartureDate)}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[13]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.arrivalMalabaDate)}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[14]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.departureMalabaDate)}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[15]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.arrivalNimuleDate)}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[16]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.borderReleasedNimuleDate)}</Text>
                    </View>
                    <View style={[styles.tableCol, dailyShipmentTableColFlex[17]]}>
                      <Text style={styles.tableCell}>{formatDate(shipment.finalDeliveryDate)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text>Generated by TrakIT Logistics Management System | Page 1</Text>
          <Text>Report contains confidential business information</Text>
        </View>
      </Page>
    </Document>
  );

  try {
    const blob = await pdf(MyDocument).toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}