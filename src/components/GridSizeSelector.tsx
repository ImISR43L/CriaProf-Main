"use client";
import React from "react";

interface GridSizeSelectorProps {
  selectedSize: number;
  onChange: (size: number) => void;
  disabled: boolean;
}

const GridSizeSelector = ({
  selectedSize,
  onChange,
  disabled,
}: GridSizeSelectorProps) => {
  const sizes = [10, 15, 20];
  return (
    <div>
      {/* Título padronizado */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Tamanho da Grade</h2>
      <div className="flex gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onChange(size)}
            disabled={disabled}
            className={`px-4 py-2 rounded-md text-sm font-semibold border transition-colors ${
              selectedSize === size
                ? "bg-yellow-500 text-white border-yellow-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            } disabled:bg-gray-200 disabled:cursor-not-allowed`}
          >
            {size}x{size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GridSizeSelector;
