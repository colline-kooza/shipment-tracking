import ShipmentsList from '@/components/dashboard/shipment-listing'
import { checkPermission } from '@/config/auth'
import React from 'react'

export default async function page() {
    await checkPermission("shipments.read")
  
  return (
    <div>
      <ShipmentsList/>
    </div>
  )
}
