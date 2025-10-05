// src/components/ColorBlock.tsx
import React from "react";
import { ColorGroup, Question } from "@/app/page";

interface ColorBlockProps {
  group: ColorGroup;
  onChange: (updatedGroup: ColorGroup) => void;
  onRemove: (id: number) => void;
  canBeRemoved: boolean;
  colorNumber: number;
}

const ColorBlock = ({
  group,
  onChange,
  onRemove,
  canBeRemoved,
  colorNumber,
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
    <div className="border border-gray-200 rounded-lg p-4 mb-4 relative">
      <div className="flex items-center gap-3 pb-3 mb-3 border-b border-gray-200">
        <input
          type="color"
          value={group.color}
          onChange={handleColorChange}
          className="w-10 h-10 p-0 border-none cursor-pointer"
        />
        <h3 className="font-bold text-lg">Cor {colorNumber}</h3>
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

      <div className="space-y-2">
        {group.questions.map((q) => (
          <div key={q.id} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Pergunta ${q.id}`}
              value={q.text}
              onChange={(e) =>
                handleQuestionChange(q.id, "text", e.target.value)
              }
              className="flex-grow p-2 border border-gray-300 rounded-md"
            />
            <input
              type="text" // Usar text para evitar setas de number input e validar manualmente
              placeholder="Resp."
              value={q.answer}
              onChange={(e) =>
                handleQuestionChange(
                  q.id,
                  "answer",
                  e.target.value.replace(/[^0-9]/g, "")
                )
              }
              className="w-20 p-2 border border-gray-300 rounded-md text-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorBlock;
