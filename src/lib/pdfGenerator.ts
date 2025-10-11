// src/lib/pdfGenerator.ts
import jsPDF from "jspdf";
import type { ColorGroup } from "./types";

export const generatePdf = (
  activityTitle: string,
  colorGroups: ColorGroup[],
  gridState: string[],
  gridSize: number
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = margin;

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(activityTitle, pageWidth / 2, currentY, { align: "center" });
  currentY += 20;

  const gridSizeMM = 120;
  const cellSize = gridSizeMM / gridSize;

  doc.setLineWidth(0.2);
  doc.setFont("helvetica", "normal");

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col;
      const cellValue = gridState[index] || "";
      const x = margin + col * cellSize;
      const y = currentY + row * cellSize;

      doc.rect(x, y, cellSize, cellSize);

      if (cellValue) {
        const fontSize = cellValue.length > 2 ? 8 : 10;
        doc.setFontSize(fontSize);
        doc.text(cellValue, x + cellSize / 2, y + cellSize / 2, {
          align: "center",
          baseline: "middle",
        });
      }
    }
  }

  let legendX = margin + gridSizeMM + 10;
  currentY = margin + 20 + 5;
  let questionRef = 1;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  if (legendX + 50 > pageWidth) {
    legendX = margin;
    currentY = margin + gridSizeMM + 15;
  }
  doc.text("Legenda:", legendX, currentY - 5);

  colorGroups.forEach((group) => {
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = margin;
      legendX = margin;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(group.color.value);
    doc.rect(legendX, currentY, 5, 5, "F");
    
    // Agora usamos group.color.name
    doc.text(group.color.name, legendX + 7, currentY + 4);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    group.questions.forEach((q) => {
      if (q.text && q.answer) {
        const questionLine = `(${questionRef}) ${q.text} = ${q.answer}`;
        const splitText = doc.splitTextToSize(
          questionLine,
          pageWidth - legendX - margin
        );

        doc.text(splitText, legendX, currentY);
        currentY += splitText.length * 4 + 2;
        questionRef++;
      } else {
        questionRef++;
      }
    });
    currentY += 4;
  });

  doc.save(`${activityTitle.replace(/\s+/g, "_") || "atividade"}.pdf`);
};