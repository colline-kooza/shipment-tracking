import SeaFreightPage from '@/components/dashboard/SeaFreightPage'
import { checkPermission } from '@/config/auth'
import React from 'react'

export default async function page() {
    await checkPermission("sea_freight.read")

  return (
    <div>
      <SeaFreightPage/>
    </div>
  )
}
