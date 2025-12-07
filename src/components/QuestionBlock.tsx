// src/components/QuestionBlock.tsx
import React, { useState, useRef, useEffect } from "react";
import { schoolColorPalette, SchoolColor } from "@/lib/colors";
import type { Question, QuestionType, ActiveTool } from "@/lib/types";

interface QuestionBlockProps {
  question: Question;
  onChange: (updatedQuestion: Question) => void;
  onRemove: (id: number) => void;
  canBeRemoved: boolean;
  baseReferenceNumber: number;
  duplicateAnswers: Set<string>;
  usedColorValues: Set<string>;
  setActiveTool: (tool: ActiveTool | null) => void;
  activeTool: ActiveTool | null;
  disabled: boolean;
}

const ColorPicker = ({
  selectedColor,
  onColorChange,
  usedColorValues,
  disabled,
}: {
  selectedColor: SchoolColor;
  onColorChange: (color: SchoolColor) => void;
  usedColorValues: Set<string>;
  disabled: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-md border border-gray-300 flex-shrink-0"
        style={{ backgroundColor: selectedColor.value }}
        disabled={disabled}
      />
      {isOpen && (
        <div className="absolute top-full mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10 grid grid-cols-6 gap-2">
          {schoolColorPalette.map((color) => {
            const isUsed =
              usedColorValues.has(color.value) &&
              color.value !== selectedColor.value;
            return (
              <button
                key={color.value}
                onClick={() => {
                  onColorChange(color);
                  setIsOpen(false);
                }}
                disabled={isUsed}
                className="w-8 h-8 rounded-md border border-gray-200 disabled:opacity-25"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const QuestionBlock = ({
  question,
  onChange,
  onRemove,
  canBeRemoved,
  baseReferenceNumber,
  duplicateAnswers,
  usedColorValues,
  setActiveTool,
  activeTool,
  disabled,
}: QuestionBlockProps) => {
  const handleTypeChange = (newType: QuestionType) => {
    if (newType === "single") {
      const firstOption = question.options[0] || {
        id: 1,
        text: "",
        answer: "",
      };
      const firstColor =
        (question.optionColors && question.optionColors[firstOption.id]) ||
        schoolColorPalette.find((c) => !usedColorValues.has(c.value)) ||
        schoolColorPalette[0];
      onChange({
        ...question,
        type: "single",
        options: [firstOption],
        correctOptionId: firstOption.id,
        color: firstColor,
        optionColors: undefined,
      });
    } else {
      // 'multiple'
      // CORREÇÃO: Usar o índice como um ID estável e previsível
      const newOptions = Array.from({ length: 4 }, (_, i) => ({
        id: Date.now() + i, // ID único para a chave de renderização
        text: question.options[i]?.text || "",
        // O valor da resposta agora é único, combinando o ID da pergunta e a letra da opção
        answer: `${question.id}-${String.fromCharCode(97 + i)}`,
      }));

      const newOptionColors: { [id: number]: SchoolColor } = {};
      const locallyUsed = new Set(usedColorValues);

      newOptions.forEach((opt) => {
        const nextColor = schoolColorPalette.find(
          (c) => !locallyUsed.has(c.value)
        );
        if (nextColor) {
          newOptionColors[opt.id] = nextColor;
          locallyUsed.add(nextColor.value);
        } else {
          newOptionColors[opt.id] =
            schoolColorPalette[opt.id % schoolColorPalette.length];
        }
      });

      onChange({
        ...question,
        type: "multiple",
        options: newOptions,
        correctOptionId: newOptions[0].id, // Padrão para a primeira opção (ID 0)
        color: undefined,
        optionColors: newOptionColors,
      });
    }
  };

  const handleTextChange = (
    field: "text" | "answer",
    value: string,
    optionId: number
  ) => {
    const updatedOptions = question.options.map((opt) =>
      opt.id === optionId ? { ...opt, [field]: value } : opt
    );
    onChange({ ...question, options: updatedOptions });
  };

  const colorsUsedInThisQuestion = new Set<string>();
  if (question.type === "multiple" && question.optionColors) {
    Object.values(question.optionColors).forEach((color) => {
      if (color) {
        colorsUsedInThisQuestion.add(color.value);
      }
    });
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 relative bg-gray-50/50">
      <div className="flex items-center justify-between pb-3 mb-3 border-b">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-500 text-sm">
            #{baseReferenceNumber}
          </span>
          <select
            value={question.type}
            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            disabled={disabled}
            className="p-1 text-sm border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="single">Resposta Única</option>
            <option value="multiple">Múltipla Escolha</option>
          </select>
        </div>
        {canBeRemoved && (
          <button
            onClick={() => onRemove(question.id)}
            disabled={disabled}
            className="text-gray-400 hover:text-red-500 text-2xl leading-none"
          >
            &times;
          </button>
        )}
      </div>

      {question.type === "single" ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <ColorPicker
              selectedColor={question.color!}
              disabled={disabled}
              usedColorValues={new Set()}
              onColorChange={(color) => onChange({ ...question, color })}
            />
            <textarea
              placeholder="Digite a pergunta aqui..."
              value={question.text}
              onChange={(e) => onChange({ ...question, text: e.target.value })}
              rows={2}
              disabled={disabled}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            {(() => {
              const opt = question.options[0];
              const isDuplicate =
                duplicateAnswers.has(opt.answer) && opt.answer.trim() !== "";
              const isActive = activeTool?.answer === opt.answer;
              return (
                <>
                  <input
                    type="text"
                    placeholder="Valor interno na grade (ex: R1)"
                    value={opt.answer}
                    onChange={(e) =>
                      handleTextChange("answer", e.target.value, opt.id)
                    }
                    onClick={() =>
                      !disabled &&
                      question.color &&
                      setActiveTool({
                        answer: opt.answer,
                        color: question.color,
                      })
                    }
                    readOnly={disabled}
                    className={`w-full p-2 border rounded-md text-sm ${
                      isDuplicate ? "border-red-500" : "border-gray-300"
                    } ${isActive ? "ring-2 ring-yellow-500" : ""}`}
                  />
                  {isDuplicate && (
                    <p className="text-xs text-red-600 mt-1">
                      Este valor interno já está em uso.
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      ) : (
        <>
          <textarea
            placeholder="Digite a pergunta aqui..."
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            rows={2}
            disabled={disabled}
            className="w-full p-2 border border-gray-300 rounded-md text-sm mb-3"
          />
          <div className="space-y-3">
            {question.options.map((opt) => {
              const color = question.optionColors?.[opt.id];
              
              // LÓGICA NOVA: Verifica se ESTA PERGUNTA é a que está ativa na ferramenta.
              // Compara a resposta da ferramenta ativa com a resposta da OPÇÃO CORRETA desta pergunta.
              const correctOption = question.options.find(o => o.id === question.correctOptionId);
              const isQuestionActive = activeTool?.answer === correctOption?.answer;

              // Extrai a letra do valor da resposta para exibição
              const displayLetter = opt.answer.includes("-")
                ? opt.answer.split("-")[1]
                : opt.answer;

              return (
                <div
                  key={opt.id}
                  className={`flex items-center gap-3 p-2 rounded-md border transition-all ${
                    // Destaca visualmente se esta é a pergunta ativa
                    isQuestionActive 
                      ? "bg-yellow-50 border-yellow-400 ring-1 ring-yellow-400" 
                      : "bg-white border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={`correct_option_${question.id}`}
                    disabled={disabled}
                    checked={question.correctOptionId === opt.id}
                    onChange={() =>
                      onChange({ ...question, correctOptionId: opt.id })
                    }
                    className="cursor-pointer accent-yellow-600 w-4 h-4"
                  />
                  <span className="font-mono font-bold text-gray-700">{displayLetter}.</span>
                  <ColorPicker
                    selectedColor={color!}
                    disabled={disabled}
                    usedColorValues={colorsUsedInThisQuestion}
                    onColorChange={(newColor) =>
                      onChange({
                        ...question,
                        optionColors: {
                          ...question.optionColors,
                          [opt.id]: newColor,
                        },
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder={`Texto da Opção ${displayLetter.toUpperCase()}`}
                    value={opt.text}
                    onChange={(e) =>
                      handleTextChange("text", e.target.value, opt.id)
                    }
                    // MUDANÇA CRÍTICA AQUI:
                    // Ao clicar em qualquer input de texto, selecionamos a OPÇÃO CORRETA como pincel
                    onClick={() => {
                        if (!disabled) {
                            const correctOpt = question.options.find(o => o.id === question.correctOptionId);
                            const correctCol = question.optionColors?.[question.correctOptionId];
                            
                            if (correctOpt && correctCol) {
                                setActiveTool({ answer: correctOpt.answer, color: correctCol });
                            }
                        }
                    }}
                    readOnly={disabled}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionBlock;