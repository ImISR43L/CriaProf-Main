import React from "react";
import QuestionBlock from "./QuestionBlock";
import { schoolColorPalette, SchoolColor } from "@/lib/colors";
import type { Question, ActiveTool, TemplateCategory } from "@/lib/types";

interface ControlPanelProps {
  title: string;
  setTitle: (title: string) => void;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  duplicateAnswers: Set<string>;
  setActiveTool: (tool: ActiveTool | null) => void;
  activeTool: ActiveTool | null;
  clearAnswersFromGrid: (answers: string[]) => void;
  isOwner: boolean;
  categories: TemplateCategory[];
  categoryId: string | undefined;
  setCategoryId: (id: string) => void;
  isTemplateEditor?: boolean;
}

const ControlPanel = ({
  title,
  setTitle,
  questions,
  setQuestions,
  duplicateAnswers,
  setActiveTool,
  activeTool,
  clearAnswersFromGrid,
  isOwner,
  categories,
  categoryId,
  setCategoryId,
  isTemplateEditor = false,
}: ControlPanelProps) => {
  const usedColorValues = new Set<string>();
  questions.forEach((q) => {
    if (q.type === "single" && q.color) {
      usedColorValues.add(q.color.value);
    } else if (q.type === "multiple" && q.optionColors) {
      Object.values(q.optionColors).forEach((color) =>
        usedColorValues.add(color.value)
      );
    }
  });

  const handleAddQuestion = () => {
    if (!isOwner) return;
    const nextColor =
      schoolColorPalette.find(
        (c: SchoolColor) => !usedColorValues.has(c.value)
      ) || schoolColorPalette[0];
    const newQuestion: Question = {
      id: Date.now(),
      text: "",
      type: "single",
      options: [{ id: Date.now() + 1, text: "", answer: "" }],
      correctOptionId: Date.now() + 1,
      color: nextColor,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (updatedQuestion: Question) => {
    if (!isOwner) return;
    setQuestions(
      questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  };

  const handleRemoveQuestion = (idToRemove: number) => {
    if (!isOwner || questions.length <= 1) return;
    const questionToRemove = questions.find((q) => q.id === idToRemove);
    if (questionToRemove) {
      const answersToClear = questionToRemove.options
        .map((opt) => opt.answer)
        .filter(Boolean);
      clearAnswersFromGrid(answersToClear);
    }
    setQuestions(questions.filter((q) => q.id !== idToRemove));
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
        {!isTemplateEditor && (
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
        )}
      </div>
      <div className="max-h-[50vh] overflow-y-auto pr-2">
        {questions.map((question, index) => (
          <QuestionBlock
            key={question.id}
            question={question}
            onChange={handleQuestionChange}
            onRemove={handleRemoveQuestion}
            canBeRemoved={questions.length > 1}
            baseReferenceNumber={index + 1}
            duplicateAnswers={duplicateAnswers}
            usedColorValues={usedColorValues}
            setActiveTool={setActiveTool}
            activeTool={activeTool}
            disabled={!isOwner}
          />
        ))}
      </div>
      {isOwner && (
        <button
          onClick={handleAddQuestion}
          className="w-full mt-4 p-2 border-2 border-dashed border-gray-400 rounded-md text-gray-600 font-semibold hover:bg-gray-100 hover:border-gray-500 transition-colors"
        >
          + Adicionar Pergunta
        </button>
      )}
    </aside>
  );
};

export default ControlPanel;
