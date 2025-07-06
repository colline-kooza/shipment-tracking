import CustomersComponent from "@/components/dashboard/customers/CustomersComponent";
import { checkPermission } from "@/config/auth";


export default async function Page() {
  // Check if user has permission to view customers
  await checkPermission("customers.read")

  return <CustomersComponent />
}
