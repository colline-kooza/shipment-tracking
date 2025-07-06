"use client"
import { useState } from "react"
import { Plus, Search, Filter, User, Building2, Mail, Phone, Edit, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomerQueries"
import type { CustomerFilters, CustomerListItem } from "@/actions/customers"
import { CustomerModal } from "./CustomerModal"

export default function CustomersComponent() {
  const [filters, setFilters] = useState<CustomerFilters>({
    searchQuery: "",
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<CustomerListItem | null>(null)

  const { data: customersResult, isLoading, error } = useCustomers(filters)
  const deleteCustomerMutation = useDeleteCustomer()

  const customers = customersResult?.success ? customersResult.data?.customers : []
  const totalCount = customersResult?.success ? customersResult.data?.totalCount : 0
  const totalPages = customersResult?.success ? customersResult.data?.totalPages : 0

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: value, page: 1 }))
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-")
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as "name" | "createdAt" | "shipments",
      sortOrder: sortOrder as "asc" | "desc",
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const openCreateModal = () => {
    setModalMode("create")
    setSelectedCustomer(null)
    setShowModal(true)
  }

  const openEditModal = (customer: CustomerListItem) => {
    setModalMode("edit")
    setSelectedCustomer(customer)
    setShowModal(true)
  }

  const openDeleteDialog = (customer: CustomerListItem) => {
    setCustomerToDelete(customer)
    setShowDeleteDialog(true)
  }

  const handleDelete = () => {
    if (customerToDelete) {
      deleteCustomerMutation.mutate(customerToDelete.id, {
        onSuccess: (response) => {
          if (response.success) {
            setShowDeleteDialog(false)
            setCustomerToDelete(null)
          }
        },
      })
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="container p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus size={16} />
          Add Customer
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="shipments-desc">Most Shipments</SelectItem>
                <SelectItem value="shipments-asc">Least Shipments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      {!isLoading && (
        <div className="text-sm text-gray-600">
          Showing {customers?.length} of {totalCount} customers
        </div>
      )}

      {/* Customers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-600">Failed to load customers. Please try again.</p>
        </Card>
      ) : customers?.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <User className="h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
              <p className="text-gray-600">
                {filters.searchQuery
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first customer"}
              </p>
            </div>
            {!filters.searchQuery && (
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers?.map((customer) => (
            <Card key={customer.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Customer Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      {customer.company ? (
                        <Building2 className="h-6 w-6 text-blue-600" />
                      ) : (
                        <User className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{customer.company || customer.name}</h3>
                      {customer.company && <p className="text-sm text-gray-600 truncate">Contact: {customer.name}</p>}
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-2">
                  {customer.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.consignee && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Consignee: {customer.consignee}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="mr-1 h-4 w-4" />
                    <span>{customer._count.shipments} shipments</span>
                  </div>
                  <div className="text-xs text-gray-500">Added {formatDate(customer.createdAt)}</div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(customer)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(customer)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={customer._count.shipments > 0}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages||0 > 1 && (
        <div className="flex justify-center space-x-2">
          <Button variant="outline" onClick={() => handlePageChange(filters.page! - 1)} disabled={filters.page === 1}>
            Previous
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              variant={filters.page === i + 1 ? "default" : "outline"}
              onClick={() => handlePageChange(i + 1)}
              className="w-10"
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => handlePageChange(filters.page! + 1)}
            disabled={filters.page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Customer Modal */}
      <CustomerModal open={showModal} onOpenChange={setShowModal} customer={selectedCustomer} mode={modalMode} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{customerToDelete?.name}"? This action cannot be undone.
              {customerToDelete && customerToDelete._count.shipments > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-800 text-sm">
                  This customer has {customerToDelete._count.shipments} shipments and cannot be deleted.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCustomerMutation.isPending || (customerToDelete?._count.shipments ?? 0) > 0}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCustomerMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
