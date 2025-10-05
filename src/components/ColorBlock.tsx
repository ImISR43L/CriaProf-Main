// src/components/ColorBlock.tsx
import React from "react";
import { ColorGroup } from "@/app/page";

interface ColorBlockProps {
  group: ColorGroup;
  onChange: (updatedGroup: ColorGroup) => void;
  onRemove: (id: number) => void;
  canBeRemoved: boolean;
  colorNumber: number;
  baseReferenceNumber: number;
}

const ColorBlock = ({
  group,
  onChange,
  onRemove,
  canBeRemoved,
  colorNumber,
  baseReferenceNumber,
}: ColorBlockProps) => {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...group, color: e.target.value });
  };

  const handleQuestionChange = (
    questionId: number,
    field: "text" | "answer",
    value: string
  ) => {
    const updatedQuestions = group.questions.map((q) =>
      q.id === questionId ? { ...q, [field]: value } : q
    );
    onChange({ ...group, questions: updatedQuestions });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 relative">
      <div className="flex items-center gap-3 pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
        <input
          type="color"
          value={group.color}
          onChange={handleColorChange}
          className="w-10 h-10 p-0 border-none cursor-pointer bg-transparent"
        />
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
          Cor {colorNumber}
        </h3>
        {canBeRemoved && (
          <button
            onClick={() => onRemove(group.id)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
            title="Remover Cor"
          >
            &times;
          </button>
        )}
      </div>
      <div className="space-y-3">
        {group.questions.map((q, index) => (
          <div key={q.id}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-500 dark:text-gray-400 text-sm">
                ({baseReferenceNumber + index})
              </span>
              <input
                type="text"
                placeholder={`Pergunta ${index + 1}`}
                value={q.text}
                onChange={(e) =>
                  handleQuestionChange(q.id, "text", e.target.value)
                }
                className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <input
              type="text"
              placeholder="Resposta"
              value={q.answer}
              onChange={(e) =>
                handleQuestionChange(q.id, "answer", e.target.value)
              }
              maxLength={50}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorBlock;
