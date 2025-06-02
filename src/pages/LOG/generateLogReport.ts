import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PDFOptions {
  headers: string[];
  rows: (string | number)[][];
  title?: string;
  fileName?: string;
  columnWidths?: number[]; // Optional custom column widths
}

export const generateLogReport = ({
  headers,
  rows,
  title,
  fileName = "report.pdf",
  columnWidths,
}: PDFOptions) => {
  // Use landscape orientation for better column spacing
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }

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
    startY: title ? 25 : 10,
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
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
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

  doc.save(fileName);
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
