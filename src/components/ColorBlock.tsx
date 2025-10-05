// src/components/ColorBlock.tsx
import React from "react";
import { ColorGroup, Question } from "@/app/page";

interface ColorBlockProps {
  group: ColorGroup;
  onChange: (updatedGroup: ColorGroup) => void;
  onRemove: (id: number) => void;
  canBeRemoved: boolean;
  baseReferenceNumber: number;
  duplicateAnswers: Set<string>;
}

const ColorBlock = ({
  group,
  onChange,
  onRemove,
  canBeRemoved,
  baseReferenceNumber,
  duplicateAnswers,
}: ColorBlockProps) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...group, name: e.target.value });
  };

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

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      // Usar timestamp para garantir ID único
      id: Date.now(),
      text: "",
      answer: "",
    };
    onChange({ ...group, questions: [...group.questions, newQuestion] });
  };

  const handleRemoveQuestion = (questionIdToRemove: number) => {
    // Impede a remoção da última pergunta
    if (group.questions.length <= 1) return;
    const updatedQuestions = group.questions.filter(
      (q) => q.id !== questionIdToRemove
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
          className="w-10 h-10 p-0 border-none cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={group.name}
          onChange={handleNameChange}
          placeholder="Nome da Cor"
          className="font-bold text-lg text-gray-900 w-full p-1 border-b-2 border-transparent focus:border-blue-500 outline-none"
        />
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
        {group.questions.map((q, index) => {
          const isDuplicate =
            duplicateAnswers.has(q.answer) && q.answer.trim() !== "";
          return (
            <div key={q.id} className="relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-500 text-sm">
                  ({baseReferenceNumber + index})
                </span>
                <input
                  type="text"
                  placeholder={`Pergunta ${index + 1}`}
                  value={q.text}
                  onChange={(e) =>
                    handleQuestionChange(q.id, "text", e.target.value)
                  }
                  className="flex-grow p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
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
                className={`w-full p-2 border rounded-md text-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 ${
                  isDuplicate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {isDuplicate && (
                <p className="text-xs text-red-600 mt-1">
                  Esta resposta já está a ser usada.
                </p>
              )}
              {group.questions.length > 1 && (
                <button
                  onClick={() => handleRemoveQuestion(q.id)}
                  className="absolute top-1/2 -right-5 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg"
                  title="Remover Pergunta"
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={handleAddQuestion}
        className="w-full text-left text-sm text-blue-600 font-semibold mt-3 p-1 hover:bg-blue-50 rounded"
      >
        + Adicionar Pergunta
      </button>
    </div>
  );
};

export default ColorBlock;
