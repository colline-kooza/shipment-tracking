// actions/emails.ts
"use server";

import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import ShipmentStatusEmail from "@/components/email-templates/shipment-update-email";
import ShipmentReceiptEmail from "@/components/email-templates/shipment-email";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY!);

// Base URL for links in emails
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface SendReceiptEmailParams {
  shipment: any; // Replace with your actual shipment type
  toEmail: string;
  toName?: string;
}

/**
 * Server action to send a shipment receipt email
 */
export async function sendShipmentReceiptEmail({
  shipment,
  toEmail,
  toName,
}: SendReceiptEmailParams) {
  try {
    // Check authentication for admin routes
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized access");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      throw new Error("Invalid email address format");
    }

    // Send the email using the React Email component
    const { data, error } = await resend.emails.send({
      from: "Greenlink Freight Logistics <info@desishub.com>", // Update with your verified domain
      to: [toEmail],
      subject: `Shipment Receipt #${shipment.trackingNumber}`,
      react: ShipmentReceiptEmail({
        shipment,
        baseUrl: BASE_URL,
      }),
    });

    if (error) {
      console.error("Email sending error:", error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send receipt email:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to send email"
    );
  }
}

/**
 * Server action to send a shipment status update email
 */
export async function sendShipmentStatusUpdateEmail({
  shipment,
  toEmail,
  toName,
  newStatus,
  statusNote,
}: SendReceiptEmailParams & {
  newStatus: string;
  statusNote?: string;
}) {
  try {
    // Check authentication for admin routes
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized access");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      throw new Error("Invalid email address format");
    }

    // Send the email using the status update template
    const { data, error } = await resend.emails.send({
      from: "Greenlink Freight Logistics <info@desishub.com>", // Update with your verified domain
      to: [toEmail],
      subject: `Shipment #${shipment.trackingNumber} Status Update: ${getStatusDisplay(newStatus)}`,
      react: ShipmentStatusEmail({
        shipment,
        baseUrl: BASE_URL,
        newStatus,
        statusNote,
        customerName: toName,
      }),
    });

    if (error) {
      console.error("Email sending error:", error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send status update email:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to send email"
    );
  }
}

// Helper function to get user-friendly status display
function getStatusDisplay(status: string): string {
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
}
