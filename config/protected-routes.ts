// config/routes.ts

import { UserRole } from "@prisma/client";
import {
  LayoutDashboard,
  Users,
  Target,
  Car,
  ShoppingCart,
  Settings,
  UserCog,
  KeyRound,
  MessageSquare,
  ChevronRight,
  Bike,
  PlaneLanding,
} from "lucide-react";

export type Route = {
  title: string;
  href: string;
  icon: any;
  roles?: UserRole[]; // Which roles can access this route
  group?: string; // Optional grouping for related routes
  isNew?: boolean; // Optional flag for new features
};

export const routes: Route[] = [
  // Dashboard (standalone)
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["USER", "ADMIN"],
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
    roles: ["ADMIN"],
  },

  // Shipment
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
    roles: ["USER", "ADMIN"],
    group: "Shipment",
  },
  {
    title: "Shipments",
    href: "/dashboard/shipments",
    icon: PlaneLanding,
    roles: ["USER", "ADMIN"],
    group: "Shipment",
  },

  // Settings group
  {
    title: "Change Password",
    href: "/dashboard/settings/change-password",
    icon: KeyRound,
    roles: ["USER", "ADMIN"],
    group: "Settings",
  },
  {
    title: "Update Profile",
    href: "/dashboard/settings/profile",
    icon: UserCog,
    roles: ["USER", "ADMIN"],
    group: "Settings",
  },
];

// Helper function to get routes for a specific role
export const getRoutesByRole = (role: UserRole) => {
  return routes.filter((route) => route.roles?.includes(role));
};

// Helper function to get routes by group for a specific role
export const getRoutesByGroup = (role: UserRole) => {
  const userRoutes = getRoutesByRole(role);
  const groups = new Map<string, Route[]>();

  // Add Dashboard as its own group first for proper ordering
  groups.set(
    "Dashboard",
    userRoutes.filter((route) => !route.group)
  );

  // Then add the rest of the groups
  userRoutes.forEach((route) => {
    if (route.group) {
      if (!groups.has(route.group)) {
        groups.set(route.group, []);
      }
      groups.get(route.group)?.push(route);
    }
  });

  return groups;
};

// Helper to check if a user has access to a specific route
export const hasRouteAccess = (route: Route, role: UserRole) => {
  return route.roles?.includes(role);
};
