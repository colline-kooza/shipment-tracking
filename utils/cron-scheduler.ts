"use server";

import { checkAndNotifyDelayedShipments } from "@/actions/notification-actions";

// This would typically be called by a cron job or scheduled task
// You can use Vercel Cron Jobs, GitHub Actions, or any other scheduler

export async function scheduledDelayCheck() {
  console.log("Running scheduled delay check...", new Date().toISOString());

  try {
    const result = await checkAndNotifyDelayedShipments();

    console.log("Scheduled delay check completed:", result);

    return result;
  } catch (error) {
    console.error("Scheduled delay check failed:", error);
    return {
      success: false,
      message: "Scheduled delay check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Helper function to check if it's time to run the delay check
// This can be called more frequently and will only run the actual check once per day
export async function conditionalDelayCheck() {
  const now = new Date();
  const hour = now.getHours();

  // Only run at 9 AM (adjust as needed)
  if (hour === 9) {
    return await scheduledDelayCheck();
  }

  return {
    success: true,
    message: "Not time for delay check",
    data: { currentHour: hour, targetHour: 9 },
  };
}
