// Permission types
export type Permission =
  | 'manage_users'
  | 'create_shipments'
  | 'view_shipments'
  | 'edit_shipments'
  | 'delete_shipments'
  | 'verify_documents'
  | 'manage_settings'
  | 'view_reports'
  | 'manage_tasks'
  | 'view_analytics';

// Role to permissions mapping
export const getRolePermissions = (role: string): Permission[] => {
  switch (role.toLowerCase()) {
    case 'admin':
      return [
        'manage_users',
        'create_shipments',
        'view_shipments',
        'edit_shipments',
        'delete_shipments',
        'verify_documents',
        'manage_settings',
        'view_reports',
        'manage_tasks',
        'view_analytics'
      ];
    case 'staff':
      return [
        'create_shipments',
        'view_shipments',
        'edit_shipments',
        'verify_documents',
        'manage_tasks',
        'view_reports'
      ];
    case 'agent':
      return [
        'view_shipments',
        'edit_shipments',
        'verify_documents',
        'manage_tasks'
      ];
    case 'user': // This is for clients
      return [
        'view_shipments',
        'view_reports'
      ];
    default:
      return ['view_shipments']; // Default minimal permission
  }
};

// Check if user has permission
export const hasPermission = (userPermissions: Permission[], requiredPermission: Permission): boolean => {
  return userPermissions.includes(requiredPermission);
};

// Check if route is accessible based on permissions
export const canAccessRoute = (route: string, userPermissions: Permission[]): boolean => {
  const routePermissionMap: Record<string, Permission[]> = {
    '/dashboard': ['view_shipments'], // Everyone can access dashboard
    '/dashboard/users': ['manage_users'],
    '/dashboard/shipments-trakit': ['view_shipments'],
    '/dashboard/sea-freights': ['view_shipments'],
    '/dashboard/air-freight': ['view_shipments'],
    '/dashboard/documents': ['view_shipments', 'verify_documents'],
    '/dashboard/tracking': ['view_shipments'],
    '/dashboard/tasks': ['manage_tasks'],
    '/dashboard/settings': ['manage_settings'],
    '/dashboard/reports': ['view_reports'],
    '/dashboard/analytics': ['view_analytics']
  };

  const requiredPermissions = routePermissionMap[route] || [];
  
  // If no permissions required for this route, allow access
  if (requiredPermissions.length === 0) return true;
  
  // Check if user has at least one of the required permissions
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
};

// Get accessible routes for a user based on their permissions
export const getAccessibleRoutes = (userPermissions: Permission[]): string[] => {
  const allRoutes = Object.keys(({
    '/dashboard': ['view_shipments'],
    '/dashboard/users': ['manage_users'],
    '/dashboard/shipments-trakit': ['view_shipments'],
    '/dashboard/sea-freights': ['view_shipments'],
    '/dashboard/air-freight': ['view_shipments'],
    '/dashboard/documents': ['view_shipments', 'verify_documents'],
    '/dashboard/tracking': ['view_shipments'],
    '/dashboard/tasks': ['manage_tasks'],
    '/dashboard/settings': ['manage_settings'],
    '/dashboard/reports': ['view_reports'],
    '/dashboard/analytics': ['view_analytics']
  }));

  return allRoutes.filter(route => canAccessRoute(route, userPermissions));
};