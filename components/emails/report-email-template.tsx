import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReportFilters, ReportType } from "@/actions/reports";

interface ReportEmailTemplateProps {
  reportType: string;
  generatedAt: Date;
  filters: ReportFilters;
  summary: {
    totalShipments: number;
    totalCustomers: number;
    totalDocuments: number;
    activeShipments: number;
  };
}

export default function ReportEmailTemplate({
  reportType,
  generatedAt,
  filters,
  summary,
}: ReportEmailTemplateProps) {
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatDate = (date: Date) => date.toLocaleDateString();

  return (
    <Html>
      <Head />
      <Preview>{reportType} Report</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", padding: "24px", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading style={{ color: "#1f2937", fontSize: "24px", marginBottom: "16px" }}>
            {reportType} Report
          </Heading>
          <Text style={{ color: "#6b7280", fontSize: "14px", marginBottom: "16px" }}>
            Generated on {formatDate(generatedAt)}
            {filters.dateRange && (
              <>
                {" | Period: "}
                {formatDate(filters.dateRange.from)} - {formatDate(filters.dateRange.to)}
              </>
            )}
          </Text>
          <Hr style={{ margin: "16px 0", borderColor: "#e5e7eb" }} />
          <Section>
            <Text style={{ fontSize: "16px", fontWeight: "bold", color: "#374151" }}>
              Executive Summary
            </Text>
            <Text style={{ color: "#4b5563", fontSize: "14px" }}>
              Total Shipments: {formatNumber(summary.totalShipments)}
            </Text>
            <Text style={{ color: "#4b5563", fontSize: "14px" }}>
              Active Shipments: {formatNumber(summary.activeShipments)}
            </Text>
            <Text style={{ color: "#4b5563", fontSize: "14px" }}>
              Total Customers: {formatNumber(summary.totalCustomers)}
            </Text>
            <Text style={{ color: "#4b5563", fontSize: "14px" }}>
              Total Documents: {formatNumber(summary.totalDocuments)}
            </Text>
          </Section>
          <Hr style={{ margin: "16px 0", borderColor: "#e5e7eb" }} />
          <Text style={{ color: "#6b7280", fontSize: "14px" }}>
            The detailed report is attached as a PDF. Please review it for comprehensive analytics.
          </Text>
          <Text style={{ color: "#6b7280", fontSize: "14px", marginTop: "16px" }}>
            Thank you,
            <br />
            The Team at Lubega Jovan
          </Text>
        </Container>
      </Body>
    </Html>
  );
}