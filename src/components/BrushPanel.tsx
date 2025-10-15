"use client";
import React from "react";
import type { ActiveTool } from "@/lib/types";
import { getContrastColor } from "@/lib/utils";

interface BrushPanelProps {
  activeTool: ActiveTool | null;
  brushSize: number;
  setBrushSize: (size: number) => void;
  isEraserActive: boolean;
  onSelectEraser: () => void;
  disabled: boolean;
}

const BrushPanel = ({
  activeTool,
  brushSize,
  setBrushSize,
  isEraserActive,
  onSelectEraser,
  disabled,
}: BrushPanelProps) => {
  const brushSizes = [1, 2, 3];

  return (
    <aside className="bg-white p-5 rounded-lg shadow-md h-fit border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Pincel</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ferramenta Ativa
        </label>
        <div className="flex gap-2">
          <div
            className="w-full p-3 rounded-md border-2 flex items-center justify-center"
            style={{
              backgroundColor: activeTool ? activeTool.color.value : "#f3f4f6",
              borderColor: activeTool ? activeTool.color.value : "#e5e7eb",
            }}
          >
            {activeTool ? (
              <span
                className="text-lg font-bold"
                style={{
                  color: getContrastColor(activeTool.color.value),
                }}
              >
                {activeTool.answer.includes("-")
                  ? activeTool.answer.split("-")[1]
                  : activeTool.answer}
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                {isEraserActive ? "Borracha" : "Selecione uma resposta"}
              </span>
            )}
          </div>

          <button
            onClick={onSelectEraser}
            disabled={disabled}
            className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-md border-2 transition-colors ${
              isEraserActive
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
            title="Borracha"
          >
            {/* --- ÍCONE REVERTIDO PARA LIXEIRA --- */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tamanho do Pincel
        </label>
        <div className="flex gap-2">
          {brushSizes.map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              disabled={disabled}
              className={`w-10 h-10 rounded-md text-sm font-semibold border transition-colors ${
                brushSize === size
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {size}x{size}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default BrushPanel;
