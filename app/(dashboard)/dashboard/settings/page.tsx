import Settings from '@/components/dashboard/Settings'
import { checkPermission } from '@/config/auth'
import React from 'react'

export default async function page() {
    await checkPermission("settings.read")
  
  return (
    <div>
      <Settings/>
    </div>
  )
}
