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
    <section className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900">
        Grade Interativa ({gridSize}x{gridSize})
      </h2>
      <p className="text-gray-500 mb-4 text-sm">
        Clique e digite o{" "}
        <span className="font-bold">número de referência</span> da pergunta.
      </p>
      <div
        className="grid border-t border-l border-gray-400"
        style={{ ...gridStyles, aspectRatio: "1 / 1" }}
      >
        {gridState.map((cellValue, index) => (
          <input
            key={index}
            type="text"
            value={cellValue}
            onChange={(e) => onCellChange(index, e.target.value)}
            maxLength={3}
            className="w-full h-full bg-white text-gray-800 text-center text-sm p-0 border-r border-b border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10"
          />
        ))}
      </div>
    </section>
  );
};

export default InteractiveGrid;
