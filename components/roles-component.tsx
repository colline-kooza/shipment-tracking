"use client"

import { useState } from "react"
import { Plus, Search, Shield, Users, Edit, Trash2, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { permissions } from "@/config/permissions"
import { createRole, updateRole, deleteRole } from "@/actions/roles"
import { toast } from "sonner"

// Type definitions
type Role = {
  id: string
  displayName: string
  roleName: string
  description?: string
  permissions: string[]
  users: Array<{
    id: string
    name: string
    email: string
  }>
  createdAt: string
  updatedAt: string
}

type NewRoleData = {
  displayName: string
  roleName: string
  description: string
  permissions: string[]
}

type EditRoleData = {
  id: string
  displayName: string
  roleName: string
  description: string
  permissions: string[]
}

export default function RolesComponent({ roles }: { roles: Role[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddRole, setShowAddRole] = useState(false)
  const [showEditRole, setShowEditRole] = useState(false)
  const [showDeleteRole, setShowDeleteRole] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const [newRole, setNewRole] = useState<NewRoleData>({
    displayName: "",
    roleName: "",
    description: "",
    permissions: [],
  })

  const [editRole, setEditRole] = useState<EditRoleData>({
    id: "",
    displayName: "",
    roleName: "",
    description: "",
    permissions: [],
  })

  // Filter roles
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      searchQuery === "" ||
      role.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.roleName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const handleAddRole = async () => {
    setIsSubmitting(true)

    try {
      const result = await createRole(newRole)

      if (result.success) {
        toast.success("Role created successfully!")

        // Reset form and close modal
        setShowAddRole(false)
        setNewRole({
          displayName: "",
          roleName: "",
          description: "",
          permissions: [],
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Failed to create role:", error)
      toast.error("Failed to create role. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditRole = async () => {
    if (!selectedRole) return

    setIsSubmitting(true)

    try {
      const result = await updateRole(editRole)

      if (result.success) {
        toast.success("Role updated successfully!")

        // Close modal and reset state
        setShowEditRole(false)
        setSelectedRole(null)
        setEditRole({
          id: "",
          displayName: "",
          roleName: "",
          description: "",
          permissions: [],
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Failed to update role:", error)
      toast.error("Failed to update role. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!selectedRole) return

    setIsSubmitting(true)

    try {
      const result = await deleteRole(selectedRole.id)

      if (result.success) {
        toast.success("Role deleted successfully!")

        // Close modal and reset state
        setShowDeleteRole(false)
        setSelectedRole(null)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Failed to delete role:", error)
      toast.error("Failed to delete role. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (role: Role) => {
    setSelectedRole(role)
    setEditRole({
      id: role.id,
      displayName: role.displayName,
      roleName: role.roleName,
      description: role.description || "",
      permissions: role.permissions,
    })
    setShowEditRole(true)
  }

  const openDeleteModal = (role: Role) => {
    setSelectedRole(role)
    setShowDeleteRole(true)
  }

  const handlePermissionChange = (permission: string, checked: boolean, isEdit = false) => {
    if (isEdit) {
      setEditRole((prev) => ({
        ...prev,
        permissions: checked ? [...prev.permissions, permission] : prev.permissions.filter((p) => p !== permission),
      }))
    } else {
      setNewRole((prev) => ({
        ...prev,
        permissions: checked ? [...prev.permissions, permission] : prev.permissions.filter((p) => p !== permission),
      }))
    }
  }

  const handleModulePermissionChange = (modulePermissions: string[], checked: boolean, isEdit = false) => {
    if (isEdit) {
      setEditRole((prev) => ({
        ...prev,
        permissions: checked
          ? [...new Set([...prev.permissions, ...modulePermissions])]
          : prev.permissions.filter((p) => !modulePermissions.includes(p)),
      }))
    } else {
      setNewRole((prev) => ({
        ...prev,
        permissions: checked
          ? [...new Set([...prev.permissions, ...modulePermissions])]
          : prev.permissions.filter((p) => !modulePermissions.includes(p)),
      }))
    }
  }

  const getPermissionLabel = (permission: string): string => {
    return permission
      .split(".")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const generateRoleName = (displayName: string) => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
  }

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
        <Button onClick={() => setShowAddRole(true)}>
          <Plus size={16} className="mr-2" />
          Add Role
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search roles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Add Role Modal */}
      <Dialog open={showAddRole} onOpenChange={setShowAddRole}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>Create a new role and assign permissions to it.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <Input
                type="text"
                value={newRole.displayName}
                onChange={(e) => {
                  const displayName = e.target.value
                  setNewRole({
                    ...newRole,
                    displayName,
                    roleName: generateRoleName(displayName),
                  })
                }}
                placeholder="e.g., Shipment Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name (System)</label>
              <Input
                type="text"
                value={newRole.roleName}
                onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
                placeholder="e.g., shipment_manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Describe what this role can do..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
              <div className="space-y-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                {permissions.map((module) => {
                  const modulePermissions = Object.values(module.permissions)
                  const selectedCount = modulePermissions.filter((p) => newRole.permissions.includes(p)).length
                  const isAllSelected = selectedCount === modulePermissions.length
                  const isPartialSelected = selectedCount > 0 && selectedCount < modulePermissions.length

                  return (
                    <div key={module.name} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`module-${module.name}`}
                          checked={isAllSelected}
                          onCheckedChange={(checked) =>
                            handleModulePermissionChange(modulePermissions, checked as boolean)
                          }
                          className={isPartialSelected ? "data-[state=checked]:bg-orange-500" : ""}
                        />
                        <label htmlFor={`module-${module.name}`} className="text-sm font-medium text-gray-900">
                          {module.display}
                          {isPartialSelected && (
                            <span className="text-orange-500 ml-1">
                              ({selectedCount}/{modulePermissions.length})
                            </span>
                          )}
                        </label>
                      </div>
                      <div className="ml-6 grid grid-cols-2 gap-2">
                        {Object.entries(module.permissions).map(([action, permission]) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission}
                              checked={newRole.permissions.includes(permission)}
                              onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                            />
                            <label htmlFor={permission} className="text-xs text-gray-600 capitalize">
                              {action}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRole(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddRole} disabled={isSubmitting || !newRole.displayName || !newRole.roleName}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={showEditRole} onOpenChange={setShowEditRole}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update the role information and permissions.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <Input
                type="text"
                value={editRole.displayName}
                onChange={(e) => setEditRole({ ...editRole, displayName: e.target.value })}
                placeholder="e.g., Shipment Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name (System)</label>
              <Input
                type="text"
                value={editRole.roleName}
                onChange={(e) => setEditRole({ ...editRole, roleName: e.target.value })}
                placeholder="e.g., shipment_manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={editRole.description}
                onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                placeholder="Describe what this role can do..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
              <div className="space-y-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                {permissions.map((module) => {
                  const modulePermissions = Object.values(module.permissions)
                  const selectedCount = modulePermissions.filter((p) => editRole.permissions.includes(p)).length
                  const isAllSelected = selectedCount === modulePermissions.length
                  const isPartialSelected = selectedCount > 0 && selectedCount < modulePermissions.length

                  return (
                    <div key={module.name} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-module-${module.name}`}
                          checked={isAllSelected}
                          onCheckedChange={(checked) =>
                            handleModulePermissionChange(modulePermissions, checked as boolean, true)
                          }
                          className={isPartialSelected ? "data-[state=checked]:bg-orange-500" : ""}
                        />
                        <label htmlFor={`edit-module-${module.name}`} className="text-sm font-medium text-gray-900">
                          {module.display}
                          {isPartialSelected && (
                            <span className="text-orange-500 ml-1">
                              ({selectedCount}/{modulePermissions.length})
                            </span>
                          )}
                        </label>
                      </div>
                      <div className="ml-6 grid grid-cols-2 gap-2">
                        {Object.entries(module.permissions).map(([action, permission]) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${permission}`}
                              checked={editRole.permissions.includes(permission)}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(permission, checked as boolean, true)
                              }
                            />
                            <label htmlFor={`edit-${permission}`} className="text-xs text-gray-600 capitalize">
                              {action}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRole(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEditRole} disabled={isSubmitting || !editRole.displayName || !editRole.roleName}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Modal */}
      <Dialog open={showDeleteRole} onOpenChange={setShowDeleteRole}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{selectedRole?.displayName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteRole(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roles Grid */}
      {!roles || roles.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 mt-4" />
              <Skeleton className="h-16 w-full mt-4" />
              <div className="mt-4 flex justify-end">
                <Skeleton className="h-8 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No roles found matching your search criteria.</p>
            </div>
          ) : (
            filteredRoles.map((role) => (
              <Card key={role.id} className="p-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-medium text-xl">
                    <Shield size={20} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{role.displayName}</h3>
                    <p className="text-sm text-gray-500">{role.roleName}</p>
                  </div>
                </div>

                {role.description && <p className="mt-3 text-sm text-gray-600">{role.description}</p>}

                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Users size={12} className="mr-1" />
                    {role.users.length} users
                  </span>
                  <span className="text-sm text-gray-500">{role.permissions.length} permissions</span>
                </div>

                {/* Role Permissions */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {role.permissions.slice(0, 6).map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700"
                      >
                        <Check size={10} className="mr-1 text-green-500" />
                        {getPermissionLabel(permission)}
                      </span>
                    ))}
                    {role.permissions.length > 6 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-200 text-xs text-gray-600">
                        +{role.permissions.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(role)}>
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteModal(role)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
