"use client"

import { useState, useEffect } from "react"
import { User, Mail, MapPin, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomerQueries"
import type { CreateCustomerDTO, UpdateCustomerDTO } from "@/actions/customers"
import { Customer } from "@prisma/client"



interface CustomerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  mode: "create" | "edit"
}

export function CustomerModal({ open, onOpenChange, customer, mode }: CustomerModalProps) {
  const [formData, setFormData] = useState<CreateCustomerDTO>({
    name: "",
    email: "",
    phone: "",
    contactPerson: "",
    address: "",
    country: "",
    passport: "",
    company: "",
    consignee: "",
    notes: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CreateCustomerDTO, string>>>({})

  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Reset form when modal opens/closes or customer changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && customer) {
        setFormData({
          name: customer.name || "",
          email: customer.email || "",
          phone: customer.phone || "",
          contactPerson: customer.contactPerson || "",
          address: customer.address || "",
          country: customer.country || "",
          passport: customer.passport || "",
          company: customer.company || "",
          consignee: customer.consignee || "",
          notes: customer.notes || "",
        })
      } else {
        setFormData({
          name: "",
          email: "",
          phone: "",
          contactPerson: "",
          address: "",
          country: "",
          passport: "",
          company: "",
          consignee: "",
          notes: "",
        })
      }
      setErrors({})
    }
  }, [open, mode, customer])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateCustomerDTO, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Customer name is required"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    if (mode === "create") {
      createMutation.mutate(formData, {
        onSuccess: (response) => {
          if (response.success) {
            onOpenChange(false)
          }
        },
      })
    } else if (mode === "edit" && customer) {
      const updateData: UpdateCustomerDTO = {
        id: customer.id,
        ...formData,
      }
      updateMutation.mutate(updateData, {
        onSuccess: (response) => {
          if (response.success) {
            onOpenChange(false)
          }
        },
      })
    }
  }

  const handleInputChange = (field: keyof CreateCustomerDTO, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Customer" : "Edit Customer"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to create a new customer."
              : "Update the customer information below."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <User className="mr-2 h-4 w-4" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter customer name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Enter company name (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                  placeholder="Enter contact person name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consignee">Default Consignee</Label>
                <Input
                  id="consignee"
                  value={formData.consignee}
                  onChange={(e) => handleInputChange("consignee", e.target.value)}
                  placeholder="Enter default consignee"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Address Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="Enter country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passport">Passport/ID Number</Label>
                  <Input
                    id="passport"
                    value={formData.passport}
                    onChange={(e) => handleInputChange("passport", e.target.value)}
                    placeholder="Enter passport or ID number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Additional Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Enter any additional notes or comments"
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : mode === "create" ? (
              "Create Customer"
            ) : (
              "Update Customer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
