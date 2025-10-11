// src/components/ColorBlock.tsx
import React, { useState, useRef, useEffect } from "react";
import type { ColorGroup, Question, ActiveTool } from "@/lib/types";
import { schoolColorPalette } from "@/lib/colors";

interface ColorBlockProps {
  group: ColorGroup;
  onChange: (updatedGroup: ColorGroup) => void;
  onRemove: (id: number) => void;
  canBeRemoved: boolean;
  baseReferenceNumber: number;
  duplicateAnswers: Set<string>;
  usedColorValues: Set<string>;
  setActiveTool: (tool: ActiveTool | null) => void;
  activeTool: ActiveTool | null;
  onRemoveQuestion: (question: Question) => void;
  disabled: boolean;
}

const ColorBlock = ({
  group,
  onChange,
  onRemove,
  canBeRemoved,
  baseReferenceNumber,
  duplicateAnswers,
  usedColorValues,
  setActiveTool,
  activeTool,
  onRemoveQuestion,
  disabled,
}: ColorBlockProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleColorChange = (selectedColor: (typeof schoolColorPalette)[0]) => {
    onChange({ ...group, color: selectedColor });
    setIsPickerOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

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
      id: Date.now(),
      text: "",
      answer: "",
    };
    onChange({ ...group, questions: [...group.questions, newQuestion] });
  };

  const handleRemoveQuestion = (questionToRemove: Question) => {
    if (group.questions.length <= 1) return;
    onRemoveQuestion(questionToRemove);

    const updatedQuestions = group.questions.filter(
      (q) => q.id !== questionToRemove.id
    );
    onChange({ ...group, questions: updatedQuestions });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 relative">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
        <div className="flex items-center gap-3 relative" ref={pickerRef}>
          <button
            onClick={() => !disabled && setIsPickerOpen(!isPickerOpen)}
            className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
            style={{ backgroundColor: group.color.value }}
            aria-label="Selecionar cor"
            disabled={disabled}
          />
          <span className="font-bold text-lg text-gray-900">
            {group.color.name}
          </span>

          {isPickerOpen && (
            <div className="absolute top-full mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10 grid grid-cols-6 gap-2">
              {schoolColorPalette.map((colorOption) => {
                const isUsed = usedColorValues.has(colorOption.value);
                const isCurrentlySelected =
                  group.color.value === colorOption.value;
                return (
                  <button
                    key={colorOption.value}
                    onClick={() => handleColorChange(colorOption)}
                    disabled={isUsed && !isCurrentlySelected}
                    className={`w-8 h-8 rounded-md border ${
                      isCurrentlySelected
                        ? "ring-2 ring-blue-500"
                        : "border-gray-200"
                    } disabled:opacity-25 disabled:cursor-not-allowed`}
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.name}
                  />
                );
              })}
            </div>
          )}
        </div>

        {canBeRemoved && (
          <button
            onClick={() => onRemove(group.id)}
            className="text-gray-400 hover:text-red-500 text-xl"
            title="Remover Cor"
            disabled={disabled}
          >
            &times;
          </button>
        )}
      </div>

      <div className="space-y-3">
        {group.questions.map((q, index) => {
          const questionRef = baseReferenceNumber + index;
          const isDuplicate =
            duplicateAnswers.has(q.answer) && q.answer.trim() !== "";
          const isActiveTool =
            activeTool?.answer === q.answer &&
            activeTool?.color.value === group.color.value;

          return (
            <div key={q.id} className="relative pt-5">
              {group.questions.length > 1 && (
                <button
                  onClick={() => handleRemoveQuestion(q)}
                  className="absolute top-0 left-0 text-gray-400 hover:text-red-500 text-lg leading-none"
                  title="Remover Pergunta"
                  disabled={disabled}
                >
                  &times;
                </button>
              )}

              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-500 text-sm">
                  ({questionRef})
                </span>
                <textarea
                  placeholder={`Pergunta ${index + 1}`}
                  value={q.text}
                  onChange={(e) =>
                    handleQuestionChange(q.id, "text", e.target.value)
                  }
                  rows={3}
                  disabled={disabled}
                  className="flex-grow p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Resposta"
                  value={q.answer}
                  onChange={(e) =>
                    handleQuestionChange(q.id, "answer", e.target.value)
                  }
                  onClick={() => {
                    if (q.answer.trim() !== "") {
                      setActiveTool({ answer: q.answer, color: group.color });
                    }
                  }}
                  maxLength={50}
                  readOnly={disabled}
                  className={`w-full p-2 border rounded-md text-sm bg-white text-gray-900 cursor-pointer ${
                    isDuplicate ? "border-red-500" : "border-gray-300"
                  } ${
                    isActiveTool ? "ring-2 ring-blue-500 border-blue-500" : ""
                  }`}
                />
              </div>

              {isDuplicate && (
                <p className="text-xs text-red-600 mt-1">
                  Esta resposta já está a ser usada.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={handleAddQuestion}
        className="w-full text-left text-sm text-blue-600 font-semibold mt-3 p-1 hover:bg-blue-50 rounded"
        disabled={disabled}
      >
        + Adicionar Pergunta
      </button>
    </div>
  );
};

export default ColorBlock;
