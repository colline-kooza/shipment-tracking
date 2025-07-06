import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from "@react-email/components"
import { format } from "date-fns"

interface ShipmentStatusUpdateEmailProps {
  shipment: {
    id: string
    reference: string
    trackingNumber: string | null
    client: string
    origin: string
    destination: string
    status: string
    arrivalDate: Date | null
    container: string | null
    truck: string | null
    createdAt: Date
    type: string
    consignee?: string | null
  }
  previousStatus: string
  notes?: string
}

const getStatusMessage = (status: string) => {
  const messages: Record<string, string> = {
    CREATED: "Your shipment has been created and is being processed",
    DOCUMENT_RECEIVED: "We have received your shipment documents",
    DOCUMENTS_SENT: "Documents have been sent for processing",
    CARGO_ARRIVED: "Your cargo has arrived at the destination port",
    DELIVERY_CONFIRMED: "Delivery has been confirmed",
    ENTRY_REGISTERED: "Entry has been registered with customs",
    CLEARED: "Your shipment has cleared customs",
    IN_TRANSIT: "Your shipment is currently in transit",
    DELIVERED: "Your shipment has been successfully delivered",
    COMPLETED: "Your shipment process has been completed",
    DOCUMENT_REJECTED: "Some documents have been rejected and need revision",
  }
  return messages[status] || `Your shipment status has been updated to ${status.replace(/_/g, " ")}`
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    CREATED: "#2563eb",
    DOCUMENT_RECEIVED: "#f59e0b",
    DOCUMENTS_SENT: "#8b5cf6",
    CARGO_ARRIVED: "#3b82f6",
    DELIVERY_CONFIRMED: "#06b6d4",
    ENTRY_REGISTERED: "#f59e0b",
    CLEARED: "#10b981",
    IN_TRANSIT: "#3b82f6",
    DELIVERED: "#10b981",
    COMPLETED: "#059669",
    DOCUMENT_REJECTED: "#ef4444",
  }
  return colors[status] || "#64748b"
}

export const ShipmentStatusUpdateEmail = ({ shipment, previousStatus, notes }: ShipmentStatusUpdateEmailProps) => {
  const previewText = `Shipment ${shipment.reference} status updated to ${shipment.status.replace(/_/g, " ")}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Heading style={logo}>Trakit</Heading>
                <Text style={headerSubtitle}>Shipment Tracking & Management</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Shipment Status Update</Heading>

            <Text style={text}>Hello {shipment.client},</Text>

            <Text style={text}>
              We have an important update on your shipment <strong>{shipment.reference}</strong>.
            </Text>

            {/* Status Update Card */}
            <Section style={updateCard}>
              <Row>
                <Column style={statusColumn}>
                  <Text style={statusLabel}>Previous Status</Text>
                  <Text
                    style={{
                      ...statusValue,
                      color: getStatusColor(previousStatus),
                    }}
                  >
                    {previousStatus.replace(/_/g, " ")}
                  </Text>
                </Column>
                <Column style={arrowColumn}>
                  <Text style={arrow}>→</Text>
                </Column>
                <Column style={statusColumn}>
                  <Text style={statusLabel}>Current Status</Text>
                  <Text
                    style={{
                      ...statusValue,
                      color: getStatusColor(shipment.status),
                    }}
                  >
                    {shipment.status.replace(/_/g, " ")}
                  </Text>
                </Column>
              </Row>

              <Text style={statusMessage}>{getStatusMessage(shipment.status)}</Text>

              {notes && (
                <Section style={notesSection}>
                  <Text style={notesLabel}>Additional Notes:</Text>
                  <Text style={notesText}>{notes}</Text>
                </Section>
              )}
            </Section>

            {/* Shipment Details */}
            <Section style={detailsCard}>
              <Heading style={detailsHeading}>Shipment Details</Heading>

              <Row>
                <Column style={detailsColumn}>
                  <Text style={detailLabel}>Reference Number</Text>
                  <Text style={detailValue}>{shipment.reference}</Text>
                </Column>
                <Column style={detailsColumn}>
                  <Text style={detailLabel}>Tracking Number</Text>
                  <Text style={detailValue}>{shipment.trackingNumber || "Not assigned yet"}</Text>
                </Column>
              </Row>

              <Row>
                <Column style={detailsColumn}>
                  <Text style={detailLabel}>Shipment Type</Text>
                  <Text style={detailValue}>{shipment.type}</Text>
                </Column>
                <Column style={detailsColumn}>
                  <Text style={detailLabel}>Created Date</Text>
                  <Text style={detailValue}>{format(new Date(shipment.createdAt), "PPP")}</Text>
                </Column>
              </Row>

              <Row>
                <Column style={detailsColumn}>
                  <Text style={detailLabel}>Origin</Text>
                  <Text style={detailValue}>{shipment.origin}</Text>
                </Column>
                <Column style={detailsColumn}>
                  <Text style={detailLabel}>Destination</Text>
                  <Text style={detailValue}>{shipment.destination}</Text>
                </Column>
              </Row>

              {shipment.consignee && (
                <Row>
                  <Column style={detailsColumn}>
                    <Text style={detailLabel}>Consignee</Text>
                    <Text style={detailValue}>{shipment.consignee}</Text>
                  </Column>
                  <Column style={detailsColumn}>
                    <Text style={detailLabel}>Last Updated</Text>
                    <Text style={detailValue}>{format(new Date(), "PPP 'at' p")}</Text>
                  </Column>
                </Row>
              )}

              {shipment.arrivalDate && (
                <Row>
                  <Column style={detailsColumn}>
                    <Text style={detailLabel}>Expected Arrival</Text>
                    <Text style={detailValue}>{format(new Date(shipment.arrivalDate), "PPP")}</Text>
                  </Column>
                  <Column style={detailsColumn}>
                    <Text style={detailLabel}>Days Remaining</Text>
                    <Text style={detailValue}>
                      {Math.ceil(
                        (new Date(shipment.arrivalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                      )}{" "}
                      days
                    </Text>
                  </Column>
                </Row>
              )}

              {(shipment.container || shipment.truck) && (
                <Row>
                  {shipment.container && (
                    <Column style={detailsColumn}>
                      <Text style={detailLabel}>Container</Text>
                      <Text style={detailValue}>{shipment.container}</Text>
                    </Column>
                  )}
                  {shipment.truck && (
                    <Column style={detailsColumn}>
                      <Text style={detailLabel}>Truck</Text>
                      <Text style={detailValue}>{shipment.truck}</Text>
                    </Column>
                  )}
                </Row>
              )}
            </Section>

            {/* Action Buttons */}
            <Section style={buttonSection}>
              <Button style={button} href={`${process.env.NEXT_PUBLIC_BASE_URL}/track??ref=${shipment.trackingNumber}`}>
                Track Your Shipment
              </Button>

           
            </Section>

            <Text style={text}>
              You can continue to track your shipment's progress in real-time using the tracking link above. We'll keep
              you updated with email notifications as your shipment progresses through each stage.
            </Text>

            <Hr style={hr} />

            <Text style={footerText}>
              If you have any questions or concerns about your shipment, please don't hesitate to contact our support
              team at{" "}
              <a href="mailto:support@trakit.com" style={link}>
                support@trakit.com
              </a>{" "}
              or call us at{" "}
              <a href="tel:+1234567890" style={link}>
                +1 (234) 567-8900
              </a>
              .
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Best regards,
              <br />
              The Trakit Team
            </Text>

            <Hr style={footerHr} />

            <Text style={footerSmall}>
              This email was sent to {shipment.client} regarding shipment {shipment.reference}.
              <br />© 2024 Trakit. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
  margin: 0,
  padding: 0,
}

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  margin: "40px auto",
  maxWidth: "600px",
  padding: "0",
}

const header = {
  backgroundColor: "#2563eb",
  borderRadius: "8px 8px 0 0",
  padding: "24px",
}

const logo = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
  textAlign: "center" as const,
}

const headerSubtitle = {
  color: "#bfdbfe",
  fontSize: "14px",
  margin: "4px 0 0 0",
  textAlign: "center" as const,
}

const content = {
  padding: "32px",
}

const h1 = {
  color: "#1e293b",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "0 0 16px 0",
}

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
}

const updateCard = {
  backgroundColor: "#f0f9ff",
  border: "2px solid #2563eb",
  borderRadius: "8px",
  margin: "24px 0",
  padding: "24px",
}

const statusColumn = {
  textAlign: "center" as const,
  verticalAlign: "top" as const,
  width: "40%",
}

const arrowColumn = {
  textAlign: "center" as const,
  verticalAlign: "middle" as const,
  width: "20%",
}

const statusLabel = {
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 8px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
}

const statusValue = {
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
  textTransform: "capitalize" as const,
}

const arrow = {
  color: "#2563eb",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
}

const statusMessage = {
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  color: "#374151",
  fontSize: "16px",
  fontStyle: "italic",
  margin: "16px 0 0 0",
  padding: "12px",
  textAlign: "center" as const,
}

const notesSection = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "4px",
  margin: "16px 0 0 0",
  padding: "12px 16px",
}

const notesLabel = {
  color: "#92400e",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px 0",
}

const notesText = {
  color: "#78350f",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
}

const detailsCard = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  margin: "24px 0",
  padding: "24px",
}

const detailsHeading = {
  color: "#1e293b",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px 0",
}

const detailsColumn = {
  paddingBottom: "12px",
  paddingRight: "12px",
  verticalAlign: "top" as const,
  width: "50%",
}

const detailLabel = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "500",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
}

const detailValue = {
  color: "#1e293b",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
}

const buttonSection = {
  margin: "32px 0",
  textAlign: "center" as const,
}

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "1",
  margin: "0 8px 12px 8px",
  padding: "12px 24px",
  textDecoration: "none",
}

const secondaryButton = {
  backgroundColor: "#ffffff",
  border: "2px solid #2563eb",
  borderRadius: "6px",
  color: "#2563eb",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "1",
  margin: "0 8px 12px 8px",
  padding: "10px 24px",
  textDecoration: "none",
}

const hr = {
  border: "none",
  borderTop: "1px solid #e2e8f0",
  margin: "32px 0",
}

const footerText = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
}

const footer = {
  borderTop: "1px solid #e2e8f0",
  padding: "24px 32px",
}

const footerHr = {
  border: "none",
  borderTop: "1px solid #e2e8f0",
  margin: "16px 0",
}

const footerSmall = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
  textAlign: "center" as const,
}

const link = {
  color: "#2563eb",
  textDecoration: "underline",
}

export default ShipmentStatusUpdateEmail
