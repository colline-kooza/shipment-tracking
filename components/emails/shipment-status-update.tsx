import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from "@react-email/components"

interface ShipmentStatusUpdateProps {
  shipment: {
    reference: string
    trackingNumber?: string
    client: string
    origin: string
    destination: string
    status: string
    previousStatus: string
  }
  staffName: string
  staffEmail: string
  updateNotes?: string
  updatedBy: string
}

export const ShipmentStatusUpdate = ({
  shipment,
  staffName,
  staffEmail,
  updateNotes,
  updatedBy,
}: ShipmentStatusUpdateProps) => {
  const previewText = `Shipment ${shipment.reference} status updated to ${shipment.status.replace(/_/g, " ")}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Row>
              <Column>
                <Img
                  src="/images/trakit-logo.png"
                  width="150"
                  height="50"
                  alt="Trakit Logo"
                  style={logo}
                />
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Shipment Status Update</Heading>

            <Text style={text}>Hello {staffName},</Text>

            <Text style={text}>A shipment status has been updated in the system. Please review the details below:</Text>

            {/* Status Change Alert */}
            <Section style={statusChangeCard}>
              <Row>
                <Column style={{ width: "45%", textAlign: "center" as const }}>
                  <Text style={statusLabel}>Previous Status</Text>
                  <Text style={previousStatus}>{shipment.previousStatus.replace(/_/g, " ")}</Text>
                </Column>
                <Column style={{ width: "10%", textAlign: "center" as const }}>
                  <Text style={arrow}>→</Text>
                </Column>
                <Column style={{ width: "45%", textAlign: "center" as const }}>
                  <Text style={statusLabel}>New Status</Text>
                  <Text style={newStatus}>{shipment.status.replace(/_/g, " ")}</Text>
                </Column>
              </Row>
            </Section>

            {/* Shipment Details Card */}
            <Section style={shipmentCard}>
              <Heading style={h2}>Shipment Details</Heading>

              <Row style={detailRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Reference Number:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{shipment.reference}</Text>
                </Column>
              </Row>

              {shipment.trackingNumber && (
                <Row style={detailRow}>
                  <Column style={labelColumn}>
                    <Text style={label}>Tracking Number:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{shipment.trackingNumber}</Text>
                  </Column>
                </Row>
              )}

              <Row style={detailRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Client:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{shipment.client}</Text>
                </Column>
              </Row>

              <Row style={detailRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Route:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>
                    {shipment.origin} → {shipment.destination}
                  </Text>
                </Column>
              </Row>

              <Row style={detailRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Updated By:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{updatedBy}</Text>
                </Column>
              </Row>
            </Section>

            {updateNotes && (
              <Section style={notesCard}>
                <Heading style={h3}>Update Notes</Heading>
                <Text style={notesText}>{updateNotes}</Text>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link
                style={button}
                href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments-trakit/${shipment.reference}`}
              >
                View Shipment Details
              </Link>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              This is an automated notification from the Trakit system. Please log in to the dashboard for more detailed
              information.
            </Text>

            <Text style={footer}>
              Best regards,
              <br />
              The Trakit System
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>© 2024 Trakit. All rights reserved.</Text>
            <Text style={footerText}>This email was sent to {staffEmail}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles (reusing many from the delay notification)
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
}

const header = {
  padding: "20px 30px",
  backgroundColor: "#0f2557",
}

const logo = {
  margin: "0 auto",
}

const content = {
  padding: "30px 30px 40px",
}

const h1 = {
  color: "#0f2557",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  textAlign: "center" as const,
}

const h2 = {
  color: "#0f2557",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 15px",
}

const h3 = {
  color: "#0f2557",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 10px",
}

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
}

const statusChangeCard = {
  backgroundColor: "#f0f9ff",
  border: "2px solid #0ea5e9",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
}

const statusLabel = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "500",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
}

const previousStatus = {
  backgroundColor: "#fee2e2",
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "600",
  padding: "8px 12px",
  borderRadius: "6px",
  textTransform: "uppercase" as const,
  margin: "0",
}

const newStatus = {
  backgroundColor: "#dcfce7",
  color: "#16a34a",
  fontSize: "14px",
  fontWeight: "600",
  padding: "8px 12px",
  borderRadius: "6px",
  textTransform: "uppercase" as const,
  margin: "0",
}

const arrow = {
  color: "#0ea5e9",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
}

const shipmentCard = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
}

const detailRow = {
  marginBottom: "12px",
}

const labelColumn = {
  width: "40%",
  verticalAlign: "top" as const,
}

const valueColumn = {
  width: "60%",
  verticalAlign: "top" as const,
}

const label = {
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
}

const value = {
  color: "#1e293b",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
}

const notesCard = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fbbf24",
  borderRadius: "8px",
  padding: "16px",
  margin: "20px 0",
}

const notesText = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  fontStyle: "italic",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#0f2557",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}

const hr = {
  borderColor: "#e2e8f0",
  margin: "32px 0",
}

const footer = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 12px",
}

const footerSection = {
  padding: "20px 30px",
  backgroundColor: "#f8fafc",
  borderTop: "1px solid #e2e8f0",
}

const footerText = {
  color: "#64748b",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0 0 8px",
}

export default ShipmentStatusUpdate
