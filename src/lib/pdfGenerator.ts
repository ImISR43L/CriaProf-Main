// src/lib/pdfGenerator.ts
import jsPDF from "jspdf";
import type { Question } from "./types";
import type { SchoolColor } from "./colors";

/**
 * Função auxiliar para desenhar uma linha da legenda com uma caixa de cor e texto.
 * Retorna a nova posição Y para a próxima linha.
 */
const drawLegendLine = (
  doc: jsPDF,
  x: number,
  y: number,
  color: SchoolColor,
  text: string
): number => {
  const splitText = doc.splitTextToSize(
    text,
    doc.internal.pageSize.getWidth() - x - 15
  );

  doc.setFillColor(color.value);
  doc.rect(x, y, 4, 4, "F"); // Caixa de cor
  doc.text(splitText, x + 6, y + 3);

  return y + splitText.length * 4 + 2; // Retorna a nova posição Y
};

export const generatePdf = (
  activityTitle: string,
  questions: Question[],
  gridState: string[],
  gridSize: number
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = margin;

  // --- Título ---
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(activityTitle, pageWidth / 2, currentY, { align: "center" });
  currentY += 20;

  // NOVO: Mapear cada resposta ao tipo e referência da sua questão
  const answerInfoMap = new Map<
    string,
    { type: "single" | "multiple"; ref: string }
  >();
  questions.forEach((q, index) => {
    const questionRef = `Q${index + 1}`;
    q.options.forEach((opt) => {
      if (opt.answer) {
        answerInfoMap.set(opt.answer, { type: q.type, ref: questionRef });
      }
    });
  });

  // --- Grelha (LÓGICA ALTERADA) ---
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

      doc.rect(x, y, cellSize, cellSize); // Desenha a célula em branco

      if (cellValue) {
        const info = answerInfoMap.get(cellValue);
        let displayText = cellValue; // Padrão: mostrar o valor da célula

        // Se a resposta for de uma questão de múltipla escolha, mostrar a referência da questão
        if (info && info.type === "multiple") {
          displayText = info.ref;
        }

        const fontSize = displayText.length > 2 ? 6 : 8;
        doc.setFontSize(fontSize);
        doc.text(displayText, x + cellSize / 2, y + cellSize / 2, {
          align: "center",
          baseline: "middle",
        });
      }
    }
  }

  // --- Legenda (Lógica da versão anterior, que já está correta) ---
  let legendX = margin + gridSizeMM + 10;
  currentY = margin + 20;
  if (legendX + 50 > pageWidth) {
    legendX = margin;
    currentY = margin + gridSizeMM + 15;
  }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Legenda:", legendX, currentY);
  currentY += 8;

  let questionRef = 1;
  questions.forEach((question) => {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = margin;
      legendX = margin;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Legenda (continuação):", legendX, currentY);
      currentY += 8;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Lógica para Resposta Única
    if (question.type === "single" && question.color) {
      const questionText = `(${questionRef}) ${
        question.text || "Pergunta sem texto"
      }`;
      currentY = drawLegendLine(
        doc,
        legendX,
        currentY,
        question.color,
        questionText
      );

      // Lógica para Múltipla Escolha
    } else if (question.type === "multiple" && question.optionColors) {
      doc.setFont("helvetica", "bold");
      const questionText = `(${questionRef}) ${
        question.text || "Pergunta sem texto"
      }`;
      const splitText = doc.splitTextToSize(
        questionText,
        pageWidth - legendX - margin
      );
      doc.text(splitText, legendX, currentY);
      currentY += splitText.length * 4 + 4;

      doc.setFont("helvetica", "normal");
      question.options.forEach((option) => {
        const color = question.optionColors?.[option.id];
        if (color) {
          const optionText = `${option.answer}) ${option.text || ""}`;
          currentY = drawLegendLine(
            doc,
            legendX + 2,
            currentY,
            color,
            optionText
          );
        }
      });
    }
    questionRef++;
    currentY += 5;
  });

  doc.save(`${activityTitle.replace(/\s+/g, "_") || "atividade"}.pdf`);
};
