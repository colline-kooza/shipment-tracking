import { getShipmentsNeedingAttention } from "@/actions/enhanced-shipment-actions"
import DelayNotificationPanel from "./delay-notification-panel"

export default async function DelayNotificationContainer() {
  const shipmentsResult = await getShipmentsNeedingAttention()

  return (
    <DelayNotificationPanel
      initialShipmentsData={
        shipmentsResult.success && shipmentsResult.data !== undefined
          ? shipmentsResult.data
          : null
      }
    />
  )
}
