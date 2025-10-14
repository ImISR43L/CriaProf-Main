import React from "react";
import { getContrastColor } from "@/lib/utils";

interface InteractiveGridProps {
  gridState: string[];
  gridSize: number;
  answerToColorMap: Map<string, string>;
  answerToQuestionRefMap: Map<string, string>; // Nova propriedade
  paintCells: (index: number) => void;
  isPainting: boolean;
}

const InteractiveGrid = ({
  gridState,
  gridSize,
  answerToColorMap,
  answerToQuestionRefMap, // Usando a nova propriedade
  paintCells,
  isPainting,
}: InteractiveGridProps) => {
  const gridStyles = {
    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
  };

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
          const textColor = getContrastColor(bgColor);
          // LÓGICA ALTERADA: Decide qual texto exibir
          const displayText =
            answerToQuestionRefMap.get(cellValue) || cellValue;

          return (
            <div
              key={index}
              onMouseDown={() => paintCells(index)}
              onMouseEnter={() => isPainting && paintCells(index)}
              className="w-full h-full text-center text-xs p-0 border-r border-b border-gray-400 select-none cursor-pointer flex items-center justify-center font-bold"
              style={{
                backgroundColor: bgColor,
                color: textColor,
              }}
            >
              {displayText}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default InteractiveGrid;
