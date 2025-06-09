/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import "jspdf-autotable";
import bjmp from "@/assets/Logo/QCJMD.png";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface PDFColumn {
  header: string;
  dataKey: string;
}

interface PDFGeneratorOptions {
  title: string;
  headers: PDFColumn[];
  data: any[];
  filename?: string;
  orientation?: "portrait" | "landscape";
  showDate?: boolean;
  showPageNumbers?: boolean;
  customHeaderColor?: string;
  customTextColor?: string;
  preview?: boolean;
  modalPreview?: boolean;
  preparedBy?: string;
}

interface PDFResult {
  success: boolean;
  message: string;
  filename?: string;
  error?: any;
  pdfBlob?: Blob; // Added for preview functionality
  pdfDataUrl?: string; // Added for modal preview
}

export function generatePDFReport({
  title,
  headers,
  data,
  filename = "report.pdf",
  orientation = "portrait",
  showPageNumbers = true,
  customHeaderColor = "#1E365D",
  customTextColor = "#000000",
  preview = true,
  modalPreview = false,
  preparedBy = "",
}: PDFGeneratorOptions): PDFResult {
  try {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: "a4",
    });

    // Get page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 8;

    const imageWidth = 30;
    const imageHeight = 30;
    const imageX = pageWidth - imageWidth - margin;
    const imageY = 12;

    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#0066cc");

    // Center the title
    // const titleWidth = doc.getTextWidth(title);
    // const titleX = (pageWidth - titleWidth) / 2;
    doc.text(`${title} Report`, 8, 15);

    // Static Header
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#000");
    doc.text(
      `Organization Name: Bureau of Jail Management and Penology`,
      8,
      25
    );

    const dateToday = new Date();
    const formattedDate = dateToday.toISOString().split("T")[0];

    doc.text(`Report Date: ${formattedDate}`, 8, 30);
    doc.text(`Prepared By: ${preparedBy}`, 8, 35);
    doc.text(`Department/ Unit: IT`, 8, 40);
    doc.text(`Report Reference No.: TAL-${formattedDate}-XXX`, 8, 45);

    doc.addImage(bjmp, "PNG", imageX, imageY, imageWidth, imageHeight);

    const currentY = 45;

    // Prepare table columns
    const columns = headers.map((header) => ({
      header: header.header,
      dataKey: header.dataKey,
    }));

    // Prepare table data
    const tableData = data.map((row) => {
      const rowData: Record<string, any> = {};
      headers.forEach((header) => {
        rowData[header.dataKey] = row[header.dataKey] || "";
      });
      return rowData;
    });

    // Add table using autoTable plugin
    doc.autoTable({
      startY: currentY + 10,
      head: [columns.map((col) => col.header)],
      body: tableData.map((row) =>
        columns.map((col) => String(row[col.dataKey] || ""))
      ),
      theme: "striped",
      headStyles: {
        fillColor: customHeaderColor,
        textColor: "#FFFFFF",
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: customTextColor,
      },
      alternateRowStyles: {
        fillColor: "#F8F9FA",
      },
      styles: {
        cellPadding: 3,
        lineColor: "#E0E0E0",
        lineWidth: 0.1,
      },
      margin: { top: margin, right: margin, bottom: margin + 10, left: margin },
      tableWidth: "auto",
      didDrawPage: function () {
        // Add page numbers if enabled
        if (showPageNumbers) {
          const pageCount = doc.getNumberOfPages();
          const currentPage = doc.getCurrentPageInfo().pageNumber;

          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor("#666666");

          const pageText = `Page ${currentPage} of ${pageCount}`;
          const pageTextWidth = doc.getTextWidth(pageText);
          const pageTextX = pageWidth - margin - pageTextWidth;
          const pageTextY = pageHeight - 10;

          doc.text(pageText, pageTextX, pageTextY);
        }

        // Add footer line
        // doc.setDrawColor("#E0E0E0");
        // doc.setLineWidth(0.5);
        // doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      },
    });

    // Add summary information
    const finalY = doc.lastAutoTable?.finalY || currentY + 50;

    // Calculate footer height (adjust if you add/remove lines)
    const footerHeight = 24; // 4 lines * 6mm spacing

    // Calculate Y position for footer
    let footerY = pageHeight - margin - footerHeight;

    // If table ends too close to the footer, add a new page
    if (finalY + 10 > footerY) {
      doc.addPage();
      footerY = pageHeight - margin - footerHeight;
    }

    //Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(customTextColor);
    doc.text(`Document Version 1.0`, margin, footerY + 10);
    doc.text(`Confidentiality Level: Internal use only`, margin, footerY + 13);
    doc.text(`Contact Info: `, margin, footerY + 16);
    doc.text(
      `Timestamp of Last Update: ${dateToday.toISOString()}`,
      margin,
      footerY + 19
    );

    // Handle preview vs download
    if (preview) {
      // Create blob and data URL
      const pdfBlob = doc.output("blob");
      const pdfDataUrl = doc.output("dataurlstring");

      if (modalPreview) {
        // Return data URL for modal display
        return {
          success: true,
          message: "PDF ready for modal preview",
          filename: filename,
          pdfBlob: pdfBlob,
          pdfDataUrl: pdfDataUrl,
        };
      } else {
        // Open in new tab for preview
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const newTab = window.open(pdfUrl, "_blank");
        if (!newTab) {
          // Fallback if popup blocked
          const link = document.createElement("a");
          link.href = pdfUrl;
          link.target = "_blank";
          link.click();
        }

        return {
          success: true,
          message: "PDF preview opened in new tab",
          filename: filename,
          pdfBlob: pdfBlob,
          pdfDataUrl: pdfDataUrl,
        };
      }
    } else {
      // Original download behavior
      doc.save(filename);
      return {
        success: true,
        message: "PDF generated successfully",
        filename: filename,
      };
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      message: "Failed to generate PDF",
      error: error,
    };
  }
}

//OLD but...
// Helper function to explicitly download the PDF (can be called separately)
export function downloadPDF(pdfBlob: Blob, filename: string): void {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(pdfBlob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
