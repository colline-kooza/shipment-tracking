"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { manualDelayCheck } from "@/actions/notification-actions"
import { toast } from "sonner"

// Define types for better type safety
type ShipmentData = {
  delayed: Array<{
    id: string;
    reference: string;
    client: string | null;
    daysDelayed: number;
  }>;
  pendingDocuments: Array<{
    id: string;
    reference: string;
    client: string | null;
    documents: Array<any>;
  }>;
};


interface DelayNotificationPanelProps {
  initialShipmentsData: ShipmentData | null
}

export default function DelayNotificationPanel({ initialShipmentsData }: DelayNotificationPanelProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheckResult, setLastCheckResult] = useState<any>(null)
  const [shipmentsNeedingAttention, setShipmentsNeedingAttention] = useState<ShipmentData | null>(initialShipmentsData)
  const [isLoadingAttention, setIsLoadingAttention] = useState(false)

  const handleManualCheck = async () => {
    setIsChecking(true)
    try {
      const result = await manualDelayCheck()
      setLastCheckResult(result)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message || "Failed to check delayed shipments")
      }
    } catch (error) {
      toast.error("An error occurred while checking delayed shipments")
    } finally {
      setIsChecking(false)
    }
  }

  
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
            <div>
              <h3 className="font-medium">Manual Delay Check</h3>
              <p className="text-sm text-muted-foreground">
                Manually trigger a check for delayed shipments and send notifications
              </p>
            </div>
            <Button onClick={handleManualCheck} disabled={isChecking} className="flex items-center gap-2">
              {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
              {isChecking ? "Checking..." : "Check Now"}
            </Button>
          </div>

          {lastCheckResult && (
            <Alert className={lastCheckResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {lastCheckResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={lastCheckResult.success ? "text-green-800" : "text-red-800"}>
                  {lastCheckResult.message}
                  {lastCheckResult.data && (
                    <div className="mt-2 text-sm">
                      <p>Total delayed: {lastCheckResult.data.totalDelayed}</p>
                      <p>Notifications sent: {lastCheckResult.data.notificationsSent}</p>
                      {lastCheckResult.data.notificationsFailed > 0 && (
                        <p>Failed notifications: {lastCheckResult.data.notificationsFailed}</p>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
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
          {isLoadingAttention ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : shipmentsNeedingAttention ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-red-600 mb-2">
                  Delayed Shipments ({shipmentsNeedingAttention.delayed?.length || 0})
                </h4>
                {shipmentsNeedingAttention.delayed?.length > 0 ? (
                  <div className="space-y-2">
                    {shipmentsNeedingAttention.delayed.slice(0, 5).map((shipment) => (
                      <div
                        key={shipment.id}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                      >
                        <div>
                          <p className="font-medium">{shipment.reference}</p>
                          <p className="text-sm text-muted-foreground">{shipment.client}</p>
                        </div>
                        <Badge variant="destructive">
                          {shipment.daysDelayed} day{shipment.daysDelayed > 1 ? "s" : ""} delayed
                        </Badge>
                      </div>
                    ))}
                    {shipmentsNeedingAttention.delayed.length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        And {shipmentsNeedingAttention.delayed.length - 5} more...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No delayed shipments</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-yellow-600 mb-2">
                  Pending Documents ({shipmentsNeedingAttention.pendingDocuments?.length || 0})
                </h4>
                {shipmentsNeedingAttention.pendingDocuments?.length > 0 ? (
                  <div className="space-y-2">
                    {shipmentsNeedingAttention.pendingDocuments.slice(0, 5).map((shipment) => (
                      <div
                        key={shipment.id}
                        className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <div>
                          <p className="font-medium">{shipment.reference}</p>
                          <p className="text-sm text-muted-foreground">{shipment.client}</p>
                        </div>
                        <Badge variant="secondary">
                          {shipment.documents.length} pending doc{shipment.documents.length > 1 ? "s" : ""}
                        </Badge>
                      </div>
                    ))}
                    {shipmentsNeedingAttention.pendingDocuments.length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        And {shipmentsNeedingAttention.pendingDocuments.length - 5} more...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending documents</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Failed to load data</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
