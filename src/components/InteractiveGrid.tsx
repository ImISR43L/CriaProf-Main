// src/components/InteractiveGrid.tsx
import React from "react";

interface InteractiveGridProps {
  gridState: string[];
  gridSize: number;
  onCellChange: (index: number, value: string) => void;
}

const InteractiveGrid = ({
  gridState,
  gridSize,
  onCellChange,
}: InteractiveGridProps) => {
  const gridStyles = {
    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
  };

  return (
    <section className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold">
        Grade Interativa ({gridSize}x{gridSize})
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
        Clique e digite o{" "}
        <span className="font-bold">número de referência</span> da pergunta.
      </p>
      <div
        className="grid border-t border-l border-gray-400 dark:border-gray-600"
        style={{ ...gridStyles, aspectRatio: "1 / 1" }}
      >
        {gridState.map((cellValue, index) => (
          <input
            key={index}
            type="text"
            value={cellValue}
            onChange={(e) => onCellChange(index, e.target.value)}
            maxLength={3}
            className="w-full h-full bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 text-center text-sm p-0 border-r border-b border-gray-400 dark:border-gray-600 focus:outline-none focus:bg-blue-100 dark:focus:bg-blue-900"
          />
        ))}
      </div>
    </section>
  );
};

export default InteractiveGrid;
