"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Settings, 
  HelpCircle,
  ChevronDown,
  Check,
  CheckCheck,
  FileCheck,
  FileX,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getRoutesByRole } from "@/config/protected-routes";
import Logo from "../global/Logo";
import { NotificationType } from "@prisma/client";

import { formatDistanceToNow } from "date-fns";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/actions/notifactions";

export default function Navbar({ session }: { session: Session }) {
  const router = useRouter();
  const pathname = usePathname();
  const role = session.user.role;
  const routes = getRoutesByRole(role);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (notificationsOpen) {
      fetchNotifications();
    }
  }, [notificationsOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await getNotifications({ limit: 5 });
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  async function handleLogout() {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.log(error);
    }
  }

  const handleMenuItemClick = (path: string) => {
    setProfileOpen(false);
    router.push(path);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await markNotificationAsRead(id);
      if (response.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead();
      if (response.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleViewAllNotifications = () => {
    setNotificationsOpen(false);
    router.push('/dashboard/notifications');
  };

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "DOCUMENT_ALERT":
        return <Bell className="h-4 w-4 text-blue-500" />;
      case "STATUS_CHANGE":
        return <FileCheck className="h-4 w-4 text-green-500" />;
      case "TASK_ASSIGNED":
        return <User className="h-4 w-4 text-orange-500" />;
      case "DEADLINE_APPROACHING":
        return <Bell className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-2 backdrop-blur-sm lg:px-6">
      
      {/* Center - Search (only on desktop) */}
      <div className="hidden md:block max-w-md w-full mx-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search shipments, documents, clients..."
            className="pl-10 w-full bg-muted/30 text-xs"
          />
        </div>
      </div>

      {/* Right side - Notifications and User Menu */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="text-2xl" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white transform -translate-y-1/3 translate-x-1/3">
                {unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
          
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <div className="p-3 border-b flex justify-between items-center">
                <h3 className="text-sm font-medium">Notifications</h3>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs flex items-center" 
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all as read
                  </Button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : notifications.length > 0 ? (
                  <div>
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={cn(
                          "p-3 border-b hover:bg-muted/50 transition-colors cursor-pointer flex",
                          !notification.isRead && "bg-blue-50 dark:bg-blue-900/10"
                        )}
                      >
                        <div className="mr-3 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            <div className="flex items-center">
                              {!notification.isRead && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-4 text-center">No notifications</p>
                )}
              </div>
              <div className="border-t p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={handleViewAllNotifications}
                >
                  View all notifications
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center space-x-2 rounded-full"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
              {session.user.name?.charAt(0)}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">
                {session.user.name}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {role}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 hidden md:block ${
              profileOpen ? "transform rotate-180" : ""
            }`} />
          </Button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">{session.user.email}</p>
              </div>
              <div className="py-1">
                <Button
                  variant="ghost"
                  onClick={() => handleMenuItemClick('/profile')}
                  className="flex w-full items-center px-4 py-2 text-sm text-foreground justify-start font-normal"
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleMenuItemClick('/settings')}
                  className="flex w-full items-center px-4 py-2 text-sm text-foreground justify-start font-normal"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleMenuItemClick('/help')}
                  className="flex w-full items-center px-4 py-2 text-sm text-foreground justify-start font-normal"
                >
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Help & Support
                </Button>
              </div>
              <div className="py-1 border-t">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-destructive justify-start font-normal hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}