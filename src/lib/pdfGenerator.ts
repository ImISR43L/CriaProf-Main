// src/lib/pdfGenerator.ts
import jsPDF from "jspdf";
import type { Question } from "./types";
import type { SchoolColor } from "./colors";

const getQuestionBlockHeight = (
  doc: jsPDF,
  question: Question,
  questionRef: number,
  width: number
): number => {
  let height = 0;
  const isMulti = question.type === "multiple";
  const baseFontSize = isMulti ? 10 : 9;
  const lineSpacing = isMulti ? 4.5 : 4;
  const blockPadding = 5;

  doc.setFontSize(baseFontSize);
  const questionText = `(${questionRef}) ${question.text || ""}`;
  const titleLines = doc.splitTextToSize(questionText, width - 6);
  height += titleLines.length * lineSpacing;

  if (isMulti && question.optionColors) {
    height += 2; // Espaço antes das opções
    question.options.forEach((opt) => {
      const optionLines = doc.splitTextToSize(`${opt.text || ""}`, width - 8);
      height += optionLines.length * lineSpacing + 2;
    });
  }

  return height + blockPadding;
};

const drawQuestionBlock = (
  doc: jsPDF,
  question: Question,
  questionRef: number,
  x: number,
  y: number,
  width: number
): number => {
  let currentY = y;
  const isMulti = question.type === "multiple";
  const baseFontSize = isMulti ? 10 : 9;
  const lineSpacing = isMulti ? 4.5 : 4;
  const questionText = `(${questionRef}) ${question.text || ""}`;

  if (question.type === "single" && question.color) {
    doc.setFontSize(baseFontSize);
    currentY = drawLegendLine(
      doc,
      x,
      currentY,
      question.color,
      questionText,
      width - 6
    );
  } else if (question.type === "multiple" && question.optionColors) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(baseFontSize);
    const titleLines = doc.splitTextToSize(questionText, width);
    doc.text(titleLines, x, currentY + 3.5);
    currentY += titleLines.length * lineSpacing + 2;

    doc.setFont("helvetica", "normal");
    question.options.forEach((option) => {
      const color = question.optionColors?.[option.id];
      if (color) {
        const displayLetter = option.answer.includes("-")
          ? option.answer.split("-")[1]
          : option.answer;
        const optionText = `${displayLetter}) ${option.text || ""}`;
        currentY = drawLegendLine(
          doc,
          x + 2,
          currentY,
          color,
          optionText,
          width - 8
        );
      }
    });
  }
  return currentY + 5;
};

const drawLegendLine = (
  doc: jsPDF,
  x: number,
  y: number,
  color: SchoolColor,
  text: string,
  width: number
): number => {
  const splitText = doc.splitTextToSize(text, width);
  doc.setFillColor(color.value);
  doc.rect(x, y, 4, 4, "F");
  doc.text(splitText, x + 6, y + 3.5);
  return y + splitText.length * 4 + 2;
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

  let docY = margin;
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(activityTitle, pageWidth / 2, docY, { align: "center" });
  docY += 20;

  const gridTopY = docY;

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

  const gridSizeMM = 120;
  const cellSize = gridSizeMM / gridSize;
  doc.setLineWidth(0.2);
  doc.setFont("helvetica", "normal");

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col;
      const cellValue = gridState[index] || "";
      const x = margin + col * cellSize;
      const y = gridTopY + row * cellSize;

      doc.rect(x, y, cellSize, cellSize);

      if (cellValue) {
        const info = answerInfoMap.get(cellValue);
        let displayText = cellValue;
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

  const gridBottomY = gridTopY + gridSizeMM;
  const remainingQuestions: Question[] = [];
  let questionRef = 1;
  let legendStarted = false;

  const rightColX = margin + gridSizeMM + 8;
  const rightColWidth = pageWidth - rightColX - margin;
  let rightColY = gridTopY;

  for (const question of questions) {
    const height = getQuestionBlockHeight(
      doc,
      question,
      questionRef,
      rightColWidth
    );
    if (rightColY + height < gridBottomY) {
      if (!legendStarted) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Questionário", rightColX, gridTopY - 5);
        legendStarted = true;
      }
      rightColY = drawQuestionBlock(
        doc,
        question,
        questionRef,
        rightColX,
        rightColY,
        rightColWidth
      );
      questionRef++;
    } else {
      remainingQuestions.push(question);
    }
  }

  if (remainingQuestions.length > 0) {
    let legendTopY = gridBottomY + 15;
    docY = legendTopY;

    if (!legendStarted) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Questionário", margin, docY - 5);
    }

    const numColumns = 2;
    const columnGutter = 10;
    const contentWidth = pageWidth - margin * 2;
    const columnWidth = (contentWidth - columnGutter) / numColumns;
    const columnXPositions = [margin, margin + columnWidth + columnGutter];
    let currentColumnIndex = 0;

    for (const question of remainingQuestions) {
      const height = getQuestionBlockHeight(
        doc,
        question,
        questionRef,
        columnWidth
      );

      if (docY + height > pageHeight - margin && docY > legendTopY) {
        currentColumnIndex++;
        if (currentColumnIndex >= numColumns) {
          doc.addPage();
          docY = margin + 15;
          legendTopY = docY;
          currentColumnIndex = 0;
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("Questionário (continuação)", margin, margin);
        } else {
          docY = legendTopY;
        }
      }

      const currentX = columnXPositions[currentColumnIndex];
      docY = drawQuestionBlock(
        doc,
        question,
        questionRef,
        currentX,
        docY,
        columnWidth
      );
      questionRef++;
    }
  }

  doc.save(`${activityTitle.replace(/\s+/g, "_") || "atividade"}.pdf`);
};
