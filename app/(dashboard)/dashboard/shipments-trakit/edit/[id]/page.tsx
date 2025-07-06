import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import ShipmentEditForm from "@/components/dashboard/ShipmentEditForm"
import { checkPermission } from "@/config/auth"

interface ShipmentEditPageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: ShipmentEditPageProps) {
  const id = (await params).id
  await checkPermission("dashboard.update")
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<EditFormSkeleton />}>
        <ShipmentEditForm id={id} />
      </Suspense>
    </div>
  )
}

function EditFormSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <Skeleton className="h-20 w-full" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}
