// emails/ShipmentReceipt.tsx
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

interface ShipmentEmailTemplateProps {
  shipment: {
    id: string;
    trackingNumber: string;
    referenceNumber?: string | null;
    description: string;
    packageType: string;
    goodsType: string;
    quantity: number;
    weight: number;
    valueDeclared?: number | null;
    marketValue?: number | null;
    condition: string;
    storageFee?: number | null;
    currentStatus: string;
    createdAt: string | Date;
    customer: {
      name: string;
      email?: string | null;
      phone?: string | null;
      contactPerson?: string | null;
      company?: string | null;
      passport?: string | null;
      country?: string | null;
    };
  };
  baseUrl: string;
}

// Format date function
const formatDate = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM dd, yyyy");
};

// Format currency
const formatCurrency = (amount?: number | null) => {
  if (amount === undefined || amount === null) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Get package type display name
const getPackageType = (type: string) => {
  const types: Record<string, string> = {
    METALS: "Metals",
    WOODEN: "Wooden",
    CARTON: "Carton",
    BAG: "Bag",
  };
  return types[type] || type;
};

// Get goods type display name
const getGoodsType = (type: string) => {
  const types: Record<string, string> = {
    COMMERCIAL: "Commercial Samples",
    PERSONAL: "Personal",
    FRAGILE: "Fragile Goods",
    OTHER: "Other",
  };
  return types[type] || type;
};

// Get condition display name
const getCondition = (condition: string) => {
  const conditions: Record<string, string> = {
    GOOD: "Good",
    FAIR: "Fair",
    AVERAGE: "Average",
    AS_RECEIVED: "As Received",
  };
  return conditions[condition] || condition;
};

export const ShipmentReceiptEmail = ({
  shipment,
  baseUrl = "https://greenlinkfreightlogistics.com",
}: ShipmentEmailTemplateProps) => {
  const trackingUrl = `${baseUrl}/?number=${shipment.trackingNumber}`;
  const receiptUrl = `${baseUrl}/shipments/${shipment.id}`;

  return (
    <Html>
      <Head />
      <Preview>
        Greenlink Freight Logistics - Shipment Receipt #
        {shipment.trackingNumber}
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
            <Heading style={heading}>SAFE KEEPING RECEIPT (SKR)</Heading>
            <Text style={receiptNumberText}>
              Tracking Number: <strong>{shipment.trackingNumber}</strong>
            </Text>
          </Section>

          <Section style={section}>
            <Text style={paragraph}>
              Thank you for choosing Greenlink Freight Logistics. We confirm
              that we have received the following items in our safekeeping.
            </Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={subheading}>
              Depositor's Details
            </Heading>

            <Row>
              <Column>
                <Text style={labelText}>Company/Name:</Text>
                <Text style={valueText}>
                  {shipment.customer.company || shipment.customer.name}
                </Text>

                <Text style={labelText}>Representative:</Text>
                <Text style={valueText}>
                  {shipment.customer.contactPerson || shipment.customer.name}
                </Text>

                <Text style={labelText}>Country:</Text>
                <Text style={valueText}>
                  {shipment.customer.country || "—"}
                </Text>

                <Text style={labelText}>Email:</Text>
                <Text style={valueText}>{shipment.customer.email || "—"}</Text>
              </Column>

              <Column>
                <Text style={labelText}>Reference Number:</Text>
                <Text style={valueText}>{shipment.referenceNumber || "—"}</Text>

                <Text style={labelText}>Passport:</Text>
                <Text style={valueText}>
                  {shipment.customer.passport || "—"}
                </Text>

                <Text style={labelText}>Tracking Link:</Text>
                <Link style={linkText} href={trackingUrl}>
                  www.greenlinkfreightlogistics.com
                </Link>

                <Text style={labelText}>Phone:</Text>
                <Text style={valueText}>{shipment.customer.phone || "—"}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={subheading}>
              Shipment Details
            </Heading>

            <table style={table}>
              <thead>
                <tr>
                  <th style={tableHeader}>Description</th>
                  <th style={tableHeader}>Quantity</th>
                  <th style={tableHeader}>Weight</th>
                  <th style={tableHeader}>Value</th>
                  <th style={tableHeader}>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tableCell}>{shipment.description}</td>
                  <td style={tableCell}>{shipment.quantity}</td>
                  <td style={tableCell}>{shipment.weight} kg</td>
                  <td style={tableCell}>
                    {shipment.valueDeclared
                      ? formatCurrency(shipment.valueDeclared)
                      : shipment.marketValue
                        ? formatCurrency(shipment.marketValue)
                        : "—"}
                  </td>
                  <td style={tableCell}>{formatDate(shipment.createdAt)}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={section}>
            <Row>
              <Column>
                <Text style={labelText}>Package Type:</Text>
                <Text style={valueText}>
                  {getPackageType(shipment.packageType)}
                </Text>
              </Column>
              <Column>
                <Text style={labelText}>Goods Type:</Text>
                <Text style={valueText}>
                  {getGoodsType(shipment.goodsType)}
                </Text>
              </Column>
              <Column>
                <Text style={labelText}>Condition:</Text>
                <Text style={valueText}>
                  {getCondition(shipment.condition)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Section style={storageFeeSection}>
            <Text style={storageFeeText}>
              STORAGE FEES: USD {shipment.storageFee || 5}/KG PER DAY
            </Text>
          </Section>

          <Section style={actionSection}>
            <Button href={trackingUrl} style={primaryButton}>
              Track Cargo
            </Button>
            <Button href={receiptUrl} style={secondaryButton}>
              View Receipt
            </Button>
          </Section>

          <Section style={section}>
            <Text style={smallText}>
              This Safe Keeping Receipt confirms that the commodity (ies)
              /property(ies)/items/ goods specified herein was/were deposited to
              and recorded by "The Customs" Staff in the presence of the above
              stated Depositor. Access to commodity is limited to depositor.
              Identification will be required before allowing access to the
              commodity (ies)/item(s) /Goods and we may refuse access if not
              satisfied with the form of identification produced.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>NB: Valid Only in Original</Text>
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

const receiptNumberText = {
  color: "#4a4a4a",
  fontSize: "16px",
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

const subheading = {
  color: "#2e7d32",
  fontSize: "18px",
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
  fontSize: "16px",
  marginBottom: "12px",
};

const linkText = {
  color: "#2e7d32",
  fontSize: "16px",
  marginBottom: "12px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const tableHeader = {
  backgroundColor: "#f5f5f5",
  padding: "8px",
  textAlign: "left" as const,
  borderBottom: "1px solid #e0e0e0",
  color: "#757575",
  fontSize: "14px",
};

const tableCell = {
  padding: "8px",
  borderBottom: "1px solid #e0e0e0",
  color: "#4a4a4a",
  fontSize: "14px",
};

const storageFeeSection = {
  backgroundColor: "#f1f8e9",
  padding: "15px",
  textAlign: "center" as const,
  borderBottom: "1px solid #e0e0e0",
};

const storageFeeText = {
  color: "#2e7d32",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
};

const actionSection = {
  backgroundColor: "#ffffff",
  padding: "30px 20px",
  textAlign: "center" as const,
};

const primaryButton = {
  backgroundColor: "#2e7d32",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 30px",
  margin: "0 10px",
};

const secondaryButton = {
  backgroundColor: "#ffffff",
  borderRadius: "4px",
  border: "1px solid #2e7d32",
  color: "#2e7d32",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 30px",
  margin: "0 10px",
};

const smallText = {
  color: "#757575",
  fontSize: "12px",
  lineHeight: "18px",
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

export default ShipmentReceiptEmail;
