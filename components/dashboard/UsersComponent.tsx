"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Mail, User, MapPin, Shield, Loader2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { UserWithRoles, CreateUserData, UpdateUserData, RoleOption } from "@/types/user"
import { createUserWithRoles, getActiveRoles, updateUserWithRoles } from "@/actions/newUsers"

interface UsersComponentProps {
  users: UserWithRoles[]
}

export default function UsersComponent({ users }: UsersComponentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null)
  const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)

  const [newUser, setNewUser] = useState<CreateUserData>({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    roleIds: [],
    location: "",
  })

  const [editUser, setEditUser] = useState<UpdateUserData>({
    id: "",
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleIds: [],
    location: "",
  })

  // Load available roles when component mounts or modals open
  useEffect(() => {
    if (showAddUser || showEditUser) {
      loadAvailableRoles()
    }
  }, [showAddUser, showEditUser])

  const loadAvailableRoles = async () => {
    setLoadingRoles(true)
    try {
      const roles = await getActiveRoles()
      setAvailableRoles(roles)
    } catch (error) {
      console.error("Failed to load roles:", error)
      toast.error("Failed to load available roles")
    } finally {
      setLoadingRoles(false)
    }
  }

  // Get unique roles for filtering
  const uniqueRoles = Array.from(new Set(users.flatMap((user) => user.roles.map((role) => role.roleName))))

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || user.roles.some((role) => role.roleName === roleFilter)

    return matchesSearch && matchesRole
  })

  const handleAddUser = async () => {
    setIsSubmitting(true)
    try {
      const fullName = `${newUser.firstName} ${newUser.lastName}`.trim()
      const result = await createUserWithRoles({
        ...newUser,
        name: fullName,
      })

      if (result.success) {
        toast.success("User created successfully!")
        setShowAddUser(false)
        resetNewUserForm()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Failed to create user:", error)
      toast.error("Failed to create user. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      const fullName = `${editUser.firstName} ${editUser.lastName}`.trim()
      const result = await updateUserWithRoles({
        ...editUser,
        name: fullName,
      })

      if (result.success) {
        toast.success("User updated successfully!")
        setShowEditUser(false)
        setSelectedUser(null)
        resetEditUserForm()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      toast.error("Failed to update user. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetNewUserForm = () => {
    setNewUser({
      name: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      roleIds: [],
      location: "",
    })
  }

  const resetEditUserForm = () => {
    setEditUser({
      id: "",
      name: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      roleIds: [],
      location: "",
    })
  }

  const openEditModal = (user: UserWithRoles) => {
    setSelectedUser(user)
    setEditUser({
      id: user.id,
      name: user.name,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email,
      phone: user.phone ?? "",
      roleIds: user.roles.map((role) => role.id),
      location: user.location || "",
    })
    setShowEditUser(true)
  }

  const handleRoleToggle = (roleId: string, isNewUser = true) => {
    if (isNewUser) {
      setNewUser((prev) => ({
        ...prev,
        roleIds: prev.roleIds.includes(roleId) ? prev.roleIds.filter((id) => id !== roleId) : [...prev.roleIds, roleId],
      }))
    } else {
      setEditUser((prev) => ({
        ...prev,
        roleIds: prev.roleIds.includes(roleId) ? prev.roleIds.filter((id) => id !== roleId) : [...prev.roleIds, roleId],
      }))
    }
  }

  const getSelectedRolePermissions = (roleIds: string[]) => {
    const selectedRoles = availableRoles.filter((role) => roleIds.includes(role.id))
    const allPermissions = selectedRoles.flatMap((role) => role.permissions)
    return [...new Set(allPermissions)]
  }

  const getPermissionLabel = (permission: string): string => {
    return permission
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getRoleBadgeColor = (roleName: string) => {
    const colors = [
      "bg-purple-100 text-purple-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ]
    const index = roleName.length % colors.length
    return colors[index]
  }

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Button onClick={() => setShowAddUser(true)}>
          <Plus size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Add User Modal */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Fill in the details to create a new user account and assign roles.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    className="pl-10"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    className="pl-10"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  className="pl-10"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="tel"
                  className="pl-10"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="password"
                  className="pl-10"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  className="pl-10"
                  value={newUser.location}
                  onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
                  placeholder="Enter location (optional)"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Assign Roles</label>
              {loadingRoles ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto border rounded-md p-3">
                  {availableRoles.map((role) => (
                    <div key={role.id} className="flex items-start space-x-3 p-2 border rounded-md">
                      <Checkbox
                        id={`new-role-${role.id}`}
                        checked={newUser.roleIds.includes(role.id)}
                        onCheckedChange={() => handleRoleToggle(role.id, true)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`new-role-${role.id}`}
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          {role.displayName}
                        </label>
                        {role.description && <p className="text-xs text-gray-500 mt-1">{role.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {getPermissionLabel(permission)}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show combined permissions */}
              {newUser.roleIds.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Combined Permissions ({getSelectedRolePermissions(newUser.roleIds).length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {getSelectedRolePermissions(newUser.roleIds).map((permission) => (
                      <Badge key={permission} variant="default" className="text-xs">
                        {getPermissionLabel(permission)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={
                isSubmitting ||
                !newUser.firstName ||
                !newUser.lastName ||
                !newUser.email ||
                !newUser.password ||
                !newUser.phone ||
                newUser.roleIds.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user information and role assignments.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    className="pl-10"
                    value={editUser.firstName}
                    onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    className="pl-10"
                    value={editUser.lastName}
                    onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  className="pl-10"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="tel"
                  className="pl-10"
                  value={editUser.phone}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  className="pl-10"
                  value={editUser.location}
                  onChange={(e) => setEditUser({ ...editUser, location: e.target.value })}
                  placeholder="Enter location (optional)"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Assign Roles</label>
              {loadingRoles ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto border rounded-md p-3">
                  {availableRoles.map((role) => (
                    <div key={role.id} className="flex items-start space-x-3 p-2 border rounded-md">
                      <Checkbox
                        id={`edit-role-${role.id}`}
                        checked={editUser.roleIds.includes(role.id)}
                        onCheckedChange={() => handleRoleToggle(role.id, false)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`edit-role-${role.id}`}
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          {role.displayName}
                        </label>
                        {role.description && <p className="text-xs text-gray-500 mt-1">{role.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {getPermissionLabel(permission)}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show combined permissions */}
              {editUser.roleIds.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Combined Permissions ({getSelectedRolePermissions(editUser.roleIds).length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {getSelectedRolePermissions(editUser.roleIds).map((permission) => (
                      <Badge key={permission} variant="default" className="text-xs">
                        {getPermissionLabel(permission)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUser(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleEditUser}
              disabled={
                isSubmitting ||
                !editUser.firstName ||
                !editUser.lastName ||
                !editUser.email ||
                !editUser.phone ||
                editUser.roleIds.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Users Grid */}
      {!users || users.length === 0 ? (
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
          {filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No users found matching your search criteria.</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-xl">
                    {user.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* User Roles */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <Badge key={role.id} className={getRoleBadgeColor(role.roleName)} variant="secondary">
                        {role.displayName}
                      </Badge>
                    ))}
                  </div>
                  {user.location && (
                    <span className="text-sm text-gray-500 flex items-center mt-2">
                      <MapPin size={14} className="mr-1" />
                      {user.location}
                    </span>
                  )}
                </div>

                {/* User Permissions */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                    Permissions ({user.permissions.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.slice(0, 4).map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {getPermissionLabel(permission)}
                      </Badge>
                    ))}
                    {user.permissions.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.permissions.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                    <Edit size={14} className="mr-1" />
                    Edit User
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
