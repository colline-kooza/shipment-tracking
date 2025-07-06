"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Download,
  BarChart3,
  Users,
  Package,
  FileCheck,
  TrendingUp,
  MapPin,
  Activity,
  Loader2,
  CheckCircle,
  X,
  RefreshCw,
  Clock,
  Target,
} from "lucide-react"

import { useReportMetadata, useGenerateReport } from "@/hooks/use-reports"
import type { ShipmentStatus, ShipmentType } from "@prisma/client"
import { ReportData, ReportFilters, ReportType } from "@/actions/reports"
import { toast } from "sonner"

interface ReportGenerationModalProps {
  isOpen: boolean
  onClose: () => void
}

// PDF Download Component - Inline definition to avoid import issues
const PDFDownloadComponent: React.FC<{
  reportData: ReportData
  reportType: ReportType
  filters: any
}> = ({ reportData, reportType, filters }) => {
  const handleDownloadPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { Document, Page, Text, View, StyleSheet, pdf } = await import("@react-pdf/renderer")

      // Create PDF styles
      const styles = StyleSheet.create({
        page: {
          flexDirection: "column",
          backgroundColor: "#ffffff",
          padding: 30,
          fontFamily: "Helvetica",
        },
        header: {
          marginBottom: 20,
          borderBottom: 2,
          borderBottomColor: "#3b82f6",
          paddingBottom: 10,
        },
        title: {
          fontSize: 24,
          fontWeight: "bold",
          color: "#1f2937",
          marginBottom: 5,
        },
        subtitle: {
          fontSize: 12,
          color: "#6b7280",
        },
        section: {
          marginBottom: 20,
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: "bold",
          color: "#374151",
          marginBottom: 10,
        },
        summaryGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 15,
        },
        summaryCard: {
          width: "48%",
          marginRight: "2%",
          marginBottom: 10,
          padding: 10,
          backgroundColor: "#f9fafb",
          borderRadius: 4,
        },
        summaryValue: {
          fontSize: 18,
          fontWeight: "bold",
          color: "#1f2937",
        },
        summaryLabel: {
          fontSize: 10,
          color: "#6b7280",
          marginTop: 2,
        },
        table: {
          marginBottom: 15,
        },
        tableRow: {
          flexDirection: "row",
          borderBottom: 1,
          borderBottomColor: "#e5e7eb",
          paddingVertical: 8,
        },
        tableHeader: {
          backgroundColor: "#f3f4f6",
          fontWeight: "bold",
        },
        tableCell: {
          flex: 1,
          fontSize: 10,
          paddingHorizontal: 5,
        },
      })

      const formatNumber = (num: number) => new Intl.NumberFormat().format(num)
      const formatDate = (date: Date) => date.toLocaleDateString()

      const getReportTitle = (type: ReportType) => {
        const titles = {
          SHIPMENTS_SUMMARY: "Shipments Summary Report",
          DOCUMENT_STATUS: "Document Status Report",
          CUSTOMER_ANALYTICS: "Customer Analytics Report",
          REVENUE_ANALYSIS: "Revenue Analysis Report",
          USER_ACTIVITY: "User Activity Report",
          TIMELINE_ANALYTICS: "Timeline Analytics Report",
          ROUTE_ANALYTICS: "Route Analytics Report",
          PERFORMANCE_METRICS: "Performance Metrics Report",
        }
        return titles[type] || "Report"
      }

      // Create PDF document
      const MyDocument = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{getReportTitle(reportType)}</Text>
              <Text style={styles.subtitle}>
                Generated on {formatDate(new Date())}
                {filters.dateRange &&
                  ` | Period: ${formatDate(filters.dateRange.from)} - ${formatDate(filters.dateRange.to)}`}
              </Text>
            </View>

            {/* Summary Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Executive Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatNumber(reportData.summary.totalShipments)}</Text>
                  <Text style={styles.summaryLabel}>Total Shipments</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatNumber(reportData.summary.totalCustomers)}</Text>
                  <Text style={styles.summaryLabel}>Total Customers</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatNumber(reportData.summary.totalDocuments)}</Text>
                  <Text style={styles.summaryLabel}>Total Documents</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatNumber(reportData.summary.activeShipments)}</Text>
                  <Text style={styles.summaryLabel}>Active Shipments</Text>
                </View>
              </View>
            </View>

            {/* Shipment Status Distribution */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shipment Status Distribution</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Status</Text>
                  <Text style={styles.tableCell}>Count</Text>
                  <Text style={styles.tableCell}>Percentage</Text>
                </View>
                {reportData.shipmentsByStatus.slice(0, 10).map((status, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{status.status.replace("_", " ")}</Text>
                    <Text style={styles.tableCell}>{formatNumber(status.count)}</Text>
                    <Text style={styles.tableCell}>{status.percentage}%</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Top Customers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Customers</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Customer</Text>
                  <Text style={styles.tableCell}>Total Shipments</Text>
                  <Text style={styles.tableCell}>Completed</Text>
                  <Text style={styles.tableCell}>Pending</Text>
                </View>
                {reportData.customerAnalytics.slice(0, 8).map((customer, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{customer.customerName}</Text>
                    <Text style={styles.tableCell}>{formatNumber(customer.totalShipments)}</Text>
                    <Text style={styles.tableCell}>{formatNumber(customer.completedShipments)}</Text>
                    <Text style={styles.tableCell}>{formatNumber(customer.pendingShipments)}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Performance Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Metrics</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{reportData.performanceMetrics.onTimeDeliveryRate}%</Text>
                  <Text style={styles.summaryLabel}>On-Time Delivery Rate</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{reportData.performanceMetrics.documentApprovalRate}%</Text>
                  <Text style={styles.summaryLabel}>Document Approval Rate</Text>
                </View>
              </View>
            </View>
          </Page>
        </Document>
      )

      // Generate and download PDF
      const blob = await pdf(<MyDocument />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${reportType.toLowerCase()}_report_${new Date().toISOString().split("T")[0]}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  return (
    <Button onClick={handleDownloadPDF} className="bg-red-600 hover:bg-red-700">
      <Download className="h-4 w-4 mr-2" />
      Download PDF
    </Button>
  )
}

const REPORT_TYPES = [
  {
    id: "SHIPMENTS_SUMMARY" as ReportType,
    name: "Shipments Summary",
    description: "Comprehensive overview of all shipments with status breakdown and trends",
    icon: Package,
    color: "bg-blue-500",
  },
  {
    id: "DOCUMENT_STATUS" as ReportType,
    name: "Document Status",
    description: "Document verification analytics and processing status",
    icon: FileCheck,
    color: "bg-green-500",
  },
  {
    id: "CUSTOMER_ANALYTICS" as ReportType,
    name: "Customer Analytics",
    description: "Customer activity patterns and performance metrics",
    icon: Users,
    color: "bg-purple-500",
  },
  {
    id: "REVENUE_ANALYSIS" as ReportType,
    name: "Revenue Analysis",
    description: "Financial performance and revenue trend analysis",
    icon: TrendingUp,
    color: "bg-orange-500",
  },
  {
    id: "USER_ACTIVITY" as ReportType,
    name: "User Activity",
    description: "User engagement and productivity analytics",
    icon: Activity,
    color: "bg-teal-500",
  },
  {
    id: "TIMELINE_ANALYTICS" as ReportType,
    name: "Timeline Analytics",
    description: "Shipment progression and timeline analysis",
    icon: Clock,
    color: "bg-indigo-500",
  },
  {
    id: "ROUTE_ANALYTICS" as ReportType,
    name: "Route Analytics",
    description: "Popular shipping routes and performance metrics",
    icon: MapPin,
    color: "bg-pink-500",
  },
  {
    id: "PERFORMANCE_METRICS" as ReportType,
    name: "Performance Metrics",
    description: "Overall system performance and KPI analysis",
    icon: Target,
    color: "bg-cyan-500",
  },
]

const SHIPMENT_STATUSES = [
  "CREATED",
  "DOCUMENT_RECEIVED",
  "DOCUMENTS_SENT",
  "CARGO_ARRIVED",
  "DELIVERY_CONFIRMED",
  "ENTRY_REGISTERED",
  "CLEARED",
  "IN_TRANSIT",
  "DELIVERED",
  "COMPLETED",
  "DOCUMENT_REJECTED",
] as ShipmentStatus[]

const SHIPMENT_TYPES = ["SEA", "AIR", "ROAD"] as ShipmentType[]

// Enhanced Report Preview Component
const ReportPreview: React.FC<{ reportData: ReportData; reportType: ReportType; filters: ReportFilters }> = ({
  reportData,
  reportType,
  filters,
}) => {
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num)
  const formatPercentage = (num: number) => `${num}%`

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Report Generated Successfully</h3>
        <p className="text-gray-600">Your {REPORT_TYPES.find((rt) => rt.id === reportType)?.name} report is ready</p>
      </div>

      {/* Enhanced Summary Cards */}
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

      {/* Status Distribution */}
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

      {/* Performance Metrics */}
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

      {/* Top Routes */}
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

      {/* Customer Analytics */}
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
  )
}

export default function ReportGenerationModal({ isOpen, onClose }: ReportGenerationModalProps) {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>("SHIPMENTS_SUMMARY")
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  })
  const [selectedStatuses, setSelectedStatuses] = useState<ShipmentStatus[]>([])
  const [selectedTypes, setSelectedTypes] = useState<ShipmentType[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null)
  const [currentStep, setCurrentStep] = useState<"config" | "generating" | "preview">("config")
  const [progress, setProgress] = useState(0)

  const { data: metadata, isLoading: metadataLoading } = useReportMetadata()
  const generateReportMutation = useGenerateReport()

  const resetForm = () => {
    setSelectedReportType("SHIPMENTS_SUMMARY")
    setDateRange({ from: "", to: "" })
    setSelectedStatuses([])
    setSelectedTypes([])
    setSelectedCustomer("all")
    setSelectedUser("all")
    setCurrentStep("config")
    setGeneratedReport(null)
    setProgress(0)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleStatusToggle = (status: ShipmentStatus) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const handleTypeToggle = (type: ShipmentType) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  // Simulate progress for better UX
  useEffect(() => {
    if (currentStep === "generating") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  const handleGenerateReport = async () => {
    const filters: ReportFilters = {
      type: selectedReportType,
      ...(dateRange.from &&
        dateRange.to && {
          dateRange: {
            from: new Date(dateRange.from),
            to: new Date(dateRange.to),
          },
        }),
      ...(selectedStatuses.length > 0 && { status: selectedStatuses }),
      ...(selectedTypes.length > 0 && { shipmentType: selectedTypes }),
      ...(selectedCustomer !== "all" && { customerId: selectedCustomer }),
      ...(selectedUser !== "all" && { userId: selectedUser }),
    }

    setCurrentStep("generating")
    setProgress(0)

    try {
      const reportData = await generateReportMutation.mutateAsync(filters)
      setProgress(100)
      setGeneratedReport(reportData)
      setTimeout(() => setCurrentStep("preview"), 500)

      toast.success("Report Generated")
    } catch (error) {
      console.error("Failed to generate report:", error)
      setCurrentStep("config")
      setProgress(0)

      toast.error("Failed to generate report")
    }
  }

  const handleDownloadReport = () => {
    if (!generatedReport) return

    const reportContent = {
      type: selectedReportType,
      generatedAt: new Date().toISOString(),
      filters: {
        dateRange,
        statuses: selectedStatuses,
        types: selectedTypes,
        customer: selectedCustomer,
        user: selectedUser,
      },
      data: generatedReport,
    }

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedReportType.toLowerCase()}_report_${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Download Complete")
  }

  const handleNewReport = () => {
    resetForm()
  }

  const selectedReportConfig = REPORT_TYPES.find((rt) => rt.id === selectedReportType)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <BarChart3 className="h-5 w-5" />
            {currentStep === "config" && "Generate Report"}
            {currentStep === "generating" && "Generating Report..."}
            {currentStep === "preview" && "Report Preview"}
          </DialogTitle>
        </DialogHeader>

        {/* Configuration Step */}
        {currentStep === "config" && (
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Select Report Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REPORT_TYPES.map((reportType) => {
                  const Icon = reportType.icon
                  return (
                    <Card
                      key={reportType.id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedReportType === reportType.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedReportType(reportType.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${reportType.color} text-white`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-sm">{reportType.name}</CardTitle>
                            <CardDescription className="text-xs">{reportType.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Filters */}
            <Tabs defaultValue="dateRange" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dateRange">Date Range</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="types">Types</TabsTrigger>
                <TabsTrigger value="entities">Entities</TabsTrigger>
              </TabsList>

              <TabsContent value="dateRange" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From Date</Label>
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>To Date</Label>
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <div>
                  <Label>Shipment Status</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {SHIPMENT_STATUSES.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={status}
                          checked={selectedStatuses.includes(status)}
                          onCheckedChange={() => handleStatusToggle(status)}
                        />
                        <Label htmlFor={status} className="text-sm">
                          {status.replace("_", " ")}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedStatuses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedStatuses.map((status) => (
                        <Badge key={status} variant="secondary" className="bg-blue-100">
                          {status.replace("_", " ")}
                          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleStatusToggle(status)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="types" className="space-y-4">
                <div>
                  <Label>Shipment Type</Label>
                  <div className="flex gap-4 mt-2">
                    {SHIPMENT_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => handleTypeToggle(type)}
                        />
                        <Label htmlFor={type} className="text-sm">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="bg-green-100">
                          {type}
                          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleTypeToggle(type)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="entities" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Customer</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        {metadata?.customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>User</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {metadata?.users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Generating Step */}
        {currentStep === "generating" && (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Generating your report...</h3>
              <p className="text-gray-600 mb-4">
                Processing {selectedReportConfig?.name.toLowerCase()} with your selected filters
              </p>
              <div className="max-w-md mx-auto">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% complete</p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {currentStep === "preview" && generatedReport && (
          <ReportPreview
            reportData={generatedReport}
            reportType={selectedReportType}
            filters={{
              type: selectedReportType,
              dateRange:
                dateRange.from && dateRange.to
                  ? {
                      from: new Date(dateRange.from),
                      to: new Date(dateRange.to),
                    }
                  : undefined,
              status: selectedStatuses,
              shipmentType: selectedTypes,
              customerId: selectedCustomer !== "all" ? selectedCustomer : undefined,
              userId: selectedUser !== "all" ? selectedUser : undefined,
            }}
          />
        )}

        {/* Footer */}
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {currentStep === "preview" && (
              <Button variant="outline" onClick={handleNewReport} className="flex items-center gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                New Report
              </Button>
            )}
            {currentStep === "generating" && (
              <Button variant="outline" disabled>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              {currentStep === "preview" ? "Close" : "Cancel"}
            </Button>
            {currentStep === "config" && (
              <Button
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending || metadataLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {generateReportMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            )}
            {currentStep === "preview" && generatedReport && (
              <>
                <Button onClick={handleDownloadReport} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
                <PDFDownloadComponent
                  reportData={generatedReport}
                  reportType={selectedReportType}
                  filters={{
                    type: selectedReportType,
                    dateRange:
                      dateRange.from && dateRange.to
                        ? {
                            from: new Date(dateRange.from),
                            to: new Date(dateRange.to),
                          }
                        : undefined,
                    status: selectedStatuses,
                    shipmentType: selectedTypes,
                    customerId: selectedCustomer !== "all" ? selectedCustomer : undefined,
                    userId: selectedUser !== "all" ? selectedUser : undefined,
                  }}
                />
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
