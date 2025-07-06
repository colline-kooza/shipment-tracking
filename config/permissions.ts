export type Permission = {
  create?: string;
  read?: string;
  update?: string;
  delete?: string;
};

export type ModulePermissions = {
  display: string;
  name: string;
  permissions: Permission;
};

export const permissions: ModulePermissions[] = [
  {
    display: "Dashboard",
    name: "dashboard",
    permissions: {
      read: "dashboard.read",
    },
  },
  // User Management
  {
    display: "Users",
    name: "users",
    permissions: {
      create: "users.create",
      read: "users.read",
      //   update: "users.update",
      //   delete: "users.delete",
    },
  },
  {
    display: "Roles",
    name: "roles",
    permissions: {
      create: "roles.create",
      read: "roles.read",
      update: "roles.update",
      delete: "roles.delete",
    },
  },
  // Customer Management
  {
    display: "Customers",
    name: "customers",
    permissions: {
      create: "customers.create",
      read: "customers.read",
      update: "customers.update",
      delete: "customers.delete",
    },
  },
  // Shipment Management
  {
    display: "Shipments",
    name: "shipments",
    permissions: {
      create: "shipments.create",
      read: "shipments.read",
      update: "shipments.update",
      delete: "shipments.delete",
    },
  },
  {
    display: "Sea Freight",
    name: "sea_freight",
    permissions: {
      create: "sea_freight.create",
      read: "sea_freight.read",
    },
  },
  {
    display: "Air Freight",
    name: "air_freight",
    permissions: {
      create: "air_freight.create",
      read: "air_freight.read",
    },
  },
  {
    display: "Documents",
    name: "documents",
    permissions: {
      create: "documents.create",
      read: "documents.read",
      update: "documents.update",
      delete: "documents.delete",
    },
  },
  {
    display: "Tracking",
    name: "tracking",
    permissions: {
      read: "tracking.read",
    },
  },
  {
    display: "Notifications",
    name: "notifications",
    permissions: {
      create: "notifications.create",
      read: "notifications.read",
    },
  },
  {
    display: "Settings",
    name: "settings",
    permissions: {
      read: "settings.read",
      update: "settings.update",
    },
  },
  {
    display: "Alert Panel",
    name: "alert-panel",
    permissions: {
      read: "alert-panel.read",
    },
  },
];

// Helper function to get all permissions as a flat array
export const getAllPermissions = (): string[] => {
  return permissions.flatMap((module) => Object.values(module.permissions));
};

// Helper function to get permissions by module
export const getModulePermissions = (moduleName: string): string[] => {
  const module = permissions.find((p) => p.name === moduleName);
  return module ? Object.values(module.permissions) : [];
};

// Default role permissions
export const defaultRolePermissions = {
  admin: getAllPermissions(),
  staff: [
    "dashboard.read",
    "customers.create",
    "customers.read",
    "customers.update",
    "shipments.create",
    "shipments.read",
    "shipments.update",
    "sea_freight.create",
    "sea_freight.read",
    "sea_freight.update",
    "air_freight.create",
    "air_freight.read",
    "air_freight.update",
    "documents.create",
    "documents.read",
    "documents.update",
    "tracking.read",
    "tracking.update",
    "notifications.read",
    "notifications.update",
  ],
  agent: [
    "dashboard.read",
    "customers.read",
    "shipments.read",
    "shipments.update",
    "sea_freight.read",
    "sea_freight.update",
    "air_freight.read",
    "air_freight.update",
    "documents.read",
    "documents.update",
    "tracking.read",
    "tracking.update",
    "notifications.read",
  ],
  user: [
    "dashboard.read",
    "customers.read",
    "shipments.read",
    "tracking.read",
    "notifications.read",
  ],
};
