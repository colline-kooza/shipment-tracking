import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Star, MapPin } from 'lucide-react';
import type { ReportData, ReportType, ReportFilters } from "@/actions/reports";

interface ReportPreviewProps {
  reportData: ReportData;
  reportType: ReportType;
  filters: ReportFilters;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ reportData, reportType }) => {
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatPercentage = (num: number) => `${num}%`;
  const reportTypeName = {
    SHIPMENTS_SUMMARY: "Shipments Summary",
    DOCUMENT_STATUS: "Document Status",
    CUSTOMER_ANALYTICS: "Customer Analytics",
    REVENUE_ANALYSIS: "Revenue Analysis",
    USER_ACTIVITY: "User Activity",
    TIMELINE_ANALYTICS: "Timeline Analytics",
    ROUTE_ANALYTICS: "Route Analytics",
    PERFORMANCE_METRICS: "Performance Metrics",
    DAILY_SHIPMENT_REPORT: "Daily Shipment",
  }[reportType] || "Report";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Report Generated Successfully</h3>
        <p className="text-gray-600">Your {reportTypeName} report is ready</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatNumber(reportData.summary.totalShipments)}</div>
            <div className="text-sm text-gray-600">Total Shipments</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatNumber(reportData.summary.activeShipments)}</div>
            <div className="text-sm text-gray-600">Active Shipments</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatNumber(reportData.summary.totalCustomers)}</div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{formatNumber(reportData.summary.totalDocuments)}</div>
            <div className="text-sm text-gray-600">Total Documents</div>
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shipment Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.shipmentsByStatus.map((status) => (
              <div key={status.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {status.status.replace("_", " ")}
                  </Badge>
                  <span className="text-sm text-gray-600">{formatNumber(status.count)} shipments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={status.percentage} className="w-20" />
                  <span className="text-sm font-medium">{formatPercentage(status.percentage)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(reportData.performanceMetrics.onTimeDeliveryRate)}
              </div>
              <div className="text-sm text-gray-600">On-Time Delivery</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatPercentage(reportData.performanceMetrics.documentApprovalRate)}
              </div>
              <div className="text-sm text-gray-600">Document Approval</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {reportData.performanceMetrics.customerSatisfactionScore}
              </div>
              <div className="text-sm text-gray-600">Satisfaction Score</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {reportData.performanceMetrics.averageDeliveryTime}d
              </div>
              <div className="text-sm text-gray-600">Avg Delivery Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {reportData.topRoutes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.topRoutes.slice(0, 5).map((route, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{route.route}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{formatNumber(route.count)}</span>
                    <Badge variant="outline">{formatPercentage(route.percentage)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {reportData.customerAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.customerAnalytics.slice(0, 5).map((customer) => (
                <div key={customer.customerId} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{customer.customerName}</div>
                    <div className="text-sm text-gray-600">{formatNumber(customer.totalShipments)} total shipments</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="text-green-600">{formatNumber(customer.completedShipments)} completed</span>
                      <span className="text-gray-400 mx-1">•</span>
                      <span className="text-orange-600">{formatNumber(customer.pendingShipments)} pending</span>
                    </div>
                    <div className="text-xs text-gray-500">Avg delivery: {customer.averageDeliveryTime} days</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportPreview;
