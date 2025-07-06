"use client"
import {
  useQuery,
  useSuspenseQuery,
  QueryClient,
} from "@tanstack/react-query";

import { 
  getDashboardStats, 
  getRecentShipments, 
  getUnreadNotificationsCount 
} from "@/actions/dashboard";

// Query keys for caching
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  shipments: () => [...dashboardKeys.all, "shipments"] as const,
  recentShipments: (limit: number) => 
    [...dashboardKeys.shipments(), { limit }] as const,
  notifications: () => [...dashboardKeys.all, "notifications"] as const,
};

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => getDashboardStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch recent shipments
 */
export function useRecentShipments(limit: number = 4) {
  return useQuery({
    queryKey: dashboardKeys.recentShipments(limit),
    queryFn: () => getRecentShipments(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch unread notifications count
 */
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: dashboardKeys.notifications(),
    queryFn: () => getUnreadNotificationsCount(),
    staleTime: 1000 * 60 * 1, // 1 minute (refresh more frequently)
  });
}

/**
 * Prefetch all dashboard data
 * This is useful for loading data before the user navigates to the dashboard
 */
export async function prefetchDashboardData(queryClient: QueryClient) {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.stats(),
      queryFn: () => getDashboardStats(),
    }),
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.recentShipments(4),
      queryFn: () => getRecentShipments(4),
    }),
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.notifications(),
      queryFn: () => getUnreadNotificationsCount(),
    }),
  ]);
}