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

  // Auto-calculate column widths based on content or use custom widths
  const totalWidth = doc.internal.pageSize.getWidth() - 28; // Account for margins
  const autoColumnWidths =
    columnWidths ||
    headers.map((header) => {
      // Customize widths based on typical content
      switch (header.toLowerCase()) {
        case "no.":
          return totalWidth * 0.05; // 8% of total width
        case "login":
          return totalWidth * 0.12; // 15%
        case "logout":
          return totalWidth * 0.12; // 15%
        case "duration":
          return totalWidth * 0.1; // 10%
        case "status":
          return totalWidth * 0.1; // 10%
        case "visitor name":
          return totalWidth * 0.15; // 15%
        case "visitor type":
          return totalWidth * 0.11; // 12%
        case "pdl name(s)":
          return totalWidth * 0.15; // 15%
        case "pdl type":
          return totalWidth * 0.1;
        default:
          return totalWidth / headers.length;
      }
    });

  // Set column-specific styles
  headers.forEach((header, index) => {
    columnStyles[index] = {
      cellWidth: autoColumnWidths[index],
      overflow: "linebreak", // Handle long text
      valign: "top",
      halign: ["visitor type", "duration", "status"].includes(
        header.toLowerCase()
      )
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
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    tableWidth: "auto",
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
}: Omit<PDFOptions, "columnWidths">) => {
  // Analyze content to determine optimal column widths
  const columnWidths = headers.map((header, colIndex) => {
    const maxContentLength = Math.max(
      header.length,
      ...rows.map((row) => String(row[colIndex] || "").length)
    );

    // Base width calculation
    const baseWidth = Math.max(20, Math.min(60, maxContentLength * 2));
    return baseWidth;
  });

  // Normalize widths to fit page
  const totalCalculatedWidth = columnWidths.reduce(
    (sum, width) => sum + width,
    0
  );
  const pageWidth = 297 - 28; // A4 landscape minus margins
  const scaleFactor = pageWidth / totalCalculatedWidth;

  const normalizedWidths = columnWidths.map((width) => width * scaleFactor);

  generateLogReport({
    headers,
    rows,
    title,
    fileName,
    columnWidths: normalizedWidths,
  });
};
