import AirFreightPage from '@/components/dashboard/AirFreightPage'
import { checkPermission } from '@/config/auth'
import React from 'react'

export default async function page() {
      await checkPermission("air_freight.read")
  
  return (
    <div>
      <AirFreightPage/>
    </div>
  )
}
