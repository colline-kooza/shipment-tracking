"use client"

import type React from "react"
import { useState } from "react"
import { Download, FileText, Table, File, Code, Loader2, CheckCircle2, AlertCircle, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ShipmentExporter, prepareShipmentForExport } from "@/utils/shipment-export"
import type { ExportOptions } from "@/types/types"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

interface ExportDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  shipment: any
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onOpenChange, shipment }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "pdf",
    includeDocuments: true,
    includeTimeline: true,
    includeCheckpoints: true,
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle")

  const formatOptions = [
    {
      value: "pdf",
      label: "PDF Report",
      description: "Professional formatted document with tables and charts",
      icon: FileText,
      recommended: true,
      size: "~2-5 MB",
    },
    {
      value: "excel",
      label: "Excel Workbook",
      description: "Spreadsheet with multiple sheets for data analysis",
      icon: Table,
      recommended: false,
      size: "~1-3 MB",
    },
    {
      value: "csv",
      label: "CSV File",
      description: "Simple comma-separated values for basic data",
      icon: File,
      recommended: false,
      size: "~50-200 KB",
    },
    {
      value: "json",
      label: "JSON Data",
      description: "Raw structured data for developers",
      icon: Code,
      recommended: false,
      size: "~100-500 KB",
    },
  ]

  const handleFormatChange = (format: string) => {
    setExportOptions((prev) => ({
      ...prev,
      format: format as ExportOptions["format"],
    }))
  }

  const handleOptionChange = (option: keyof Omit<ExportOptions, "format">, checked: boolean) => {
    setExportOptions((prev) => ({
      ...prev,
      [option]: checked,
    }))
  }

  const handleExport = async () => {
    if (!shipment) {
      toast.error("No shipment data available for export")
      return
    }

    setIsExporting(true)
    setExportStatus("idle")

    try {
      // Prepare shipment data for export
      const exportData = prepareShipmentForExport(shipment)

      // Create exporter instance and export
      const exporter = new ShipmentExporter(exportData)
      await exporter.export(exportOptions)

      setExportStatus("success")
      toast.success(`Shipment details exported as ${exportOptions.format.toUpperCase()} successfully!`)

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false)
        setExportStatus("idle")
      }, 1500)
    } catch (error) {
      console.error("Export failed:", error)
      setExportStatus("error")
      toast.error("Failed to export shipment details. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const getPreview = () => {
    const sections = []
    sections.push("Basic Information")
    sections.push("Progress Metrics")
    sections.push("Transport Details")

    if (exportOptions.includeDocuments) sections.push("Documents")
    if (exportOptions.includeTimeline) sections.push("Timeline Events")
    if (exportOptions.includeCheckpoints) sections.push("Checkpoints")

    return sections
  }

  const selectedFormat = formatOptions.find((f) => f.value === exportOptions.format)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Shipment Details
          </DialogTitle>
          <DialogDescription>
            Export comprehensive details for shipment {shipment?.reference || shipment?.trackingNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Status */}
          {exportStatus !== "idle" && (
            <Card
              className={`p-4 ${exportStatus === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <div className="flex items-center gap-3">
                {exportStatus === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className={`font-medium ${exportStatus === "success" ? "text-green-800" : "text-red-800"}`}>
                    {exportStatus === "success" ? "Export Successful!" : "Export Failed"}
                  </p>
                  <p className={`text-sm ${exportStatus === "success" ? "text-green-600" : "text-red-600"}`}>
                    {exportStatus === "success"
                      ? "Your file has been downloaded successfully."
                      : "Please try again or contact support if the issue persists."}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Format Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Export Format</h3>
              <RadioGroup value={exportOptions.format} onValueChange={handleFormatChange} className="space-y-3">
                {formatOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <div key={option.value} className="flex items-start space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{option.label}</span>
                          {option.recommended && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                              Recommended
                            </span>
                          )}
                          <span className="text-xs text-gray-500 ml-auto">{option.size}</span>
                        </Label>
                        <p className="text-sm text-gray-500 mt-1 ml-6">{option.description}</p>
                      </div>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
          </div>

          <Separator />

          {/* Content Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Include Sections</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDocuments"
                  checked={exportOptions.includeDocuments}
                  onCheckedChange={(checked) => handleOptionChange("includeDocuments", checked as boolean)}
                />
                <Label htmlFor="includeDocuments" className="text-sm flex-1">
                  Documents ({shipment?.documents?.length || 0} items)
                </Label>
                <span className="text-xs text-gray-500">Document list with status and details</span>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTimeline"
                  checked={exportOptions.includeTimeline}
                  onCheckedChange={(checked) => handleOptionChange("includeTimeline", checked as boolean)}
                />
                <Label htmlFor="includeTimeline" className="text-sm flex-1">
                  Timeline Events ({shipment?.timeline?.length || 0} items)
                </Label>
                <span className="text-xs text-gray-500">Chronological event history</span>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCheckpoints"
                  checked={exportOptions.includeCheckpoints}
                  onCheckedChange={(checked) => handleOptionChange("includeCheckpoints", checked as boolean)}
                />
                <Label htmlFor="includeCheckpoints" className="text-sm flex-1">
                  Checkpoints ({shipment?.checkpoints?.length || 0} items)
                </Label>
                <span className="text-xs text-gray-500">Location tracking points</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Export Preview
            </h3>
            <Card className="p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Format:</span>
                  <span className="text-sm text-gray-600">{selectedFormat?.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sections:</span>
                  <span className="text-sm text-gray-600">{getPreview().length} sections</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimated size:</span>
                  <span className="text-sm text-gray-600">{selectedFormat?.size}</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Included sections:</p>
                <div className="flex flex-wrap gap-1">
                  {getPreview().map((section, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || exportStatus === "success"}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : exportStatus === "success" ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Exported
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {selectedFormat?.label}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportDialog
