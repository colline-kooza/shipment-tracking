import UsersComponent from '@/components/dashboard/UsersComponent';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Suspense } from 'react';
import { checkPermission } from '@/config/auth';
import { getUsersWithRoles } from '@/actions/newUsers';

function UsersLoadingSkeleton() {
  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-48" />
        </div>
      </Card>


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
    </div>
  );
}

async function UsersWithData() {
  await checkPermission("roles.read")

  const users = await getUsersWithRoles()

  return <UsersComponent users={users} />
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersLoadingSkeleton />}>
      <UsersWithData />
    </Suspense>
  );
}