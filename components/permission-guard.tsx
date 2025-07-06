"use client"

import { useSession } from "next-auth/react"
import type { ReactNode } from "react"

interface PermissionGuardProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { data: session } = useSession()

  if (!session?.user?.permissions) {
    return <>{fallback}</>
  }

  const hasPermission = session.user.permissions.includes(permission)

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface MultiplePermissionGuardProps {
  permissions: string[]
  requireAll?: boolean // true = require all permissions, false = require any permission
  children: ReactNode
  fallback?: ReactNode
}

export function MultiplePermissionGuard({
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: MultiplePermissionGuardProps) {
  const { data: session } = useSession()

  if (!session?.user?.permissions) {
    return <>{fallback}</>
  }

  const userPermissions = session.user.permissions

  const hasPermission = requireAll
    ? permissions.every((permission) => userPermissions.includes(permission))
    : permissions.some((permission) => userPermissions.includes(permission))

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
