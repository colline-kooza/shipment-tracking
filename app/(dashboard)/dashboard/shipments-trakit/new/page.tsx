import NewShipment from '@/components/dashboard/NewShipment'
import { checkPermission } from '@/config/auth'
import React from 'react'

export default async function page() {
      await checkPermission("documents.create")
  
  return (
    <div>
      <NewShipment/>
    </div>
  )
}
