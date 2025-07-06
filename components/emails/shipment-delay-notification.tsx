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

interface ShipmentDelayNotificationProps {
  shipment: {
    reference: string
    trackingNumber?: string
    client: string
    origin: string
    destination: string
    arrivalDate: Date
    status: string
    daysDelayed: number
  }
  customerName: string
  customerEmail: string
}

export const ShipmentDelayNotification = ({
  shipment,
  customerName,
  customerEmail,
}: ShipmentDelayNotificationProps) => {
  const previewText = `Your shipment ${shipment.reference} is delayed by ${shipment.daysDelayed} days`

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
            <Heading style={h1}>Shipment Delay Notification</Heading>

            <Text style={text}>Dear {customerName},</Text>

            <Text style={text}>
              We regret to inform you that your shipment has been delayed beyond the expected arrival date. We sincerely
              apologize for any inconvenience this may cause.
            </Text>

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
                  <Text style={label}>Expected Arrival:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{new Date(shipment.arrivalDate).toLocaleDateString()}</Text>
                </Column>
              </Row>

              <Row style={detailRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Current Status:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={statusBadge}>{shipment.status.replace(/_/g, " ")}</Text>
                </Column>
              </Row>

              <Row style={delayAlert}>
                <Column>
                  <Text style={delayText}>
                    ⚠️ Delayed by {shipment.daysDelayed} day{shipment.daysDelayed > 1 ? "s" : ""}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Text style={text}>
              Our team is working diligently to resolve this delay and get your shipment moving as quickly as possible.
              We will continue to monitor the situation closely and provide you with regular updates.
            </Text>

            <Text style={text}>You can track your shipment in real-time using the link below:</Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link
                style={button}
                href={`${process.env.NEXT_PUBLIC_APP_URL}/track/${shipment.trackingNumber || shipment.reference}`}
              >
                Track Your Shipment
              </Link>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              If you have any questions or concerns, please don't hesitate to contact our customer service team. We
              appreciate your patience and understanding.
            </Text>

            <Text style={footer}>
              Best regards,
              <br />
              The Trakit Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>© 2024 Trakit. All rights reserved.</Text>
            <Text style={footerText}>This email was sent to {customerEmail}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
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

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
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

const statusBadge = {
  backgroundColor: "#fef3c7",
  color: "#92400e",
  fontSize: "12px",
  fontWeight: "600",
  padding: "4px 8px",
  borderRadius: "4px",
  textTransform: "uppercase" as const,
  margin: "0",
}

const delayAlert = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "6px",
  padding: "12px",
  marginTop: "16px",
}

const delayText = {
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
  textAlign: "center" as const,
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

export default ShipmentDelayNotification
