// src/components/ControlPanel.tsx
import React from "react";
import ColorBlock from "./ColorBlock";
import { schoolColorPalette } from "@/lib/colors";
import type { ColorGroup, ActiveTool, Question } from "@/lib/types";

interface TemplateCategory {
  id: string;
  name: string;
}

interface ControlPanelProps {
  title: string;
  setTitle: (title: string) => void;
  colorGroups: ColorGroup[];
  setColorGroups: React.Dispatch<React.SetStateAction<ColorGroup[]>>;
  duplicateAnswers: Set<string>;
  setActiveTool: (tool: ActiveTool | null) => void;
  activeTool: ActiveTool | null;
  clearAnswersFromGrid: (answers: string[]) => void;
  isOwner: boolean;
  categories: TemplateCategory[];
  categoryId: string | undefined;
  setCategoryId: (id: string) => void;
}

const ControlPanel = ({
  title,
  setTitle,
  colorGroups,
  setColorGroups,
  duplicateAnswers,
  setActiveTool,
  activeTool,
  clearAnswersFromGrid,
  isOwner,
  categories,
  categoryId,
  setCategoryId,
}: ControlPanelProps) => {
  let questionCounter = 0;
  const usedColorValues = new Set(colorGroups.map((g) => g.color.value));

  const handleAddColor = () => {
    if (!isOwner) return;
    const nextColor = schoolColorPalette.find(
      (c) => !usedColorValues.has(c.value)
    );
    if (!nextColor) {
      alert("Todas as cores disponíveis já foram adicionadas.");
      return;
    }
    const newColorGroup: ColorGroup = {
      id: Date.now(),
      color: nextColor,
      questions: [{ id: 1, text: "", answer: "" }],
    };
    setColorGroups([...colorGroups, newColorGroup]);
  };

  const handleColorGroupChange = (updatedGroup: ColorGroup) => {
    if (!isOwner) return;
    setColorGroups(
      colorGroups.map((group) =>
        group.id === updatedGroup.id ? updatedGroup : group
      )
    );
  };

  const handleRemoveColor = (id: number) => {
    if (!isOwner || colorGroups.length <= 1) return;
    const groupToRemove = colorGroups.find((g) => g.id === id);
    if (groupToRemove) {
      const answersToClear = groupToRemove.questions
        .map((q) => q.answer)
        .filter(Boolean);
      clearAnswersFromGrid(answersToClear);
    }
    setColorGroups(colorGroups.filter((group) => group.id !== id));
  };

  const handleRemoveQuestion = (questionToRemove: Question) => {
    if (questionToRemove.answer.trim() !== "") {
      clearAnswersFromGrid([questionToRemove.answer]);
    }
  };

  return (
    <aside className="bg-white p-5 rounded-lg shadow-md h-fit border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Painel de Perguntas
      </h2>
      <div className="mb-6 space-y-4">
        <div>
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
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!isOwner}
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Categoria
          </label>
          <select
            id="category"
            value={categoryId || ""}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!isOwner}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="max-h-[50vh] overflow-y-auto pr-2">
        {colorGroups.map((group) => {
          const baseReferenceNumber = questionCounter + 1;
          questionCounter += group.questions.length;
          return (
            <ColorBlock
              key={group.id}
              group={group}
              onChange={handleColorGroupChange}
              onRemove={handleRemoveColor}
              onRemoveQuestion={handleRemoveQuestion}
              canBeRemoved={colorGroups.length > 1}
              baseReferenceNumber={baseReferenceNumber}
              duplicateAnswers={duplicateAnswers}
              usedColorValues={usedColorValues}
              setActiveTool={setActiveTool}
              activeTool={activeTool}
              disabled={!isOwner}
            />
          );
        })}
      </div>
      {isOwner && colorGroups.length < schoolColorPalette.length && (
        <button
          onClick={handleAddColor}
          className="w-full mt-4 p-2 border-2 border-dashed border-gray-400 rounded-md text-gray-600 font-semibold hover:bg-gray-100 hover:border-gray-500 transition-colors"
        >
          + Adicionar Cor
        </button>
      )}
    </aside>
  );
};

export default ControlPanel;
