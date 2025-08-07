"use client"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { getCustomersForEmail, sendReportEmail, downloadReport, ReportType } from "@/actions/reports"
import { Loader2, DownloadIcon, MailIcon } from 'lucide-react'
import { DatePicker } from "./date-picker"

export default function DailyReportGenerator() {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [reportScope, setReportScope] = useState<"general" | "client">("general")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined)
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | undefined>(undefined)
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; email: string | null }>>([])
  const [attachmentFormat, setAttachmentFormat] = useState<"pdf" | "excel">("pdf")

  useEffect(() => {
    const fetchCustomers = async () => {
      const response = await getCustomersForEmail();
      if (response.success && response.data) {
        setCustomers(response.data);
      } else {
        toast.error("Failed to load customer list", { description: response.error });
      }
    };
    fetchCustomers();
  }, []);

  const sendReportMutation = useMutation({
    mutationFn: sendReportEmail,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Daily report sent successfully!", {
          description: `Email ID: ${data.data?.messageId}`,
        });
        setOpen(false);
      } else {
        toast.error("Failed to send daily report", {
          description: data.error || "An unknown error occurred.",
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to send daily report", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const downloadReportMutation = useMutation({
    mutationFn: (variables: { filters: any; format: "pdf" | "excel" }) => 
      downloadReport(variables.filters, variables.format),
    onSuccess: (data, variables) => {
      if (data.success && data.data) {
        const link = document.createElement('a');
        const mimeType = variables.format === 'pdf' 
          ? 'application/pdf' 
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const extension = variables.format === 'pdf' ? 'pdf' : 'xlsx';
        
        link.href = `data:${mimeType};base64,${data.data}`;
        link.download = `daily_shipment_report_${new Date().toISOString().split('T')[0]}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Daily report downloaded successfully as ${variables.format.toUpperCase()}!`);
        setOpen(false);
      } else {
        toast.error("Failed to download daily report", {
          description: data.error || "An unknown error occurred.",
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to download daily report", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomerEmail(customer?.email || undefined);
  };

  const getBaseFilters = () => {
    if (!selectedDate) {
      toast.error("Please select a date for the daily report.");
      return null;
    }
    if (reportScope === "client" && (!selectedCustomerId || !selectedCustomerEmail)) {
      toast.error("Please select a client and ensure they have an email address.");
      return null;
    }

    return {
      type: "DAILY_SHIPMENT_REPORT" as ReportType,
      dailyReportDate: selectedDate,
      dailyReportCustomerId: reportScope === "client" ? selectedCustomerId : undefined,
    };
  };

  const handleSendEmail = async () => {
    const filters = getBaseFilters();
    if (!filters) return;

    const recipientEmail = reportScope === "client" ? selectedCustomerEmail : "admin@example.com";
    if (!recipientEmail) {
      toast.error("Recipient email is missing. Cannot send report.");
      return;
    }

    sendReportMutation.mutate({
      recipientEmail,
      reportData: {} as any,
      reportType: "DAILY_SHIPMENT_REPORT",
      filters,
      customerSpecific: reportScope === "client",
      attachmentFormat: attachmentFormat,
    });
  };

  const handleDownload = async (format: "pdf" | "excel") => {
    const filters = getBaseFilters();
    if (!filters) return;

    downloadReportMutation.mutate({
      filters,
      format,
    });
  };

  const isActionDisabled = sendReportMutation.isPending || downloadReportMutation.isPending || (reportScope === "client" && (!selectedCustomerId || !selectedCustomerEmail));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-purple-600 text-white">Generate Daily Report</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg font-semibold">Generate Daily Report</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select the date and type of daily report you want to generate and send or download.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Report Date */}
          <div className="space-y-2">
            <Label htmlFor="report-date" className="text-sm font-medium">Report Date</Label>
            <DatePicker
              date={selectedDate}
              setDate={setSelectedDate}
              placeholder="Select report date"
            />
          </div>

          {/* Report Scope */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Report Scope</Label>
            <RadioGroup
              value={reportScope}
              onValueChange={(value: "general" | "client") => {
                setReportScope(value);
                if (value === "general") {
                  setSelectedCustomerId(undefined);
                  setSelectedCustomerEmail(undefined);
                }
              }}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general-report" />
                <Label htmlFor="general-report" className="text-sm">General (All Shipments)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client" id="client-report" />
                <Label htmlFor="client-report" className="text-sm">Client Specific</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Client Selection */}
          {reportScope === "client" && (
            <div className="space-y-2">
              <Label htmlFor="client-select" className="text-sm font-medium">Select Client</Label>
              <Select onValueChange={handleCustomerSelect} value={selectedCustomerId}>
                <SelectTrigger id="client-select">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id} disabled={!customer.email}>
                      {customer.name} {customer.email ? "" : "(No Email)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCustomerId && !selectedCustomerEmail && (
                <p className="text-xs text-red-500 mt-1">Selected client does not have an email address.</p>
              )}
            </div>
          )}

          {/* Attachment Format */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Attachment Format</Label>
            <RadioGroup
              value={attachmentFormat}
              onValueChange={(value: "pdf" | "excel") => setAttachmentFormat(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="format-pdf" />
                <Label htmlFor="format-pdf" className="text-sm">PDF</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="format-excel" />
                <Label htmlFor="format-excel" className="text-sm">Excel</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t">
          {/* Download buttons row */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => handleDownload("pdf")}
              disabled={isActionDisabled}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              {downloadReportMutation.isPending && downloadReportMutation.variables?.format === 'pdf' && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              <DownloadIcon className="mr-2 h-3 w-3" /> PDF
            </Button>
            <Button
              onClick={() => handleDownload("excel")}
              disabled={isActionDisabled}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              {downloadReportMutation.isPending && downloadReportMutation.variables?.format === 'excel' && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              <DownloadIcon className="mr-2 h-3 w-3" /> Excel
            </Button>
          </div>
          
          {/* Send button row */}
          <Button
            onClick={handleSendEmail}
            disabled={isActionDisabled}
            className="w-full sm:w-auto"
            size="sm"
          >
            {sendReportMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            <MailIcon className="mr-2 h-3 w-3" /> Send Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}