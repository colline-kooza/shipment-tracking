import { Shipment } from "@prisma/client"
import { CheckCircle, Circle } from "lucide-react"
import type React from "react"

interface ShipmentProgressProps {
  shipment: Shipment
}

// Update the ShipmentStatus enum to match the complete schema
enum ShipmentStatus {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DOCUMENT_RECEIVED = "DOCUMENT_RECEIVED",
  DOCUMENTS_SENT = "DOCUMENTS_SENT",
  CARGO_ARRIVED = "CARGO_ARRIVED",
  TRANSFERRED_TO_CFS = "TRANSFERRED_TO_CFS",
  ENTRY_REGISTERED = "ENTRY_REGISTERED",
  CUSTOM_RELEASED = "CUSTOM_RELEASED",
  DELIVERY_ORDER_OBTAINED = "DELIVERY_ORDER_OBTAINED",
  TAXES_PAID = "TAXES_PAID",
  ARRIVAL_MALABA = "ARRIVAL_MALABA",
  DEPARTURE_MALABA = "DEPARTURE_MALABA",
  ARRIVAL_NIMULE = "ARRIVAL_NIMULE",
  NIMULE_BORDER_RELEASED = "NIMULE_BORDER_RELEASED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  EMPTY_RETURNED = "EMPTY_RETURNED",
  DOCUMENT_REJECTED = "DOCUMENT_REJECTED",
}

// Update workflowSteps to include all relevant statuses in logical order
const workflowSteps: {
  status: ShipmentStatus
  label: string
}[] = [
  { status: ShipmentStatus.CREATED, label: "Created" },
  { status: ShipmentStatus.DOCUMENT_RECEIVED, label: "Documents Received" },
  { status: ShipmentStatus.DOCUMENTS_SENT, label: "Documents Sent" },
  { status: ShipmentStatus.IN_TRANSIT, label: "In Transit" },
  { status: ShipmentStatus.CARGO_ARRIVED, label: "Cargo Arrived" },
  { status: ShipmentStatus.TRANSFERRED_TO_CFS, label: "Transferred to CFS" },
  { status: ShipmentStatus.ENTRY_REGISTERED, label: "Entry Registered" },
  { status: ShipmentStatus.CUSTOM_RELEASED, label: "Customs Released" },
  { status: ShipmentStatus.DELIVERY_ORDER_OBTAINED, label: "Delivery Order Obtained" },
  { status: ShipmentStatus.TAXES_PAID, label: "Taxes Paid" },
  { status: ShipmentStatus.ARRIVAL_MALABA, label: "Arrived at Malaba" },
  { status: ShipmentStatus.DEPARTURE_MALABA, label: "Departed Malaba" },
  { status: ShipmentStatus.ARRIVAL_NIMULE, label: "Arrived at Nimule" },
  { status: ShipmentStatus.NIMULE_BORDER_RELEASED, label: "Nimule Released" },
  { status: ShipmentStatus.DELIVERED, label: "Delivered" },
  { status: ShipmentStatus.EMPTY_RETURNED, label: "Empty Returned" },
]

// Update statusRankMap to include all statuses
const statusRankMap: Record<ShipmentStatus, number> = {
  [ShipmentStatus.CREATED]: 0,
  [ShipmentStatus.UPDATED]: 0, // Same rank as CREATED since it's an update operation
  [ShipmentStatus.DOCUMENT_RECEIVED]: 1,
  [ShipmentStatus.DOCUMENTS_SENT]: 2,
  [ShipmentStatus.IN_TRANSIT]: 3,
  [ShipmentStatus.CARGO_ARRIVED]: 4,
  [ShipmentStatus.TRANSFERRED_TO_CFS]: 5,
  [ShipmentStatus.ENTRY_REGISTERED]: 6,
  [ShipmentStatus.CUSTOM_RELEASED]: 7,
  [ShipmentStatus.DELIVERY_ORDER_OBTAINED]: 8,
  [ShipmentStatus.TAXES_PAID]: 9,
  [ShipmentStatus.ARRIVAL_MALABA]: 10,
  [ShipmentStatus.DEPARTURE_MALABA]: 11,
  [ShipmentStatus.ARRIVAL_NIMULE]: 12,
  [ShipmentStatus.NIMULE_BORDER_RELEASED]: 13,
  [ShipmentStatus.DELIVERED]: 14,
  [ShipmentStatus.EMPTY_RETURNED]: 15,
  [ShipmentStatus.DOCUMENT_REJECTED]: 1, // Special case, treated as early stage for progress visualization
}

export const ShipmentProgress: React.FC<ShipmentProgressProps> = ({ shipment }) => {
  const currentStatusRank = shipment.status in statusRankMap ? statusRankMap[shipment.status as ShipmentStatus] : -1

  // Define key milestones for the progress bar
  // Updated indices to reflect the new workflow order
  const displayStepsIndices = [1, 4, 7, 14, 15] // Documents Received, Cargo Arrived, Customs Released, Delivered, Empty Returned
  const filteredSteps = displayStepsIndices.map((index) => workflowSteps[index])

  return (
    <div className="px-4 py-5 sm:px-6">
      <h3 className="text-base font-semibold leading-6 text-gray-900">Shipment Progress</h3>
      <div className="mt-4">
        <div className="overflow-hidden">
          <ul className="flex items-center justify-between w-full">
            {filteredSteps.map((step, index) => {
              const stepRank = statusRankMap[step.status]
              const isCompleted = currentStatusRank >= stepRank
              const isCurrent = currentStatusRank === stepRank

              return (
                <li key={step.status} className="relative flex items-center flex-1 justify-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isCompleted ? "bg-green-600" : isCurrent ? "border-2 border-blue-600 bg-white" : "bg-gray-200"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Circle className={`h-5 w-5 ${isCurrent ? "text-blue-600" : "text-gray-400"}`} />
                      )}
                    </div>
                    <p
                      className={`mt-2 text-xs text-center ${
                        isCompleted ? "text-green-600" : isCurrent ? "text-blue-600 font-medium" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < filteredSteps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        statusRankMap[filteredSteps[index + 1].status] <= currentStatusRank
                          ? "bg-green-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ShipmentProgress