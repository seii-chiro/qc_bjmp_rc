/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import bjmp from "@/assets/Logo/QCJMD.png";

interface PDFOptions {
  headers: string[];
  rows: (string | number)[][];
  title?: string;
  fileName?: string;
  columnWidths?: number[];
  preparedBy?: string;
}

export const generateLogReport = ({
  headers,
  rows,
  title,
  columnWidths,
  preparedBy,
}: PDFOptions) => {
  // Use landscape orientation for better column spacing
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 8;

  const imageWidth = 30;
  const imageHeight = 30;
  const imageX = pageWidth - imageWidth - margin;
  const imageY = 12;

  if (title) {
    doc.setFontSize(16);
    doc.text(title, 8, 15);
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#000");
  doc.text(`Organization Name: Bureau of Jail Management and Penology`, 8, 25);

  const dateToday = new Date();
  const formattedDate = dateToday.toISOString().split("T")[0];

  doc.text(`Report Date: ${formattedDate}`, 8, 30);
  doc.text(`Prepared By: ${preparedBy}`, 8, 35);
  doc.text(`Department/ Unit: IT`, 8, 40);
  doc.text(`Report Reference No.: TAL-${formattedDate}-XXX`, 8, 45);

  doc.addImage(bjmp, "PNG", imageX, imageY, imageWidth, imageHeight);

  // Define column configurations
  const columnStyles: { [key: number]: any } = {};

  // Calculate available width (full page width minus margins)
  const availableWidth = pageWidth - margin * 2;

  // Define base ratios for common column types
  const getColumnRatio = (header: string): number => {
    const headerLower = header.toLowerCase();
    switch (headerLower) {
      case "no.":
      case "#":
      case "number":
        return 0.05; // Very small for numbers
      case "login":
      case "logout":
        return 0.12; // Medium for timestamps
      case "duration":
        return 0.08; // Small for duration
      case "status":
        return 0.08; // Small for status
      case "visitor name":
      case "name":
        return 0.18; // Larger for names
      case "visitor type":
      case "type":
        return 0.11; // Medium for types
      case "pdl name(s)":
      case "pdl names":
        return 0.18; // Larger for names
      case "pdl type":
        return 0.1; // Medium for types
      case "remarks":
      case "notes":
      case "comments":
        return 0.15; // Larger for text content
      default:
        return 0.12; // Default medium size
    }
  };

  // Calculate column widths using ratios or custom widths
  let calculatedWidths: number[];

  if (columnWidths) {
    // If custom widths provided, normalize them to fit available width
    const totalCustomWidth = columnWidths.reduce(
      (sum, width) => sum + width,
      0
    );
    const scaleFactor = availableWidth / totalCustomWidth;
    calculatedWidths = columnWidths.map((width) => width * scaleFactor);
  } else {
    // Calculate based on content and ratios
    const baseRatios = headers.map((header) => getColumnRatio(header));

    // Analyze actual content to adjust ratios if needed
    const contentAnalysis = headers.map((header, colIndex) => {
      const maxContentLength = Math.max(
        header.length,
        ...rows.map((row) => String(row[colIndex] || "").length)
      );
      return maxContentLength;
    });

    // Adjust ratios based on actual content length
    const adjustedRatios = baseRatios.map((ratio, index) => {
      const contentLength = contentAnalysis[index];

      // If content is significantly longer than expected, increase ratio
      if (contentLength > 25 && ratio < 0.15) {
        return Math.min(0.2, ratio * 1.5);
      }
      // If content is very short, ensure minimum width
      if (contentLength < 5 && ratio > 0.1) {
        return Math.max(0.05, ratio * 0.8);
      }
      return ratio;
    });

    // Normalize ratios to sum to 1
    const totalRatio = adjustedRatios.reduce((sum, ratio) => sum + ratio, 0);
    const normalizedRatios = adjustedRatios.map((ratio) => ratio / totalRatio);

    // Calculate actual widths
    calculatedWidths = normalizedRatios.map((ratio) => ratio * availableWidth);
  }

  // Set column-specific styles
  headers.forEach((header, index) => {
    columnStyles[index] = {
      cellWidth: calculatedWidths[index],
      overflow: "linebreak", // Handle long text
      valign: "top",
      halign: [
        "visitor type",
        "duration",
        "status",
        "no.",
        "#",
        "number",
      ].includes(header.toLowerCase())
        ? "center"
        : "left",
    };
  });

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 50,
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: "linebreak",
      cellWidth: "wrap",
      valign: "top",
    },
    headStyles: {
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles,
    margin: { top: 10, right: margin, bottom: 10, left: margin },
    tableWidth: availableWidth, // Explicitly set table width
    // Add alternating row colors for better readability
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    // Handle page breaks
    showHead: "everyPage",
    // Responsive font sizing
    didParseCell: function (data) {
      // Make text smaller if content is too long
      const cellText = String(data.cell.text);
      if (cellText.length > 20) {
        data.cell.styles.fontSize = 6;
      }
    },
  });

  const currentY = 45;

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
  doc.text(`Document Version 1.0`, margin, footerY + 10);
  doc.text(`Confidentiality Level: Internal use only`, margin, footerY + 13);
  doc.text(`Contact Info: `, margin, footerY + 16);
  doc.text(
    `Timestamp of Last Update: ${dateToday.toISOString()}`,
    margin,
    footerY + 19
  );

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageStr = `Page ${i} of ${pageCount}`;
    const textWidth = doc.getTextWidth(pageStr);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      pageStr,
      pageWidth - margin - textWidth,
      pageHeight - margin // bottom margin
    );
  }

  // This part download the file automatically
  // doc.save(fileName);

  const pdfBlob = doc.output("blob");
  return URL.createObjectURL(pdfBlob);
};

// Enhanced version with automatic column detection
export const generateLogReportSmart = ({
  headers,
  rows,
  title,
  fileName = "report.pdf",
  preparedBy,
}: Omit<PDFOptions, "columnWidths">) => {
  // Simply call the main function without custom widths
  // It will automatically calculate optimal widths using the full page width
  return generateLogReport({
    headers,
    rows,
    title,
    fileName,
    preparedBy,
  });
};
