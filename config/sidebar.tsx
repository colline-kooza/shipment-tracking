import {
  Truck,
  FileText,
  BarChart3,
  Users,
  Settings,
  Package,
  Anchor,
  PlaneLanding,
  MessageCircle,
  MessageCircleCode,
  Shield,
  UserCheck,
} from "lucide-react";
import type { JSX } from "react";

export interface ISidebarLink {
  name: string;
  path: string;
  icon: JSX.Element;
  permission: string; // Required permission to view this item
  roles?: string[]; // Keep for backward compatibility
}

export const navItems: ISidebarLink[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <BarChart3 size={20} />,
    permission: "dashboard.read",
    roles: ["ADMIN", "STAFF", "AGENT", "USER"],
  },
  {
    name: "Customers",
    path: "/dashboard/customers",
    icon: <UserCheck size={20} />,
    permission: "customers.read",
    roles: ["ADMIN", "STAFF", "AGENT"],
  },
  {
    name: "Shipments",
    path: "/dashboard/shipments-trakit",
    icon: <Package size={20} />,
    permission: "shipments.read",
    roles: ["ADMIN", "STAFF", "AGENT"],
  },
  {
    name: "Sea Freight",
    path: "/dashboard/sea-freights",
    icon: <Anchor size={20} />,
    permission: "sea_freight.read",
    roles: ["ADMIN", "STAFF", "AGENT"],
  },
  {
    name: "Air Freight",
    path: "/dashboard/air-freight",
    icon: <PlaneLanding size={20} />,
    permission: "air_freight.read",
    roles: ["ADMIN", "STAFF", "AGENT"],
  },
  {
    name: "Documents",
    path: "/dashboard/documents",
    icon: <FileText size={20} />,
    permission: "documents.read",
    roles: ["ADMIN", "STAFF", "AGENT"],
  },
  {
    name: "Tracking",
    path: "/dashboard/tracking",
    icon: <Truck size={20} />,
    permission: "tracking.read",
    roles: ["ADMIN", "STAFF", "AGENT", "USER"],
  },
  {
    name: "Alert Panel",
    path: "/dashboard/panel",
    icon: <MessageCircleCode size={20} />,
    permission: "alert-panel.read",
    roles: ["ADMIN"],
  },
  {
    name: "Notifications",
    path: "/dashboard/notifications",
    icon: <MessageCircle size={20} />,
    permission: "notifications.read",
    roles: ["ADMIN", "STAFF", "AGENT", "USER"],
  },
  {
    name: "Users",
    path: "/dashboard/users",
    icon: <Users size={20} />,
    permission: "users.read",
    roles: ["ADMIN"],
  },
  {
    name: "Roles",
    path: "/dashboard/roles",
    icon: <Shield size={20} />,
    permission: "roles.read",
    roles: ["ADMIN"],
  },
  {
    name: "Settings",
    path: "/dashboard/settings",
    icon: <Settings size={20} />,
    permission: "settings.read",
    roles: ["ADMIN"],
  },
];
