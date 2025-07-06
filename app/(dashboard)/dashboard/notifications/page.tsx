"use client";
import { useState, useEffect } from "react";
import { 
  Bell, 
  FileCheck, 
  FileX, 
  User, 
  Calendar, 
  Check, 
  Filter,
  CheckCheck,
  Trash2,
  RefreshCw,
  Clock,
  AlertCircle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { NotificationType, DocumentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { clearAllNotifications, deleteNotification, getNotifications, markAllNotificationsAsRead, markNotificationAsRead, NotificationFilter } from "@/actions/notifactions";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filters, setFilters] = useState<NotificationFilter>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filters, activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let filterParams: NotificationFilter = {};
      
      // Set filters based on active tab
      if (activeTab === "unread") {
        filterParams.isRead = false;
      } else if (activeTab === "read") {
        filterParams.isRead = true;
      }
      
      // Add type filter if applicable
      if (filters.type && filters.type !== 'all') {
        filterParams.type = filters.type;
      }
      
      const response = await getNotifications(filterParams);
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const handleMarkAsRead = async (id: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
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

  const handleDeleteNotification = async (id: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      const response = await deleteNotification(id);
      if (response.success) {
        setDeleteConfirm(null);
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      const response = await clearAllNotifications();
      if (response.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read if not already
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Handle navigation based on notification type
    if (notification.type === NotificationType.DEADLINE_APPROACHING) {
      // Navigate to document
      window.location.href = `/documents/${notification.documentId}`;
    } else if (notification.type === NotificationType.DOCUMENT_ALERT) {
      // Navigate to the comment or section where user was mentioned
      window.location.href = `/documents/${notification.documentId}?comment=${notification.commentId}`;
    } else if (notification.type === NotificationType.TASK_ASSIGNED) {
      // Navigate to task details
      window.location.href = `/tasks/${notification.taskId}`;
    } else if (notification.type === NotificationType.STATUS_CHANGE) {
      // Navigate to calendar event
      window.location.href = `/calendar/event/${notification.eventId}`;
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.DEADLINE_APPROACHING:
        return <FileCheck className="h-5 w-5 text-green-500" />;
      case NotificationType.DOCUMENT_ALERT:
        return <User className="h-5 w-5 text-blue-500" />;
      case NotificationType.TASK_ASSIGNED:
        return <Clock className="h-5 w-5 text-amber-500" />;
      case NotificationType.STATUS_CHANGE:
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case NotificationType.DOCUMENT_ALERT:
        return <FileX className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: NotificationType) => {
    switch (type) {
      case NotificationType.DEADLINE_APPROACHING:
        return "Document Updated";
      case NotificationType.DOCUMENT_ALERT:
        return "Mention";
      case NotificationType.TASK_ASSIGNED:
        return "Task Assigned";
      case NotificationType.STATUS_CHANGE:
        return "Calendar Event";
      case NotificationType.TASK_ASSIGNED:
        return "Document Rejected";
      default:
        return "Notification";
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.VERIFIED:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case DocumentStatus.REJECTED:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case DocumentStatus.PENDING:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">In Review</Badge>;
      case DocumentStatus.REJECTED:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
      default:
        return null;
    }
  };

  const fadeInAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };

  const renderEmptyState = () => (
    <motion.div 
      className="flex flex-col items-center justify-center py-12 text-center"
      {...fadeInAnimation}
      transition={{ duration: 0.3 }}
    >
      <Bell className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
      <p className="text-gray-500 mt-1 max-w-sm">
        {activeTab === "unread" 
          ? "You don't have any unread notifications." 
          : activeTab === "read" 
            ? "You don't have any read notifications."
            : "You don't have any notifications yet."}
      </p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={handleRefresh}
        disabled={refreshing}
      >
        <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
        Refresh
      </Button>
    </motion.div>
  );

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-gray-500 mt-1">Manage your notifications and alerts</p>
        </div>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            disabled={getUnreadCount() === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setDeleteConfirm("all")}
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear all
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent notifications</CardTitle>
              <div className="flex items-center space-x-2">
                <Select 
                  value={filters.type || 'all'} 
                  onValueChange={(value) => setFilters({...filters, type: value === 'all' ? undefined : value as NotificationType})}
                >
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value={NotificationType.DEADLINE_APPROACHING}>Document Changes</SelectItem>
                    <SelectItem value={NotificationType.DOCUMENT_ALERT}>Mentions</SelectItem>
                    <SelectItem value={NotificationType.TASK_ASSIGNED}>Task Assignments</SelectItem>
                    <SelectItem value={NotificationType.STATUS_CHANGE}>Calendar Events</SelectItem>
                    <SelectItem value={NotificationType.STATUS_CHANGE}>Rejected Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 px-0">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mx-4 mb-4">
                <TabsTrigger value="all" className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Unread
                  {getUnreadCount() > 0 && (
                    <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">{getUnreadCount()}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read" className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Read
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="m-0">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : notifications.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {notifications.map((notification, index) => (
                      <motion.li 
                        key={notification.id}
                        className={cn(
                          "px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors relative",
                          !notification.isRead && "bg-blue-50"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                        {...fadeInAnimation}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        {deleteConfirm === notification.id ? (
                          <div className="flex items-center justify-between p-4 bg-red-50">
                            <p className="text-sm font-medium text-gray-900">Are you sure you want to delete this notification?</p>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start">
                            <div className="flex-shrink-0 pt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-gray-900">
                                    {getNotificationTypeLabel(notification.type)}
                                  </p>
                                  {notification.documentStatus && (
                                    <div className="ml-2">
                                      {getStatusBadge(notification.documentStatus)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <p className="text-xs text-gray-500">
                                    {notification.createdAt && !isNaN(new Date(notification.createdAt).getTime()) ? (
  formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
) : (
  "Unknown time"
)}

                                  </p>
                                  <div className="flex items-center space-x-1">
                                    {!notification.isRead && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="icon"
                                              className="h-8 w-8 text-blue-500 hover:text-blue-700"
                                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                                            >
                                              <Check className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Mark as read</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeleteConfirm(notification.id);
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Delete notification</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              </div>
                              <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
                              {notification.details && (
                                <p className="mt-1 text-xs text-gray-500">{notification.details}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {!notification.isRead && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                            <div className="h-8 w-1 bg-blue-500 rounded-r-md"></div>
                          </div>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="unread" className="m-0">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : notifications.filter(n => !n.isRead).length === 0 ? (
                  renderEmptyState()
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {notifications
                      .filter(notification => !notification.isRead)
                      .map((notification, index) => (
                        <motion.li 
                          key={notification.id}
                          className="px-4 py-4 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors relative"
                          onClick={() => handleNotificationClick(notification)}
                          {...fadeInAnimation}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          {deleteConfirm === notification.id ? (
                            <div className="flex items-center justify-between p-4 bg-red-50">
                              <p className="text-sm font-medium text-gray-900">Are you sure you want to delete this notification?</p>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start">
                              <div className="flex-shrink-0 pt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <p className="text-sm font-medium text-gray-900">
                                      {getNotificationTypeLabel(notification.type)}
                                    </p>
                                    {notification.documentStatus && (
                                      <div className="ml-2">
                                        {getStatusBadge(notification.documentStatus)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <p className="text-xs text-gray-500">
                                      {notification.createdAt && !isNaN(new Date(notification.createdAt).getTime()) ? (
  formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
) : (
  "Unknown time"
)}

                                    </p>
                                    <div className="flex items-center space-x-1">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="icon"
                                              className="h-8 w-8 text-blue-500 hover:text-blue-700"
                                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                                            >
                                              <Check className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Mark as read</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="icon"
                                              className="h-8 w-8 text-gray-500 hover:text-red-600"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirm(notification.id);
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Delete notification</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                </div>
                                <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
                                {notification.details && (
                                  <p className="mt-1 text-xs text-gray-500">{notification.details}</p>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                            <div className="h-8 w-1 bg-blue-500 rounded-r-md"></div>
                          </div>
                        </motion.li>
                      ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="read" className="m-0">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : notifications.filter(n => n.isRead).length === 0 ? (
                  renderEmptyState()
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {notifications
                      .filter(notification => notification.isRead)
                      .map((notification, index) => (
                        <motion.li 
                          key={notification.id}
                          className="px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleNotificationClick(notification)}
                          {...fadeInAnimation}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          {deleteConfirm === notification.id ? (
                            <div className="flex items-center justify-between p-4 bg-red-50">
                              <p className="text-sm font-medium text-gray-900">Are you sure you want to delete this notification?</p>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start">
                              <div className="flex-shrink-0 pt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <p className="text-sm font-medium text-gray-900">
                                      {getNotificationTypeLabel(notification.type)}
                                    </p>
                                    {notification.documentStatus && (
                                      <div className="ml-2">
                                        {getStatusBadge(notification.documentStatus)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <p className="text-xs text-gray-500">
                                      {notification.createdAt && !isNaN(new Date(notification.createdAt).getTime()) ? (
  formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
) : (
  "Unknown time"
)}

                                    </p>
                                    <div className="flex items-center space-x-1">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="icon"
                                              className="h-8 w-8 text-gray-500 hover:text-red-600"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirm(notification.id);
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Delete notification</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                </div>
                                <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
                                {notification.details && (
                                  <p className="mt-1 text-xs text-gray-500">{notification.details}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.li>
                      ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {deleteConfirm === "all" && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Are you sure you want to clear all notifications? This action cannot be undone.</span>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleClearAllNotifications}
                >
                  Clear All
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}