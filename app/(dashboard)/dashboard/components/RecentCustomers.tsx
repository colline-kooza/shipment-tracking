// components/dashboard/recent-customers.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getRecentCustomers } from "@/actions/recent";
import { formatDistanceToNow } from "date-fns";

export async function RecentCustomers() {
  const { success, data: customers = [], error } = await getRecentCustomers(3);

  if (!success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Customers
          </CardTitle>
          <CardDescription>Failed to load recent customers</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Customers
          </CardTitle>
          <CardDescription>Latest customers who joined</CardDescription>
        </div>
        <Link
          href="/dashboard/customers"
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          View all
          <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    {customer.email || customer.phone || "No contact info"}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(customer.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View details
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
