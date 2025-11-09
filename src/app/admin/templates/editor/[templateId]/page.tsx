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

type FetchedOption = {
  id: number;
  text: string;
  answer: string;
  color: string;
};
type FetchedQuestion = {
  id: number;
  text: string;
  type: "single" | "multiple";
  correct_option_id: number;
  template_answer_options: FetchedOption[];
};
type SupabasePayload = {
  title: string;
  description: string | null;
  grid_size: number;
  grid_data: string[] | null;
  category_id?: string;
  template_questions: FetchedQuestion[];
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
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const hasLoaded = useRef(false);

  useEffect(() => {
    setGridState(historyState);
  }, [historyState]);
  useEffect(() => {
    if (profile && profile.role !== "admin") {
      router.push("/");
    }
  }, [profile, router]);

  useEffect(() => {
    if (hasLoaded.current) return;

    const fetchInitialData = async () => {
      hasLoaded.current = true;
      setLoading(true);
      const { data: categoriesData } = await supabase
        .from("template_categories")
        .select("id, name")
        .order("order_index");
      if (categoriesData) setCategories(categoriesData);

      if (isNewTemplate) {
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
        setHistoryState(Array(gridSize * gridSize).fill(""), true);
      } else {
        const { data: templateData, error } = await supabase
          .from("templates")
          .select("*, template_questions(*, template_answer_options(*))")
          .eq("id", templateId)
          .single<SupabasePayload>();
        if (error || !templateData) {
          router.push("/admin/templates");
          return;
        }

        setTitle(templateData.title);
        setDescription(templateData.description || "");
        setCategoryId(templateData.category_id || undefined);
        setGridSize(templateData.grid_size);
        setHistoryState(
          templateData.grid_data ||
            Array(templateData.grid_size * templateData.grid_size).fill(""),
          true
        );

        const newQuestions: Question[] = templateData.template_questions.map(
          (q) => {
            const options = q.template_answer_options.map((opt) => ({
              id: opt.id,
              text: opt.text,
              answer: opt.answer,
            }));
            let color: SchoolColor | undefined;
            let optionColors: Record<number, SchoolColor> | undefined;

            if (q.type === "single") {
              color = q.template_answer_options[0]
                ? JSON.parse(q.template_answer_options[0].color)
                : undefined;
            } else {
              optionColors = {};
              q.template_answer_options.forEach((opt) => {
                optionColors![opt.id] = JSON.parse(opt.color);
              });
            }
            return {
              id: q.id,
              text: q.text,
              type: q.type,
              options,
              correctOptionId: q.correct_option_id,
              color,
              optionColors,
            };
          }
        );
        setQuestions(newQuestions);
      }
      setLoading(false);
    };
    if (profile?.role === "admin") {
      fetchInitialData();
    }
  }, [
    profile,
    isNewTemplate,
    templateId,
    supabase,
    router,
    setHistoryState,
    gridSize,
  ]);

  const handleGridSizeChange = (newSize: number) => {
    if (isNewTemplate) {
      setGridSize(newSize);
      setHistoryState(Array(newSize * newSize).fill(""), true);
    }
  };

  const handleSaveTemplate = async () => {
    if (!title.trim() || !categoryId) {
      setMessage("Por favor, preencha o título e a categoria.");
      setMessageType("error");
      return;
    }
    setSaving(true);
    setMessage("");

    let currentTemplateId = isNewTemplate ? null : templateId;

    if (isNewTemplate) {
      const { data: newTemplate, error } = await supabase
        .from("templates")
        .insert({
          title,
          description,
          category_id: categoryId,
          grid_size: gridSize,
          grid_data: gridState,
        })
        .select()
        .single();
      if (error || !newTemplate) {
        setMessage(`Erro ao criar template: ${error?.message}`);
        setMessageType("error");
        setSaving(false);
        return;
      }
      currentTemplateId = newTemplate.id;
    } else {
      const { error } = await supabase
        .from("templates")
        .update({
          title,
          description,
          category_id: categoryId,
          grid_data: gridState,
        })
        .eq("id", currentTemplateId!);
      if (error) {
        setMessage(`Erro ao atualizar template: ${error.message}`);
        setMessageType("error");
        setSaving(false);
        return;
      }
      await supabase
        .from("template_questions")
        .delete()
        .eq("template_id", currentTemplateId!);
    }

    for (const question of questions) {
      const { data: questionData, error: questionError } = await supabase
        .from("template_questions")
        .insert({
          template_id: currentTemplateId,
          text: question.text,
          type: question.type,
          correct_option_id: question.correctOptionId,
        })
        .select()
        .single();
      if (questionError || !questionData) {
        setMessage(`Erro ao salvar pergunta: ${questionError?.message}`);
        setMessageType("error");
        continue;
      }
      const optionsToInsert = question.options.map((opt) => ({
        question_id: questionData.id,
        text: opt.text,
        answer: opt.answer,
        color: JSON.stringify(
          question.type === "single"
            ? question.color
            : question.optionColors?.[opt.id]
        ),
      }));
      if (optionsToInsert.length > 0) {
        await supabase.from("template_answer_options").insert(optionsToInsert);
      }
    }

    setMessage("Template salvo com sucesso!");
    setMessageType("success");
    setSaving(false);
    setTimeout(() => {
      router.push("/admin/templates");
      router.refresh();
    }, 2000);
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
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-yellow-500 focus:border-yellow-500"
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
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-yellow-500 focus:border-yellow-500"
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
              onChange={handleGridSizeChange}
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
                className="w-full bg-yellow-600 text-white font-bold py-3 rounded-md hover:bg-yellow-700 disabled:bg-yellow-400"
              >
                {saving ? "A salvar..." : "Salvar Template"}
              </button>
              <button
                onClick={() => router.push("/admin/templates")}
                className="w-full bg-gray-500 text-white font-bold py-3 rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
              {message && (
                <p
                  className={`text-sm text-center font-semibold ${
                    messageType === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
