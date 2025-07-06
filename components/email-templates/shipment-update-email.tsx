// emails/ShipmentStatusEmail.tsx
import React from "react";
import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { format } from "date-fns";

interface ShipmentStatusEmailProps {
  shipment: {
    id: string;
    trackingNumber: string;
    description: string;
    currentStatus: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    customer: {
      name: string;
    };
  };
  baseUrl: string;
  newStatus: string;
  statusNote?: string;
  customerName?: string;
}

// Format date function
const formatDate = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM dd, yyyy");
};

// Get status display name
const getStatusDisplay = (status: string): string => {
  const statusMap: Record<string, string> = {
    RECEIVED: "Received at Origin",
    PROCESSING: "Processing at Sort Center",
    DEPARTED_SORTING: "Departed Sorting Center",
    TRANSPORT_HUB: "At Transport Hub",
    LEAVING_ORIGIN: "Leaving Origin Country",
    TRANSIT_ARRIVAL: "Arrived in Transit Country",
    TRANSIT_DEPARTURE: "Departed Transit Country",
    LOCAL_DELIVERY: "With Local Delivery",
    ARRIVED_DESTINATION: "Arrived at Destination",
    DELIVERED: "Delivered",
    RETURNED: "Returned to Sender",
    LOST: "Lost in Transit",
    ON_HOLD: "On Hold",
  };

  return statusMap[status] || status;
};

// Get status color
const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    RECEIVED: "#3498db", // Blue
    PROCESSING: "#3498db", // Blue
    DEPARTED_SORTING: "#3498db", // Blue
    TRANSPORT_HUB: "#3498db", // Blue
    LEAVING_ORIGIN: "#3498db", // Blue
    TRANSIT_ARRIVAL: "#3498db", // Blue
    TRANSIT_DEPARTURE: "#3498db", // Blue
    LOCAL_DELIVERY: "#f39c12", // Amber
    ARRIVED_DESTINATION: "#2ecc71", // Green
    DELIVERED: "#2ecc71", // Green
    RETURNED: "#e74c3c", // Red
    LOST: "#e74c3c", // Red
    ON_HOLD: "#f39c12", // Amber
  };

  return statusColors[status] || "#3498db"; // Default blue
};

export const ShipmentStatusEmail = ({
  shipment,
  baseUrl,
  newStatus,
  statusNote,
  customerName,
}: ShipmentStatusEmailProps) => {
  const statusDisplay = getStatusDisplay(newStatus);
  const statusColor = getStatusColor(newStatus);
  const name = customerName || shipment.customer?.name || "Valued Customer";
  const trackingUrl = `${baseUrl}/?number=${shipment.trackingNumber}`;

  return (
    <Html>
      <Head />
      <Preview>
        Shipment #{shipment.trackingNumber} Status Update: {statusDisplay}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`https://14j7oh8kso.ufs.sh/f/HLxTbDBCDLwfNaQVCNKo95eEv0YxGDVLlTSWdkAyb8aFmhJO`}
              width="120"
              height="56.4"
              alt="Greenlink Freight Logistics"
              style={logo}
            />
          </Section>

          <Section style={headerSection}>
            <Heading style={heading}>Shipment Status Update</Heading>
          </Section>

          <Section style={section}>
            <Text style={paragraph}>Hello {name},</Text>

            <Text style={paragraph}>
              Your shipment with tracking number{" "}
              <strong>{shipment.trackingNumber}</strong> has been updated:
            </Text>
          </Section>

          <Section style={{ ...statusSection, borderLeftColor: statusColor }}>
            <Text style={{ ...statusHeading, color: statusColor }}>
              New Status: {statusDisplay}
            </Text>
            {statusNote && <Text>{statusNote}</Text>}
          </Section>

          <Section style={section}>
            <Text style={paragraph}>
              You can track your shipment in real-time using the button below:
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button href={trackingUrl} style={button}>
              Track Your Shipment
            </Button>
          </Section>

          <Section style={section}>
            <Text style={paragraph}>
              Thank you for choosing Greenlink Freight Logistics.
            </Text>
          </Section>

          <Section style={shipmentDetailsSection}>
            <Heading as="h3" style={subheading}>
              Shipment Details
            </Heading>

            <Row>
              <Column>
                <Text style={labelText}>Description:</Text>
                <Text style={valueText}>{shipment.description}</Text>

                <Text style={labelText}>Date Created:</Text>
                <Text style={valueText}>{formatDate(shipment.createdAt)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              If you have any questions about your shipment, please contact our
              customer service.
            </Text>
            <Text style={footerText}>
              P.O.BOX 116373 Wakiso-(U) Email:
              info@greenlinkfreightlogistics.com
            </Text>
            <Text style={footerText}>
              www.greenlinkfreightlogistics.com Tel: +256 745 331 396
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0",
  width: "100%",
  maxWidth: "600px",
};

const logoContainer = {
  padding: "20px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const headerSection = {
  backgroundColor: "#ffffff",
  padding: "20px",
  borderRadius: "4px 4px 0 0",
  textAlign: "center" as const,
  borderTop: "3px solid #2e7d32",
};

const heading = {
  color: "#2e7d32",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const section = {
  backgroundColor: "#ffffff",
  padding: "20px",
  borderBottom: "1px solid #e0e0e0",
};

const paragraph = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "24px",
};

const statusSection = {
  backgroundColor: "#f5f5f5",
  padding: "20px",
  borderLeft: "4px solid #2e7d32",
  margin: "0",
};

const statusHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0",
};

const statusNote = {
  fontSize: "14px",
  color: "#4a4a4a",
  margin: "10px 0 0 0",
};

const buttonContainer = {
  backgroundColor: "#ffffff",
  padding: "30px 20px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#2e7d32",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 30px",
  margin: "0 auto",
};

const shipmentDetailsSection = {
  backgroundColor: "#f9f9f9",
  padding: "20px",
  borderRadius: "0 0 4px 4px",
};

const subheading = {
  color: "#2e7d32",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 10px 0",
};

const labelText = {
  color: "#9e9e9e",
  fontSize: "14px",
  marginBottom: "2px",
};

const valueText = {
  color: "#4a4a4a",
  fontSize: "14px",
  marginBottom: "12px",
};

const hr = {
  borderColor: "#e0e0e0",
  margin: "20px 0",
};

const footerSection = {
  padding: "0 20px 20px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#9e9e9e",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "4px 0",
};

export default ShipmentStatusEmail;
