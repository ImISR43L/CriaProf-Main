// src/components/ControlPanel.tsx
import React from "react";
import ColorBlock from "./ColorBlock";
import { ColorGroup } from "@/app/page";

interface ControlPanelProps {
  title: string;
  setTitle: (title: string) => void;
  colorGroups: ColorGroup[];
  setColorGroups: React.Dispatch<React.SetStateAction<ColorGroup[]>>;
  duplicateAnswers: Set<string>;
}

const ControlPanel = ({
  title,
  setTitle,
  colorGroups,
  setColorGroups,
  duplicateAnswers,
}: ControlPanelProps) => {
  let questionCounter = 0;

  const handleAddColor = () => {
    const newColorGroup: ColorGroup = {
      id: Date.now(),
      name: `Cor ${colorGroups.length + 1}`,
      color: "#E9ECEF",
      // Agora começa com apenas uma pergunta
      questions: [{ id: 1, text: "", answer: "" }],
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
    if (colorGroups.length > 1) {
      setColorGroups(colorGroups.filter((group) => group.id !== id));
    }
  };

  return (
    <aside className="bg-white p-5 rounded-lg shadow-md h-fit border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Painel de Perguntas
      </h2>
      <div className="mb-6">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Título da Atividade
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Revisão de Matemática"
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Div para controlar o scroll */}
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {colorGroups.map((group) => {
          const baseReferenceNumber = questionCounter + 1;
          questionCounter += group.questions.length;

          return (
            <ColorBlock
              key={group.id}
              group={group}
              onChange={handleColorGroupChange}
              onRemove={handleRemoveColor}
              canBeRemoved={colorGroups.length > 1}
              baseReferenceNumber={baseReferenceNumber}
              duplicateAnswers={duplicateAnswers}
            />
          );
        })}
      </div>

      <button
        onClick={handleAddColor}
        className="w-full mt-4 p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
      >
        + Adicionar Cor
      </button>
    </aside>
  );
};

export default ControlPanel;
