"use server";

import ShipmentDelayNotification from "@/components/emails/shipment-delay-notification";
import ShipmentStatusUpdate from "@/components/emails/shipment-status-update";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type DelayNotificationData = {
  shipment: {
    reference: string;
    trackingNumber?: string;
    client: string;
    origin: string;
    destination: string;
    arrivalDate: Date;
    status: string;
    daysDelayed: number;
  };
  customerName: string;
  customerEmail: string;
};

export type StatusUpdateNotificationData = {
  shipment: {
    reference: string;
    trackingNumber?: string;
    client: string | null;
    origin: string;
    destination: string;
    status: string;
    previousStatus: string;
  };
  staffName: string;
  staffEmail: string;
  updateNotes?: string;
  updatedBy: any;
};

export async function sendDelayNotification(data: DelayNotificationData) {
  try {
    const response = await resend.emails.send({
      from: "Trakit Notifications <info@lubegajovan.com>",
      to: [data.customerEmail],
      subject: `Shipment Delay Alert - ${data.shipment.reference}`,
      react: ShipmentDelayNotification(data),
    });

    return {
      success: true,
      data: response,
      error: null,
    };
  } catch (error) {
    console.error("Failed to send delay notification:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendStatusUpdateNotification(
  data: StatusUpdateNotificationData
) {
  try {
    const response = await resend.emails.send({
      from: "Trakit System <info@lubegajovan.com>",
      to: [data.staffEmail],
      subject: `Shipment Status Update - ${data.shipment.reference}`,
      react: ShipmentStatusUpdate(data),
    });

    return {
      success: true,
      data: response,
      error: null,
    };
  } catch (error) {
    console.error("Failed to send status update notification:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendBulkStatusUpdateNotifications(
  notifications: StatusUpdateNotificationData[]
) {
  const results = await Promise.allSettled(
    notifications.map((notification) =>
      sendStatusUpdateNotification(notification)
    )
  );

  const successful = results.filter(
    (result) => result.status === "fulfilled" && result.value.success
  ).length;

  const failed = results.length - successful;

  return {
    total: results.length,
    successful,
    failed,
    results,
  };
}
