// src/app/admin/templates/editor/[templateId]/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/components/AuthProvider";
import type { Question, ActiveTool, TemplateCategory } from "@/lib/types";
import Spinner from "@/components/Spinner";
import ControlPanel from "@/components/ControlPanel";
import InteractiveGrid from "@/components/InteractiveGrid";
import BrushPanel from "@/components/BrushPanel";
import GridSizeSelector from "@/components/GridSizeSelector";
import { useHistory } from "@/hooks/useHistory";
import { schoolColorPalette, SchoolColor } from "@/lib/colors";

type FetchedOldQuestion = {
  color: string;
  question_text: string;
  answer: string;
};

export default function TemplateEditorPage() {
  const { supabase, profile } = useSupabase();
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;
  const isNewTemplate = templateId === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gridSize, setGridSize] = useState(15);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTool, setActiveTool] = useState<ActiveTool | null>(null);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [brushSize, setBrushSize] = useState(1);
  const [isPainting, setIsPainting] = useState(false);
  const [duplicateAnswers, setDuplicateAnswers] = useState<Set<string>>(
    new Set()
  );
  const { state: historyState, setState: setHistoryState } = useHistory<
    string[]
  >([]);
  const [gridState, setGridState] = useState<string[]>(historyState);
  const gridStateBeforePaint = useRef<string[]>([]);

  useEffect(() => {
    setGridState(historyState);
  }, [historyState]);
  useEffect(() => {
    if (profile && profile.role !== "admin") {
      router.push("/");
    }
  }, [profile, router]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: categoriesData } = await supabase
        .from("template_categories")
        .select("id, name")
        .order("order_index");
      if (categoriesData) setCategories(categoriesData);

      if (isNewTemplate) {
        if (questions.length === 0) {
          setHistoryState(Array(gridSize * gridSize).fill(""), true);
          setQuestions([
            {
              id: Date.now(),
              text: "",
              type: "single",
              options: [{ id: Date.now() + 1, text: "", answer: "" }],
              correctOptionId: Date.now() + 1,
              color: schoolColorPalette[0],
            },
          ]);
        }
        setLoading(false);
      } else {
        const { data: templateData } = await supabase
          .from("templates")
          .select("*")
          .eq("id", templateId)
          .single();
        if (!templateData) {
          router.push("/admin/templates");
          return;
        }
        const { data: questionsData } = await supabase
          .from("template_questions")
          .select("*")
          .eq("template_id", templateId);

        setTitle(templateData.title);
        setDescription(templateData.description || "");
        setCategoryId(templateData.category_id || undefined);
        setGridSize(templateData.grid_size);
        setHistoryState(
          templateData.grid_data ||
            Array(templateData.grid_size * templateData.grid_size).fill(""),
          true
        );

        const newQuestions: Question[] = [];
        const colorMap = new Map<
          string,
          { color: SchoolColor; items: FetchedOldQuestion[] }
        >();
        ((questionsData as FetchedOldQuestion[]) || []).forEach((q) => {
          const colorObj = JSON.parse(q.color) as SchoolColor;
          if (!colorMap.has(colorObj.value))
            colorMap.set(colorObj.value, { color: colorObj, items: [] });
          colorMap.get(colorObj.value)!.items.push(q);
        });
        Array.from(colorMap.values()).forEach((group) => {
          group.items.forEach((item, index) => {
            newQuestions.push({
              id: Date.now() + index,
              text: item.question_text,
              type: "single",
              options: [
                { id: Date.now() + index + 1, text: "", answer: item.answer },
              ],
              correctOptionId: Date.now() + index + 1,
              color: group.color,
            });
          });
        });
        setQuestions(newQuestions);
        setLoading(false);
      }
    };
    if (profile?.role === "admin") {
      fetchInitialData();
    }
  }, [
    profile,
    templateId,
    isNewTemplate,
    supabase,
    router,
    setHistoryState,
    gridSize,
    questions.length,
  ]);

  const handleSaveTemplate = async () => {
    if (!categoryId) {
      alert("Por favor, selecione uma categoria para o template.");
      return;
    }
    setSaving(true);
    alert(
      "Funcionalidade de salvar template em desenvolvimento para a nova estrutura."
    );
    setSaving(false);
    router.push("/admin/templates");
  };

  const checkForDuplicates = useCallback((qs: Question[]) => {
    const answerCounts = new Map<string, number>();
    qs.forEach((q) =>
      q.options.forEach((opt) => {
        if (opt.answer.trim())
          answerCounts.set(opt.answer, (answerCounts.get(opt.answer) || 0) + 1);
      })
    );
    const duplicates = new Set<string>();
    for (const [answer, count] of answerCounts.entries()) {
      if (count > 1) duplicates.add(answer);
    }
    setDuplicateAnswers(duplicates);
  }, []);

  useEffect(() => {
    checkForDuplicates(questions);
  }, [questions, checkForDuplicates]);

  const clearAnswersFromGrid = useCallback(
    (answersToClear: string[]) => {
      if (answersToClear.length === 0) return;
      if (activeTool && answersToClear.includes(activeTool.answer))
        setActiveTool(null);
      const answersSet = new Set(answersToClear);
      const newGridState = gridState.map((cell) =>
        answersSet.has(cell) ? "" : cell
      );
      setGridState(newGridState);
      setHistoryState(newGridState);
    },
    [activeTool, gridState, setHistoryState]
  );

  const paintCells = (index: number) => {
    setGridState((currentGrid) => {
      const newGridState = [...currentGrid];
      const startCol = index % gridSize;
      const startRow = Math.floor(index / gridSize);
      for (let r = 0; r < brushSize; r++) {
        for (let c = 0; c < brushSize; c++) {
          const targetRow = startRow + r;
          const targetCol = startCol + c;
          if (targetRow < gridSize && targetCol < gridSize) {
            const targetIndex = targetRow * gridSize + targetCol;
            if (isEraserActive) newGridState[targetIndex] = "";
            else if (activeTool?.answer.trim())
              newGridState[targetIndex] = activeTool.answer;
          }
        }
      }
      return newGridState;
    });
  };

  const handleSetTool = (tool: ActiveTool | null) => {
    setActiveTool(tool);
    setIsEraserActive(false);
  };
  const handleSetEraser = () => {
    setIsEraserActive(true);
    setActiveTool(null);
  };
  const handleMouseUp = () => {
    if (isPainting) {
      setIsPainting(false);
      if (
        JSON.stringify(gridState) !==
        JSON.stringify(gridStateBeforePaint.current)
      )
        setHistoryState(gridState);
    }
  };

  if (loading || !profile || profile.role !== "admin") return <Spinner />;

  const answerToColorMap = new Map<string, string>();
  const answerToQuestionRefMap = new Map<string, string>();
  questions.forEach((question, index) => {
    const questionRef = `Q${index + 1}`;
    if (
      question.type === "single" &&
      question.color &&
      question.options[0]?.answer
    ) {
      answerToColorMap.set(question.options[0].answer, question.color.value);
      answerToQuestionRefMap.set(
        question.options[0].answer,
        question.options[0].answer
      );
    } else if (question.type === "multiple" && question.optionColors) {
      question.options.forEach((option) => {
        const color = question.optionColors?.[option.id];
        if (color && option.answer) {
          answerToColorMap.set(option.answer, color.value);
          answerToQuestionRefMap.set(option.answer, questionRef);
        }
      });
    }
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {isNewTemplate ? "Criar Novo Template" : "Editar Template"}
        </h1>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr] xl:grid-cols-[380px_1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg shadow-md h-fit border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Detalhes do Template
            </h2>
            <div className="space-y-4">
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
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o objetivo deste template."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          <ControlPanel
            title={title}
            setTitle={setTitle}
            questions={questions}
            setQuestions={setQuestions}
            duplicateAnswers={duplicateAnswers}
            setActiveTool={handleSetTool}
            activeTool={activeTool}
            clearAnswersFromGrid={clearAnswersFromGrid}
            isOwner={true}
            categories={categories}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            isTemplateEditor={true}
          />
        </div>
        <div
          onMouseDown={() => {
            setIsPainting(true);
            gridStateBeforePaint.current = gridState;
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <InteractiveGrid
            gridState={gridState || []}
            gridSize={gridSize}
            answerToColorMap={answerToColorMap}
            answerToQuestionRefMap={answerToQuestionRefMap}
            paintCells={paintCells}
            isPainting={isPainting}
          />
        </div>
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg shadow-md h-fit border border-gray-200">
            <GridSizeSelector
              selectedSize={gridSize}
              onChange={(s) => setGridSize(s)}
              disabled={!isNewTemplate}
            />
            {!isNewTemplate && (
              <p className="text-xs text-gray-500 mt-2">
                O tamanho da grade não pode ser alterado num template existente.
              </p>
            )}
          </div>
          <BrushPanel
            activeTool={activeTool}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            isEraserActive={isEraserActive}
            onSelectEraser={handleSetEraser}
            disabled={false}
          />
          <aside className="bg-white p-5 rounded-lg shadow-md h-fit border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Ações do Template
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleSaveTemplate}
                disabled={saving}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {saving ? "A salvar..." : "Salvar Template"}
              </button>
              <button
                onClick={() => router.push("/admin/templates")}
                className="w-full bg-gray-500 text-white font-bold py-3 rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
