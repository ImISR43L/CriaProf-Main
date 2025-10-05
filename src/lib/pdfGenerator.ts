import jsPDF from "jspdf";
import { ColorGroup } from "@/app/page";

// Função principal que será chamada pelo nosso componente
export const generatePdf = (
  activityTitle: string,
  colorGroups: ColorGroup[],
  gridState: string[]
) => {
  // 1. Inicializar o documento PDF
  // 'p' = portrait (retrato), 'mm' = milímetros, 'a4' = tamanho da página
  const doc = new jsPDF("p", "mm", "a4");

  // --- Constantes de Layout ---
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = margin; // Variável para controlar a posição vertical no documento

  // --- 2. Adicionar o Título da Atividade ---
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  // 'center' alinha o texto no centro da página
  doc.text(activityTitle, pageWidth / 2, currentY, { align: "center" });
  currentY += 20; // Aumenta a posição Y para o próximo elemento

  // --- 3. Desenhar a Grade 15x15 ---
  const gridSectionYStart = currentY;
  const gridSize = 120; // Tamanho total da grade em mm
  const cellSize = gridSize / 15; // Tamanho de cada célula

  doc.setLineWidth(0.2);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      const index = row * 15 + col;
      const cellValue = gridState[index] || "";

      const x = margin + col * cellSize;
      const y = currentY + row * cellSize;

      // Desenha o retângulo da célula
      doc.rect(x, y, cellSize, cellSize);

      // Se a célula tiver um valor, escreve o número no centro
      if (cellValue) {
        doc.text(cellValue, x + cellSize / 2, y + cellSize / 2, {
          align: "center",
          baseline: "middle",
        });
      }
    }
  }

  // --- 4. Desenhar a Legenda de Perguntas ao lado da Grade ---
  let legendX = margin + gridSize + 10;
  currentY += 5; // Alinha o início da legenda com a grade

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Legenda:", legendX, currentY - 5);

  colorGroups.forEach((group) => {
    // Verifica se há espaço na página, se não, cria uma nova
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = margin;
      legendX = margin; // Na nova página, a legenda começa na margem esquerda
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    // Desenha um pequeno quadrado com a cor
    doc.setFillColor(group.color);
    doc.rect(legendX, currentY, 5, 5, "F"); // 'F' = Fill (Preencher)
    doc.text(`Cor (${group.color})`, legendX + 7, currentY + 4);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    group.questions.forEach((q) => {
      // Adiciona apenas perguntas que não estão vazias
      if (q.text && q.answer) {
        doc.text(`${q.text} = ${q.answer}`, legendX, currentY);
        currentY += 6;
      }
    });
    currentY += 4; // Espaço entre os grupos de cores
  });

  // --- 5. Salvar o PDF ---
  // Isso irá acionar o download do arquivo no navegador
  doc.save(`${activityTitle.replace(/\s+/g, "_") || "atividade"}.pdf`);
};
