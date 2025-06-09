import { ExportOptions, ShipmentExportData } from "@/types/types";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

export class ShipmentExporter {
  private data: ShipmentExportData;

  constructor(data: ShipmentExportData) {
    this.data = data;
  }

  // Main export method
  async export(options: ExportOptions): Promise<void> {
    switch (options.format) {
      case "pdf":
        return this.exportToPDF(options);
      case "excel":
        return this.exportToExcel(options);
      case "csv":
        return this.exportToCSV(options);
      case "json":
        return this.exportToJSON(options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  // PDF Export - FIXED VERSION
  private async exportToPDF(options: ExportOptions): Promise<void> {
    const doc = new jsPDF();
    let yPosition = 20;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Helper function to safely add text
    const addText = (text: string, x: number, y: number) => {
      // Ensure text is a string and coordinates are numbers
      const safeText = String(text || "");
      const safeX = Number(x) || margin;
      const safeY = Number(y) || 20;

      if (safeText.trim() !== "") {
        doc.text(safeText, safeX, safeY);
      }
    };

    // Helper function to check if new page is needed
    const checkNewPage = () => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
    };

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    addText("Shipment Details Report", margin, yPosition);
    yPosition += 15;

    // Divider line
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Basic Information Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    addText("Basic Information", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const basicInfo = [
      ["Reference Number:", this.data.reference || "N/A"],
      ["Tracking Number:", this.data.trackingNumber || "N/A"],
      ["Client:", this.data.client || "N/A"],
      ["Status:", this.data.status || "N/A"],
      ["Invoice Status:", this.data.invoiceStatus || "N/A"],
      ["Type:", this.data.type || "N/A"],
      ["Origin:", this.data.origin || "N/A"],
      ["Destination:", this.data.destination || "N/A"],
      ["Created Date:", this.data.createdAt || "N/A"],
      ["Expected Arrival:", this.data.arrivalDate || "TBD"],
    ];

    basicInfo.forEach(([label, value]) => {
      checkNewPage();
      doc.setFont("helvetica", "bold");
      addText(String(label), margin, yPosition);
      doc.setFont("helvetica", "normal");
      addText(String(value), margin + 50, yPosition);
      yPosition += lineHeight;
    });

    yPosition += 10;

    // Progress Metrics Section
    checkNewPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    addText("Progress Metrics", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const progressInfo = [
      [
        "Documents Completed:",
        `${this.data.completedDocuments || 0}/${this.data.totalDocuments || 0}`,
      ],
      ["Completion Rate:", `${this.data.completionPercentage || 0}%`],
      ["Days to Arrival:", String(this.data.daysToArrival || "TBD")],
      ["Timeline Events:", String(this.data.timelineEvents || 0)],
    ];

    progressInfo.forEach(([label, value]) => {
      checkNewPage();
      doc.setFont("helvetica", "bold");
      addText(String(label), margin, yPosition);
      doc.setFont("helvetica", "normal");
      addText(String(value), margin + 50, yPosition);
      yPosition += lineHeight;
    });

    // Transport Details (if available)
    if (
      this.data.container ||
      this.data.truck ||
      this.data.vessel ||
      this.data.flight
    ) {
      yPosition += 10;
      checkNewPage();
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      addText("Transport Details", margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const transportDetails = [
        ["Container:", this.data.container],
        ["Truck:", this.data.truck],
        ["Vessel:", this.data.vessel],
        ["Flight:", this.data.flight],
      ].filter(([, value]) => value); // Only include non-empty values

      transportDetails.forEach(([label, value]) => {
        checkNewPage();
        doc.setFont("helvetica", "bold");
        addText(String(label), margin, yPosition);
        doc.setFont("helvetica", "normal");
        addText(String(value), margin + 50, yPosition);
        yPosition += lineHeight;
      });
    }

    // Documents Section (if included)
    if (
      options.includeDocuments &&
      this.data.documents &&
      this.data.documents.length > 0
    ) {
      yPosition += 15;
      checkNewPage();

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      addText("Documents", margin, yPosition);
      yPosition += 10;

      doc.setFontSize(9);

      // Table headers
      const headers = ["Document Name", "Type", "Status", "Uploaded"];
      const colWidths = [60, 40, 30, 40];
      let xPosition = margin;

      doc.setFont("helvetica", "bold");
      headers.forEach((header, index) => {
        addText(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      yPosition += 8;

      // Table data
      doc.setFont("helvetica", "normal");
      this.data.documents.forEach((docItem) => {
        checkNewPage();
        xPosition = margin;

        const rowData = [
          docItem.name || "N/A",
          (docItem.type || "").replace(/_/g, " "),
          docItem.status || "N/A",
          docItem.uploadedAt
            ? new Date(docItem.uploadedAt).toLocaleDateString()
            : "N/A",
        ];

        rowData.forEach((data, index) => {
          const maxWidth = colWidths[index] - 2;
          const textLines = doc.splitTextToSize(String(data), maxWidth);

          if (Array.isArray(textLines)) {
            textLines.forEach((line, lineIndex) => {
              addText(line, xPosition, yPosition + lineIndex * 4);
            });
          } else {
            addText(String(textLines), xPosition, yPosition);
          }

          xPosition += colWidths[index];
        });
        yPosition += 8;
      });
    }

    // Timeline Section (if included)
    if (
      options.includeTimeline &&
      this.data.timeline &&
      this.data.timeline.length > 0
    ) {
      yPosition += 15;
      checkNewPage();

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      addText("Timeline Events", margin, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      this.data.timeline.forEach((event) => {
        checkNewPage();

        doc.setFont("helvetica", "bold");
        const timestamp = event.timestamp
          ? new Date(event.timestamp).toLocaleString()
          : "N/A";
        addText(timestamp, margin, yPosition);
        yPosition += 6;

        doc.setFont("helvetica", "normal");
        addText(String(event.event || ""), margin + 5, yPosition);
        yPosition += 5;

        if (event.description) {
          const descText = doc.splitTextToSize(
            String(event.description),
            pageWidth - 2 * margin - 10
          );

          if (Array.isArray(descText)) {
            descText.forEach((line, index) => {
              addText(line, margin + 10, yPosition + index * 5);
            });
            yPosition += descText.length * 5;
          } else {
            addText(String(descText), margin + 10, yPosition);
            yPosition += 5;
          }
        }

        yPosition += 5;
      });
    }

    // Checkpoints Section (if included)
    if (
      options.includeCheckpoints &&
      this.data.checkpoints &&
      this.data.checkpoints.length > 0
    ) {
      yPosition += 15;
      checkNewPage();

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      addText("Checkpoints", margin, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      this.data.checkpoints.forEach((checkpoint) => {
        checkNewPage();

        doc.setFont("helvetica", "bold");
        addText(String(checkpoint.location || "N/A"), margin, yPosition);
        yPosition += 6;

        doc.setFont("helvetica", "normal");
        const timestamp = checkpoint.timestamp
          ? new Date(checkpoint.timestamp).toLocaleString()
          : "N/A";
        addText(
          `Status: ${checkpoint.status || "N/A"} - ${timestamp}`,
          margin + 5,
          yPosition
        );
        yPosition += 5;

        if (checkpoint.description) {
          addText(String(checkpoint.description), margin + 10, yPosition);
          yPosition += 5;
        }

        yPosition += 5;
      });
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      addText(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${totalPages}`,
        margin,
        doc.internal.pageSize.height - 10
      );
    }

    // Save the PDF
    const filename = `shipment_${this.data.reference || "export"}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
  }

  // Excel Export
  private async exportToExcel(options: ExportOptions): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Main shipment data sheet
    const mainData = [
      ["Shipment Details Report"],
      [""],
      ["Basic Information"],
      ["Reference Number", this.data.reference || "N/A"],
      ["Tracking Number", this.data.trackingNumber || "N/A"],
      ["Client", this.data.client || "N/A"],
      ["Status", this.data.status || "N/A"],
      ["Invoice Status", this.data.invoiceStatus || "N/A"],
      ["Type", this.data.type || "N/A"],
      ["Origin", this.data.origin || "N/A"],
      ["Destination", this.data.destination || "N/A"],
      ["Created Date", this.data.createdAt || "N/A"],
      ["Expected Arrival", this.data.arrivalDate || "TBD"],
      [""],
      ["Progress Metrics"],
      [
        "Documents Completed",
        `${this.data.completedDocuments || 0}/${this.data.totalDocuments || 0}`,
      ],
      ["Completion Rate", `${this.data.completionPercentage || 0}%`],
      ["Days to Arrival", String(this.data.daysToArrival || "TBD")],
      ["Timeline Events", String(this.data.timelineEvents || 0)],
    ];

    // Add transport details if available
    const transportData = [
      ["Container", this.data.container ?? "N/A"],
      ["Truck", this.data.truck ?? "N/A"],
      ["Vessel", this.data.vessel ?? "N/A"],
      ["Flight", this.data.flight ?? "N/A"],
    ].filter(([, value]) => value && value !== "N/A");

    if (transportData.length > 0) {
      mainData.push([""], ["Transport Details"]);
      mainData.push(...(transportData as string[][]));
    }

    const mainSheet = XLSX.utils.aoa_to_sheet(mainData);
    XLSX.utils.book_append_sheet(workbook, mainSheet, "Shipment Details");

    // Documents sheet (if included)
    if (
      options.includeDocuments &&
      this.data.documents &&
      this.data.documents.length > 0
    ) {
      const docData = [
        ["Document Name", "Type", "Status", "Uploaded Date", "Notes"],
      ];

      this.data.documents.forEach((doc) => {
        docData.push([
          doc.name || "N/A",
          (doc.type || "").replace(/_/g, " "),
          doc.status || "N/A",
          doc.uploadedAt
            ? new Date(doc.uploadedAt).toLocaleDateString()
            : "N/A",
          doc.notes || "",
        ]);
      });

      const docSheet = XLSX.utils.aoa_to_sheet(docData);
      XLSX.utils.book_append_sheet(workbook, docSheet, "Documents");
    }

    // Timeline sheet (if included)
    if (
      options.includeTimeline &&
      this.data.timeline &&
      this.data.timeline.length > 0
    ) {
      const timelineData = [
        ["Timestamp", "Event", "Description", "Location", "Status"],
      ];

      this.data.timeline.forEach((event) => {
        timelineData.push([
          event.timestamp ? new Date(event.timestamp).toLocaleString() : "N/A",
          event.event || "N/A",
          event.description || "",
          event.location || "",
          event.status || "",
        ]);
      });

      const timelineSheet = XLSX.utils.aoa_to_sheet(timelineData);
      XLSX.utils.book_append_sheet(workbook, timelineSheet, "Timeline");
    }

    // Checkpoints sheet (if included)
    if (
      options.includeCheckpoints &&
      this.data.checkpoints &&
      this.data.checkpoints.length > 0
    ) {
      const checkpointData = [
        ["Location", "Status", "Timestamp", "Description"],
      ];

      this.data.checkpoints.forEach((checkpoint) => {
        checkpointData.push([
          checkpoint.location || "N/A",
          checkpoint.status || "N/A",
          checkpoint.timestamp
            ? new Date(checkpoint.timestamp).toLocaleString()
            : "N/A",
          checkpoint.description || "",
        ]);
      });

      const checkpointSheet = XLSX.utils.aoa_to_sheet(checkpointData);
      XLSX.utils.book_append_sheet(workbook, checkpointSheet, "Checkpoints");
    }

    // Save the Excel file
    const filename = `shipment_${this.data.reference || "export"}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
  }

  // CSV Export
  private async exportToCSV(options: ExportOptions): Promise<void> {
    const csvData = [
      ["Field", "Value"],
      ["Reference Number", this.data.reference || "N/A"],
      ["Tracking Number", this.data.trackingNumber || "N/A"],
      ["Client", this.data.client || "N/A"],
      ["Status", this.data.status || "N/A"],
      ["Invoice Status", this.data.invoiceStatus || "N/A"],
      ["Type", this.data.type || "N/A"],
      ["Origin", this.data.origin || "N/A"],
      ["Destination", this.data.destination || "N/A"],
      ["Created Date", this.data.createdAt || "N/A"],
      ["Expected Arrival", this.data.arrivalDate || "TBD"],
      [
        "Documents Completed",
        `${this.data.completedDocuments || 0}/${this.data.totalDocuments || 0}`,
      ],
      ["Completion Rate", `${this.data.completionPercentage || 0}%`],
      ["Days to Arrival", String(this.data.daysToArrival || "TBD")],
      ["Timeline Events", String(this.data.timelineEvents || 0)],
    ];

    // Add transport details if available
    if (this.data.container) csvData.push(["Container", this.data.container]);
    if (this.data.truck) csvData.push(["Truck", this.data.truck]);
    if (this.data.vessel) csvData.push(["Vessel", this.data.vessel]);
    if (this.data.flight) csvData.push(["Flight", this.data.flight]);

    const csvString = csvData
      .map((row) => row.map((field) => `"${String(field || "")}"`).join(","))
      .join("\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shipment_${this.data.reference || "export"}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  // JSON Export
  private async exportToJSON(options: ExportOptions): Promise<void> {
    const jsonData = {
      ...this.data,
      exportOptions: options,
      generatedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], {
      type: "application/json;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shipment_${this.data.reference || "export"}_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  }
}

// Helper function to prepare shipment data for export
export const prepareShipmentForExport = (shipment: any): ShipmentExportData => {
  // Ensure shipment is valid
  if (!shipment) {
    throw new Error("Invalid shipment data provided for export");
  }

  const requiredDocTypes = [
    "COMMERCIAL_INVOICE",
    "PACKING_LIST",
    shipment.type === "SEA" ? "BILL_OF_LADING" : "AIRWAY_BILL",
    "IMPORT_LICENCE",
    "CERTIFICATE_OF_CONFORMITY",
    "TAX_EXEMPTION",
    "CERTIFICATE_OF_ORIGIN",
  ];

  const documents = shipment.documents || [];
  const completedDocs = documents.filter(
    (doc: any) => doc?.status === "VERIFIED"
  ).length;
  const totalRequiredDocs = requiredDocTypes.length;
  const completionPercentage =
    totalRequiredDocs > 0
      ? Math.round((completedDocs / totalRequiredDocs) * 100)
      : 0;

  const daysToArrival = shipment.arrivalDate
    ? Math.ceil(
        (new Date(shipment.arrivalDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : undefined;

  return {
    reference: shipment.reference || "N/A",
    trackingNumber: shipment.trackingNumber || undefined,
    client: shipment.client || "N/A",
    status: shipment.status || "N/A",
    invoiceStatus: shipment.invoiceStatus || "N/A",
    type: shipment.type || "N/A",
    origin: shipment.origin || "N/A",
    destination: shipment.destination || "N/A",
    createdAt: shipment.createdAt
      ? new Date(shipment.createdAt).toLocaleDateString()
      : "N/A",
    arrivalDate: shipment.arrivalDate
      ? new Date(shipment.arrivalDate).toLocaleDateString()
      : undefined,
    departureDate: shipment.departureDate
      ? new Date(shipment.departureDate).toLocaleDateString()
      : undefined,
    container: shipment.container || undefined,
    truck: shipment.truck || undefined,
    vessel: shipment.vessel || undefined,
    flight: shipment.flight || undefined,
    completedDocuments: completedDocs,
    totalDocuments: totalRequiredDocs,
    completionPercentage,
    daysToArrival,
    timelineEvents: shipment.timeline?.length || 0,
    documents: documents.map((doc: any) => ({
      name: doc?.name || "N/A",
      type: doc?.type || "N/A",
      status: doc?.status || "N/A",
      uploadedAt: doc?.uploadedAt || new Date().toISOString(),
      notes: doc?.notes || undefined,
      verifiedAt: doc?.verifiedAt || undefined,
      rejectedAt: doc?.rejectedAt || undefined,
    })),
    timeline: (shipment.timeline || []).map((event: any) => ({
      id: event?.id || Math.random().toString(),
      event: event?.event || "N/A",
      description: event?.description || undefined,
      timestamp: event?.timestamp || new Date().toISOString(),
      location: event?.location || undefined,
      status: event?.status || undefined,
    })),
    checkpoints: (shipment.checkpoints || []).map((checkpoint: any) => ({
      id: checkpoint?.id || Math.random().toString(),
      location: checkpoint?.location || "N/A",
      status: checkpoint?.status || "N/A",
      timestamp: checkpoint?.timestamp || new Date().toISOString(),
      description: checkpoint?.description || undefined,
    })),
    exportedAt: new Date().toISOString(),
    exportedBy: "Current User",
  };
};
