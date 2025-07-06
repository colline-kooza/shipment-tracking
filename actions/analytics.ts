"use server";
import { db } from "@/prisma/db";

export type AnalyticsProps = {
  title: string;
  total: number;
  href: string;
  icon: any;
  isCurrency?: boolean;
};
export type Stat = {
  customers: number;
  shipments: number;
  users: number;
  revenue: number;
};
export async function getDashboardStats() {
  try {
    const customers = await db.customer.count();
    const users = await db.user.count();
    const shipments = await db.shipment.count();
    const revenue = 0;
    const stats = {
      customers,
      shipments,
      users,
      revenue,
    };

    return stats;
  } catch (error) {
    console.log(error);
    return {
      customers: 0,
      shipments: 0,
      users: 0,
      revenue: 0,
    };
  }
}
