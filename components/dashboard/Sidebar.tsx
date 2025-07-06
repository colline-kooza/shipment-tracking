"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Package, ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { navItems } from "@/config/sidebar"

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", collapsed ? "64px" : "256px")
  }, [collapsed])

  const handleToggle = () => {
    setCollapsed(!collapsed)
  }

  // Correct isActive logic to distinguish sub-paths
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard" // Only active when exactly /dashboard
    }
    return pathname.startsWith(path) // Active for other nested paths
  }

  // Filter navigation items based on user permissions
  const filteredNavItems = navItems.filter((item) => {
    if (!session?.user?.permissions) return false
    return session.user.permissions.includes(item.permission)
  })

  return (
    <aside
      className={`bg-[#0F2557] text-white transition-all duration-300 flex flex-col shadow-xl fixed top-0 left-0 h-full z-50 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b border-blue-600/20 ${collapsed ? "px-2" : "px-4"}`}>
        <div className={`flex ${collapsed ? "justify-center" : "justify-between"} items-center`}>
          {!collapsed && (
            <div className="flex items-center">
              <div className="bg-blue-500 p-2 rounded-lg mr-3">
                <Package size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">TrakIT</h1>
            </div>
          )}
          {collapsed && (
            <div className="bg-blue-500 p-2 rounded-lg">
              <Package size={20} className="text-white" />
            </div>
          )}
          <button
            onClick={handleToggle}
            className="p-1.5 rounded-full hover:bg-blue-600/50 transition-colors duration-200 text-blue-200 hover:text-white"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      {/* Navigation - Now using filtered nav items based on permissions */}
      <nav className="flex-1 py-2">
        <div className={`space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`group flex items-center ${
                collapsed ? "justify-center px-2" : "justify-start px-3"
              } py-3 rounded-lg transition-all duration-200 relative ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 border-l-4 border-blue-300"
                  : "text-blue-100 hover:bg-blue-700/50 hover:text-white hover:shadow-md"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <span className={`flex-shrink-0 ${!collapsed ? "mr-3" : ""}`}>{item.icon}</span>
              {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
              {/* Active indicator for collapsed state */}
              {isActive(item.path) && collapsed && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-300 rounded-l-full"></div>
              )}
              {/* Active indicator for expanded state */}
              {isActive(item.path) && !collapsed && (
                <div className="ml-auto w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer - Logout */}
      <div className={`mt-auto border-t border-blue-600/20 p-4 ${collapsed ? "px-2" : "px-4"}`}>
        <div className="space-y-2">
          <button
            className={`group flex items-center text-sm ${
              collapsed ? "justify-center px-2" : "justify-start px-3"
            } w-full py-3 text-gray-200 hover:bg-red-500/20 hover:text-red-100 rounded-lg transition-all duration-200 hover:border-red-400/40`}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={20} className={`${!collapsed ? "mr-3" : ""} transition-transform group-hover:scale-110`} />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
