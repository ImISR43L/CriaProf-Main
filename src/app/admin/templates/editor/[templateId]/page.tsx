// src/app/admin/templates/editor/[templateId]/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/components/AuthProvider";
import type { ColorGroup, ActiveTool } from "@/lib/types";
import Spinner from "@/components/Spinner";
import ControlPanel from "@/components/ControlPanel";
import InteractiveGrid from "@/components/InteractiveGrid";
import BrushPanel from "@/components/BrushPanel";
import GridSizeSelector from "@/components/GridSizeSelector";
import { useHistory } from "@/hooks/useHistory";

interface TemplateCategory {
  id: string;
  name: string;
}

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
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([]);
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
        setHistoryState(Array(gridSize * gridSize).fill(""), true);
        setColorGroups([
          {
            id: Date.now(),
            color: { name: "Amarelo", value: "#FFFF00" },
            questions: [{ id: 1, text: "", answer: "" }],
          },
        ]);
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

        const newColorGroups = new Map<string, ColorGroup>();
        (questionsData || []).forEach((q, index) => {
          const colorObj = JSON.parse(q.color);
          if (!newColorGroups.has(colorObj.value)) {
            newColorGroups.set(colorObj.value, {
              id: Date.now() + index * 1000,
              color: colorObj,
              questions: [],
            });
          }
          newColorGroups
            .get(colorObj.value)!
            .questions.push({
              id: Date.now() + index,
              text: q.question_text,
              answer: q.answer,
            });
        });
        setColorGroups(Array.from(newColorGroups.values()));
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
  ]);

  const handleSaveTemplate = async () => {
    if (!categoryId) {
      alert("Por favor, selecione uma categoria para o template.");
      return;
    }
    setSaving(true);

    const templateData = {
      title,
      description,
      category_id: categoryId,
      grid_size: gridSize,
      grid_data: gridState,
    };

    let currentTemplateId = templateId;
    if (isNewTemplate) {
      const { data: newTemplate, error } = await supabase
        .from("templates")
        .insert(templateData)
        .select()
        .single();
      if (error || !newTemplate) {
        alert(`Erro ao criar template: ${error?.message}`);
        setSaving(false);
        return;
      }
      currentTemplateId = newTemplate.id;
    } else {
      const { error } = await supabase
        .from("templates")
        .update(templateData)
        .eq("id", templateId);
      if (error) {
        alert(`Erro ao atualizar template: ${error.message}`);
        setSaving(false);
        return;
      }
      await supabase
        .from("template_questions")
        .delete()
        .eq("template_id", templateId);
    }
    const questionsToInsert = colorGroups.flatMap((group) =>
      group.questions
        .filter((q) => q.text && q.answer)
        .map((q) => ({
          template_id: currentTemplateId,
          color: JSON.stringify(group.color),
          question_text: q.text,
          answer: q.answer,
        }))
    );
    if (questionsToInsert.length > 0) {
      const { error } = await supabase
        .from("template_questions")
        .insert(questionsToInsert);
      if (error) {
        alert(`Erro ao salvar perguntas: ${error.message}`);
        setSaving(false);
        return;
      }
    }
    alert("Template salvo com sucesso!");
    router.push("/admin/templates");
    router.refresh();
  };

  const resetActiveToolIfNeeded = (removedAnswers: string[]) => {
    if (activeTool && removedAnswers.includes(activeTool.answer)) {
      setActiveTool(null);
    }
  };
  const checkForDuplicates = useCallback((groups: ColorGroup[]) => {
    const answerCounts = new Map<string, number>();
    groups.forEach((group) => {
      group.questions.forEach((q) => {
        if (q.answer.trim() !== "") {
          answerCounts.set(q.answer, (answerCounts.get(q.answer) || 0) + 1);
        }
      });
    });
    const duplicates = new Set<string>();
    for (const [answer, count] of answerCounts.entries()) {
      if (count > 1) {
        duplicates.add(answer);
      }
    }
    setDuplicateAnswers(duplicates);
  }, []);
  useEffect(() => {
    checkForDuplicates(colorGroups);
  }, [colorGroups, checkForDuplicates]);
  const clearAnswersFromGrid = (answersToClear: string[]) => {
    if (answersToClear.length === 0) return;
    resetActiveToolIfNeeded(answersToClear);
    const answersSet = new Set(answersToClear);
    const newGridState = gridState.map((cell) =>
      answersSet.has(cell) ? "" : cell
    );
    setGridState(newGridState);
    setHistoryState(newGridState);
  };
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
    setIsPainting(false);
    if (
      JSON.stringify(gridState) !== JSON.stringify(gridStateBeforePaint.current)
    ) {
      setHistoryState(gridState);
    }
  };

  if (loading || !profile || profile.role !== "admin") return <Spinner />;

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
            <div className="mb-4">
              <label
                htmlFor="category"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Categoria
              </label>
              <select
                id="category"
                value={categoryId || ""}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
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

            <label className="block text-sm font-bold text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo deste template."
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* CORREÇÃO APLICADA AQUI */}
          <ControlPanel
            title={title}
            setTitle={setTitle}
            colorGroups={colorGroups}
            setColorGroups={setColorGroups}
            duplicateAnswers={duplicateAnswers}
            setActiveTool={handleSetTool}
            activeTool={activeTool}
            clearAnswersFromGrid={clearAnswersFromGrid}
            isOwner={true}
            categories={categories}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
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
            colorGroups={colorGroups}
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
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {saving ? "A salvar..." : "Salvar Template"}
              </button>
              <button
                onClick={() => router.push("/admin/templates")}
                className="w-full bg-gray-500 text-white font-bold py-3 rounded-md hover:bg-gray-600 transition-colors"
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
