import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { ReportData, ReportType, ReportFilters } from "@/actions/reports";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  summaryCard: {
    width: "48%",
    marginRight: "2%",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  summaryLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  table: {
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    paddingHorizontal: 5,
  },
});

interface PDFReportProps {
  reportData: ReportData;
  reportType: ReportType;
  filters: ReportFilters;
}

export async function generatePDFReport({ reportData, reportType, filters }: PDFReportProps): Promise<Buffer> {
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatDate = (date: Date) => date.toLocaleDateString();

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
    };
    return titles[type] || "Report";
  };

  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{getReportTitle(reportType)}</Text>
          <Text style={styles.subtitle}>
            Generated on {formatDate(new Date())}
            {filters.dateRange
              ? ` | Period: ${formatDate(filters.dateRange.from)} - ${formatDate(filters.dateRange.to)}`
              : ""}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
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
          <Text style={styles.sectionTitle}>Shipment Status Distribution</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Status</Text>
              <Text style={styles.tableCell}>Count</Text>
              <Text style={styles.tableCell}>Percentage</Text>
            </View>
            {reportData.shipmentsByStatus.slice(0, 10).map((status, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{status.status.replace("_", " ")}</Text>
                <Text style={styles.tableCell}>{formatNumber(status.count)}</Text>
                <Text style={styles.tableCell}>{status.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{reportData.performanceMetrics.onTimeDeliveryRate}%</Text>
              <Text style={styles.summaryLabel}>On-Time Delivery Rate</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{reportData.performanceMetrics.documentApprovalRate}%</Text>
              <Text style={styles.summaryLabel}>Document Approval Rate</Text>
            </View>
          </View>
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