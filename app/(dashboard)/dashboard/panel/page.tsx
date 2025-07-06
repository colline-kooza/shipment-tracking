import { getShipmentsNeedingAttention } from "@/actions/enhanced-shipment-actions"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Mail, Loader2 } from "lucide-react"
import DelayNotificationPanel from "@/components/dashboard/delay-notification-panel"
import { checkPermission } from "@/config/auth"

// Loading skeleton component
function DelayNotificationSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Delay Notification System
          </CardTitle>
          <CardDescription>Monitor and manage shipment delay notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-80" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Shipments Needing Attention
          </CardTitle>
          <CardDescription>Shipments that are delayed or have pending documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading shipments data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Error state component
function DelayNotificationError({ error }: { error: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Delay Notification System
          </CardTitle>
          <CardDescription>Monitor and manage shipment delay notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-medium">Manual Delay Check</h3>
              <p className="text-sm text-muted-foreground">
                Manually trigger a check for delayed shipments and send notifications
              </p>
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Shipments Needing Attention
          </CardTitle>
          <CardDescription>Shipments that are delayed or have pending documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <p className="font-medium text-red-600">Failed to Load Data</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main data fetching component
async function DelayNotificationContent() {
  const shipmentsResult = await getShipmentsNeedingAttention()
  
  if (!shipmentsResult.success) {
    return <DelayNotificationError error={shipmentsResult.error || "Unknown error occurred"} />
  }

  return (
    <DelayNotificationPanel
      initialShipmentsData={shipmentsResult.data || null}
    />
  )
}

export default async function DelayNotificationContainer() {
  
     await checkPermission("alert-panel.read")
  
  return (
    <Suspense fallback={<DelayNotificationSkeleton />}>
      <DelayNotificationContent />
    </Suspense>
  )
}