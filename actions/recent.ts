"use server";

import { db } from "@/prisma/db";

/**
 * Get recent customers
 * @param limit Number of customers to return
 * @returns Array of recent customers
 */
export async function getRecentCustomers(limit: number = 3) {
  try {
    const customers = await db.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        createdAt: true,
      },
    });

    return { success: true, data: customers };
  } catch (error) {
    console.error("Failed to fetch recent customers:", error);
    return { success: false, error: "Failed to fetch recent customers" };
  }
}

/**
 * Get recent shipments
 * @param limit Number of shipments to return
 * @returns Array of recent shipments
 */
export async function getRecentShipments(limit: number = 3) {
  try {
    const shipments = await db.shipment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      
    });

    return { success: true, data: shipments };
  } catch (error) {
    console.error("Failed to fetch recent shipments:", error);
    return { success: false, error: "Failed to fetch recent shipments" };
  }
}
