import React from "react";
import type { ColorGroup } from "@/lib/types";
import { getContrastColor } from "@/lib/utils";

interface InteractiveGridProps {
  gridState: string[];
  gridSize: number;
  colorGroups: ColorGroup[];
  paintCells: (index: number) => void;
  isPainting: boolean;
}

const InteractiveGrid = ({
  gridState,
  gridSize,
  colorGroups,
  paintCells,
  isPainting,
}: InteractiveGridProps) => {
  const gridStyles = {
    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
  };

  const answerToColorMap = new Map<string, string>();
  colorGroups.forEach((group) => {
    group.questions.forEach((q) => {
      if (q.answer.trim() !== "") {
        answerToColorMap.set(q.answer, group.color.value);
      }
    });
  });

  return (
    <section className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900">
        Grade Interativa ({gridSize}x{gridSize})
      </h2>
      <p className="text-gray-500 mb-4 text-sm">
        Clique numa resposta para selecionar o pincel e depois pinte na grelha.
      </p>
      <div
        className="grid border-t border-l border-gray-400"
        style={{ ...gridStyles, aspectRatio: "1 / 1" }}
      >
        {gridState.map((cellValue, index) => {
          const bgColor = answerToColorMap.get(cellValue) || "#FFFFFF";
          // Usar a nossa função para obter a cor de texto com melhor contraste
          const textColor = getContrastColor(bgColor);

          return (
            <div
              key={index}
              onMouseDown={() => paintCells(index)}
              onMouseEnter={() => {
                if (isPainting) {
                  paintCells(index);
                }
              }}
              className="w-full h-full text-center text-sm p-0 border-r border-b border-gray-400 select-none cursor-pointer flex items-center justify-center"
              style={{
                backgroundColor: bgColor,
                color: textColor,
              }}
            >
              {cellValue}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default InteractiveGrid;
