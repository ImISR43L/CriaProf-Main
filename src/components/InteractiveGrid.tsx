// src/components/InteractiveGrid.tsx
import React from "react";

interface InteractiveGridProps {
  gridState: string[];
  onCellChange: (index: number, value: string) => void;
}

const InteractiveGrid = ({ gridState, onCellChange }: InteractiveGridProps) => {
  return (
    <section className="bg-white p-5 rounded-lg shadow-md">
      <h2 className="text-xl font-bold">Grade Interativa (15x15)</h2>
      <p className="text-gray-500 mb-4 text-sm">
        Clique em um quadrado e digite o número da resposta correspondente.
      </p>
      <div
        className="grid grid-cols-15 gap-px bg-gray-300 border border-gray-400"
        style={{ aspectRatio: "1 / 1" }} // Mantém a grade quadrada
      >
        {gridState.map((cellValue, index) => (
          <input
            key={index}
            type="text"
            value={cellValue}
            onChange={(e) => onCellChange(index, e.target.value)}
            className="w-full h-full bg-white text-center text-sm focus:outline-none focus:bg-blue-100"
          />
        ))}
      </div>
    </section>
  );
};

// Adicione esta configuração ao seu tailwind.config.ts para a grade funcionar
// Dentro de theme: { extend: { ... } }
// gridTemplateColumns: {
//   '15': 'repeat(15, minmax(0, 1fr))',
// }
export default InteractiveGrid;
