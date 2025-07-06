"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Package,
  Truck,
  FileText,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Check,
  PlaneLanding,
  Container,
  User,
  Info,
  Users,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type { DocumentUpload } from "@/components/docs/DocumentUploader"
import { useShipmentById, useUpdateShipment } from "@/hooks/useShipmentQueries2"
import { Skeleton } from "@/components/ui/skeleton"

// Define TypeScript types
export type ShipmentType = "SEA" | "AIR" | "ROAD"
export type Step = "type" | "details" | "documents" | "review"

// Updated FormData interface to handle nullable fields
interface FormData {
  type: ShipmentType
  client: string | null
  consignee: string | null
  reference: string
  trackingNumber: string | null
  origin: string
  destination: string
  arrivalDate: string
  container: string | null
  truck: string | null
  documents: DocumentUpload[]
}

interface StepInfo {
  id: Step
  label: string
  icon: React.ReactNode
}

interface ShipmentEditFormProps {
  id: string
}

const ShipmentEditForm: React.FC<ShipmentEditFormProps> = ({ id }) => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("details") // Start with details for edit
  const [formData, setFormData] = useState<FormData>({
    type: "SEA",
    client: null,
    consignee: null,
    reference: "",
    trackingNumber: null,
    origin: "",
    destination: "",
    arrivalDate: "",
    container: null,
    truck: null,
    documents: [],
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  // Fetch existing shipment data
  const { data: shipmentResponse, isLoading, error } = useShipmentById(id)
  const { mutate: updateShipment, isPending } = useUpdateShipment()
  const shipment = shipmentResponse?.success ? shipmentResponse.data : null

  // Populate form with existing data
  useEffect(() => {
    if (shipment) {
      setFormData({
        type: shipment.type,
        client: shipment.client,
        consignee: shipment.consignee,
        reference: shipment.reference,
        trackingNumber: shipment.trackingNumber,
        origin: shipment.origin,
        destination: shipment.destination,
        arrivalDate: shipment.arrivalDate ? new Date(shipment.arrivalDate).toISOString().split("T")[0] : "",
        container: shipment.container,
        truck: shipment.truck,
        documents:
          shipment.documents?.map((doc) => ({
            type: doc.type,
            file: {
              url: doc.fileUrl,
              name: doc.name,
            },
          })) || [],
      })
    }
  }, [shipment])

  const steps: StepInfo[] = [
    { id: "type", label: "Shipment Type", icon: <Package size={18} /> },
    { id: "details", label: "Shipment Details", icon: <Info size={18} /> },
    { id: "documents", label: "Required Documents", icon: <FileText size={18} /> },
    { id: "review", label: "Review & Update", icon: <Check size={18} /> },
  ]

  // Validation function for each step
  const validateStep = (step: Step): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    switch (step) {
      case "type":
        if (!formData.type) {
          newErrors.type = "Shipment type is required"
        }
        break
      case "details":
        if (!formData.client?.trim()) {
          newErrors.client = "Client name is required"
        }
        if (!formData.reference.trim()) {
          newErrors.reference = "Reference number is required"
        }
        if (formData.type === "ROAD" && !formData.origin.trim()) {
          newErrors.origin = "Origin is required for road shipments"
        }
        if (!formData.destination.trim()) {
          newErrors.destination = "Destination is required"
        }
        if (!formData.arrivalDate) {
          newErrors.arrivalDate = "Expected delivery date is required"
        } else {
          const date = new Date(formData.arrivalDate)
          if (isNaN(date.getTime())) {
            newErrors.arrivalDate = "Invalid date format"
          }
        }
        if (formData.type === "SEA" && !formData.container?.trim()) {
          newErrors.container = "Container number is required for sea shipments"
        }
        break
      case "documents":
        // Documents are optional for edit
        break
      case "review":
        // Validate all fields again before submission
        if (!formData.client?.trim()) {
          newErrors.client = "Client name is required"
        }
        if (!formData.reference.trim()) {
          newErrors.reference = "Reference number is required"
        }
        if (formData.type === "ROAD" && !formData.origin.trim()) {
          newErrors.origin = "Origin is required for road shipments"
        }
        if (!formData.destination.trim()) {
          newErrors.destination = "Destination is required"
        }
        if (!formData.arrivalDate) {
          newErrors.arrivalDate = "Expected delivery date is required"
        } else {
          const date = new Date(formData.arrivalDate)
          if (isNaN(date.getTime())) {
            newErrors.arrivalDate = "Invalid date format"
          }
        }
        if (formData.type === "SEA" && !formData.container?.trim()) {
          newErrors.container = "Container number is required for sea shipments"
        }
        break
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the following errors:", {
        description: Object.values(newErrors).join("\n"),
      })
      return false
    }
    return true
  }

  const handleNext = (): void => {
    if (validateStep(currentStep)) {
      const stepIndex = steps.findIndex((step) => step.id === currentStep)
      if (stepIndex < steps.length - 1) {
        setCurrentStep(steps[stepIndex + 1].id)
        window.scrollTo(0, 0)
      }
    }
  }

  const handleBack = (): void => {
    const stepIndex = steps.findIndex((step) => step.id === currentStep)
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id)
      setErrors({})
      window.scrollTo(0, 0)
    }
  }

  const handleDocumentsChange = (documents: DocumentUpload[]) => {
    setFormData((prev) => ({ ...prev, documents }))
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateStep("review")) {
      return
    }

    let originValue = formData.origin
    if (formData.type === "SEA") {
      originValue = "Mombasa Port"
    } else if (formData.type === "AIR") {
      originValue = "Juba International Airport"
    }

    const updateData = {
      type: formData.type,
      client: formData.client || undefined,
      consignee: formData.consignee || undefined,
      reference: formData.reference,
      origin: originValue,
      destination: formData.destination,
      arrivalDate: new Date(formData.arrivalDate),
      container: formData.type === "SEA" ? formData.container || undefined : undefined,
      truck: formData.truck || undefined,
    }

    updateShipment(
      { id, data: updateData },
      {
        onSuccess: () => {
          router.push(`/dashboard/shipments-trakit/${id}`)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Shipment Not Found</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                The shipment you're trying to edit doesn't exist or has been removed.
              </p>
              <Link
                href="/dashboard/shipments-trakit"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shipments
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ShipmentTypeOption = ({
    type,
    label,
    description,
    icon,
  }: {
    type: ShipmentType
    label: string
    description: string
    icon: React.ReactNode
  }) => (
    <button
      className={`p-6 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md ${
        formData.type === type ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => setFormData({ ...formData, type })}
      type="button"
    >
      <div className="flex items-center">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            formData.type === type ? "bg-blue-100" : "bg-gray-100"
          }`}
        >
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-base font-medium">{label}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </button>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case "type":
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center border-b pb-4 mb-4">
              <Package className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Select Shipment Type</h2>
            </div>
            {errors.type && (
              <div className="bg-red-50 rounded-md p-3 flex items-start">
                <Info className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-700">{errors.type}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ShipmentTypeOption
                type="SEA"
                label="Sea Freight"
                description="Container shipping via Mombasa Port"
                icon={<Container className="h-6 w-6 text-blue-500" />}
              />
              <ShipmentTypeOption
                type="AIR"
                label="Air Freight"
                description="Air cargo via Juba International Airport"
                icon={<PlaneLanding className="h-6 w-6 text-blue-500" />}
              />
              <ShipmentTypeOption
                type="ROAD"
                label="Road Freight"
                description="Direct trucking service"
                icon={<Truck className="h-6 w-6 text-blue-500" />}
              />
            </div>
          </div>
        )
      case "details":
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center border-b pb-4 mb-4">
              <Info className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-medium text-gray-900">Edit Shipment Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Client Name</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.client || ""}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value || null })}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border ${errors.client ? "border-red-500" : ""}`}
                    placeholder="Enter client name"
                  />
                  {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Consignee</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.consignee || ""}
                    onChange={(e) => setFormData({ ...formData, consignee: e.target.value || null })}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder="Enter consignee name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border ${errors.reference ? "border-red-500" : ""}`}
                    placeholder="Enter reference number"
                  />
                  {errors.reference && <p className="text-red-500 text-xs mt-1">{errors.reference}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.trackingNumber || ""}
                    disabled
                    className="bg-gray-50 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border disabled cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Origin</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  {formData.type === "ROAD" ? (
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border ${errors.origin ? "border-red-500" : ""}`}
                      placeholder="Enter origin location"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.type === "SEA" ? "Mombasa Port" : "Juba International Airport"}
                      disabled
                      className="bg-gray-50 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    />
                  )}
                  {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border ${errors.destination ? "border-red-500" : ""}`}
                    placeholder="Enter destination"
                  />
                  {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Expected Delivery Date</label>
                <div className="relative rounded-md shadow-sm">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-10 text-left font-normal py-2",
                          !formData.arrivalDate && "text-muted-foreground",
                          errors.arrivalDate && "border-red-500",
                        )}
                      >
                        <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        {formData.arrivalDate ? format(new Date(formData.arrivalDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.arrivalDate ? new Date(formData.arrivalDate) : undefined}
                        onSelect={(date) =>
                          setFormData({ ...formData, arrivalDate: date?.toISOString().split("T")[0] || "" })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.arrivalDate && <p className="text-red-500 text-xs mt-1">{errors.arrivalDate}</p>}
                </div>
              </div>
              {formData.type === "SEA" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Container Number</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Container className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.container || ""}
                      onChange={(e) => setFormData({ ...formData, container: e.target.value || null })}
                      className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border ${errors.container ? "border-red-500" : ""}`}
                      placeholder="Enter container number"
                    />
                    {errors.container && <p className="text-red-500 text-xs mt-1">{errors.container}</p>}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Truck Number <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Truck className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.truck || ""}
                    onChange={(e) => setFormData({ ...formData, truck: e.target.value || null })}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder="Enter truck number (optional)"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case "documents":
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center border-b pb-4 mb-4">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-medium text-gray-900">Manage Documents</h2>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="ml-3 text-sm text-blue-700">
                Document management for existing shipments is handled in the shipment details page. You can skip this
                step for now.
              </p>
            </div>
          </div>
        )
      case "review":
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center border-b pb-4 mb-4">
              <Check className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-medium text-gray-900">Review Changes</h2>
            </div>
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 rounded-md p-3 flex items-start">
                <Info className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-700">
                  Please fix the following errors before updating:
                  <ul className="list-disc ml-4 mt-1">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-sm font-medium text-blue-600 uppercase mb-4 flex items-center">
                  <Info size={16} className="mr-2" />
                  Updated Shipment Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      {formData.type === "SEA" ? (
                        <Container className="h-5 w-5 text-blue-500" />
                      ) : formData.type === "AIR" ? (
                        <PlaneLanding className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Truck className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {formData.type === "SEA"
                          ? "Sea Freight"
                          : formData.type === "AIR"
                            ? "Air Freight"
                            : "Road Freight"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Reference:</span> {formData.reference || "Not provided"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Tracking Number:</span>{" "}
                        {formData.trackingNumber || "Not assigned"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Client:</span> {formData.client || "Not provided"}
                      </p>
                      {formData.consignee && (
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Consignee:</span> {formData.consignee}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start border-t border-gray-100 pt-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Route Details</p>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Origin:</span>{" "}
                        {formData.type === "SEA"
                          ? "Mombasa Port"
                          : formData.type === "AIR"
                            ? "Juba International Airport"
                            : formData.origin || "Not specified"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Destination:</span> {formData.destination || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start border-t border-gray-100 pt-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Delivery Information</p>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Expected Delivery:</span>{" "}
                        {formData.arrivalDate ? format(new Date(formData.arrivalDate), "PPP") : "Not specified"}
                      </p>
                    </div>
                  </div>
                  {(formData.container || formData.truck) && (
                    <div className="flex items-start border-t border-gray-100 pt-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        {formData.container ? (
                          <Container className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Truck className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="ml-3">
                        {formData.container && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Container Number:</span> {formData.container}
                          </p>
                        )}
                        {formData.truck && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Truck Number:</span> {formData.truck}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-2">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <Link href={`/dashboard/shipments-trakit/${id}`}>
            <span className="text-blue-600 hover:text-blue-800 flex items-center mb-4 transition-colors cursor-pointer text-xs">
              <ArrowLeft size={16} className="mr-1" /> Back to Shipment Details
            </span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Edit Shipment</h1>
          <p className="text-gray-500 mt-1 text-sm">Update the details for shipment {formData.reference}</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={step.id} className={`flex items-center ${index === steps.length - 1 ? "" : "flex-1"}`}>
                <div className="flex items-center relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep === step.id
                        ? "border-blue-600 bg-blue-600 text-white"
                        : steps.findIndex((s) => s.id === currentStep) > index
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-gray-500"
                    }`}
                  >
                    {steps.findIndex((s) => s.id === currentStep) > index ? <Check size={16} /> : step.icon}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      currentStep === step.id ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded transition-colors ${
                      steps.findIndex((s) => s.id === currentStep) > index ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6 shadow-sm border border-gray-200 overflow-hidden">{renderStepContent()}</Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mb-8 p-4 bg-white rounded-lg shadow-sm">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === "type"}
            className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          {currentStep === "review" ? (
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 border border-transparent text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg
                      className="h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                  Updating...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Update Shipment
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 border border-transparent text-white hover:bg-blue-700"
            >
              Continue
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShipmentEditForm
