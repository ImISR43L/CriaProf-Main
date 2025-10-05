// src/components/ControlPanel.tsx
import React from "react";
import ColorBlock from "./ColorBlock";
import { ColorGroup } from "@/app/page";

interface ControlPanelProps {
  title: string;
  setTitle: (title: string) => void;
  colorGroups: ColorGroup[];
  setColorGroups: React.Dispatch<React.SetStateAction<ColorGroup[]>>;
}

const ControlPanel = ({
  title,
  setTitle,
  colorGroups,
  setColorGroups,
}: ControlPanelProps) => {
  let questionCounter = 0;

  // --- FUNÇÃO MODIFICADA ---
  const handleAddColor = () => {
    // A verificação de limite foi removida, permitindo adicionar cores indefinidamente.
    const newColorGroup: ColorGroup = {
      id: Date.now(),
      color: "#E9ECEF", // Uma cor padrão para o novo bloco
      questions: Array(4)
        .fill(null)
        .map((_, i) => ({ id: i + 1, text: "", answer: "" })),
    };
    setColorGroups([...colorGroups, newColorGroup]);
  };

  const handleColorGroupChange = (updatedGroup: ColorGroup) => {
    setColorGroups(
      colorGroups.map((group) =>
        group.id === updatedGroup.id ? updatedGroup : group
      )
    );
  };

  const handleRemoveColor = (id: number) => {
    // A lógica para não remover o último bloco de cor permanece
    if (colorGroups.length > 1) {
      setColorGroups(colorGroups.filter((group) => group.id !== id));
    }
  };

  return (
    <aside className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md h-fit border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Painel de Perguntas
      </h2>
      <div className="mb-6">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Título da Atividade
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Revisão de Matemática"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {colorGroups.map((group, index) => {
        const baseReferenceNumber = questionCounter + 1;
        questionCounter += group.questions.length;

        return (
          <ColorBlock
            key={group.id}
            group={group}
            onChange={handleColorGroupChange}
            onRemove={handleRemoveColor}
            canBeRemoved={colorGroups.length > 1}
            colorNumber={index + 1}
            baseReferenceNumber={baseReferenceNumber}
          />
        );
      })}

      <button
        onClick={handleAddColor}
        className="w-full mt-2 p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      >
        + Adicionar Cor
      </button>
    </aside>
  );
};

export default ControlPanel;
