import DocumentsList from '@/components/dashboard/DocumentsList'
import { checkPermission } from '@/config/auth'
import React from 'react'

export default async function page() {
   await checkPermission("documents.read")
  return (
    <DocumentsList/>
  )
}
