import { getRoles } from "@/actions/roles"
import RolesComponent from "@/components/roles-component"
import { checkPermission } from "@/config/auth"

export default async function Page() {
  // Check if user has permission to view roles
  await checkPermission("roles.read")

  // Fetch roles
  const rolesResult = await getRoles()
  const roles = rolesResult.success ? rolesResult.data : []

  return <RolesComponent roles={roles} />
}
