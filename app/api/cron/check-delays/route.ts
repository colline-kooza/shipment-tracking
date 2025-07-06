import { scheduledDelayCheck } from "@/utils/cron-scheduler";
import { type NextRequest, NextResponse } from "next/server";

// This API route can be called by external cron services
// or Vercel Cron Jobs to check for delayed shipments

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization here
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await scheduledDelayCheck();

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Cron job error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Cron job failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Same as GET but for POST requests (some cron services prefer POST)
  return GET(request);
}
