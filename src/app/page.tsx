// src/app/page.tsx
"use client";
import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ControlPanel from "@/components/ControlPanel";
import InteractiveGrid from "@/components/InteractiveGrid";
import ToolPanel from "@/components/ToolPanel";
import GridSizeSelector from "@/components/GridSizeSelector";
import { useSupabase } from "@/components/AuthProvider";
import Spinner from "@/components/Spinner";
import type { ColorGroup, ActiveTool } from "@/lib/types";
import { useHistory } from "@/hooks/useHistory";

type FetchedQuestion = {
  color: string;
  question_text: string;
  answer: string;
};

interface TemplateCategory {
  id: string;
  name: string;
}

function HomePageContent() {
  const { supabase, user } = useSupabase();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([]);
  const [gridSize, setGridSize] = useState(15);
  const {
    state: historyState,
    setState: setHistoryState,
    undo: undoGrid,
    redo: redoGrid,
  } = useHistory<string[]>(Array(15 * 15).fill(""));
  const [gridState, setGridState] = useState<string[]>(historyState);
  const gridStateBeforePaint = useRef<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuizLoaded, setIsQuizLoaded] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [duplicateAnswers, setDuplicateAnswers] = useState<Set<string>>(
    new Set()
  );
  const [activeTool, setActiveTool] = useState<ActiveTool | null>(null);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [brushSize, setBrushSize] = useState(1);
  const [isPainting, setIsPainting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("Salvo");

  // Novos estados para categorias
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>();

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

  useEffect(() => {
    const quizId = searchParams.get("quiz_id");
    const templateId = searchParams.get("template_id");
    setCurrentQuizId(quizId);

    const processAndSetData = (
      quizTitle: string,
      quizGridSize: number,
      quizGridData: string[] | null,
      questionsData: FetchedQuestion[],
      quizCategoryId?: string
    ) => {
      setTitle(quizTitle);
      setGridSize(quizGridSize);
      setCategoryId(quizCategoryId);
      const loadedGridState =
        quizGridData && quizGridData.length > 0
          ? quizGridData
          : Array(quizGridSize * quizGridSize).fill("");
      setHistoryState(loadedGridState, true);

      const newColorGroups = new Map<string, ColorGroup>();
      questionsData.forEach((q, index) => {
        const colorObj = JSON.parse(q.color);
        if (!newColorGroups.has(colorObj.value)) {
          newColorGroups.set(colorObj.value, {
            id: Date.now() + index * 1000,
            color: colorObj,
            questions: [],
          });
        }
        newColorGroups.get(colorObj.value)!.questions.push({
          id: Date.now() + index,
          text: q.question_text,
          answer: q.answer,
        });
      });

      setColorGroups(Array.from(newColorGroups.values()));
    };

    const fetchInitialData = async () => {
      setIsLoading(true);

      const { data: categoriesData } = await supabase
        .from("template_categories")
        .select("id, name")
        .order("order_index");
      if (categoriesData) setCategories(categoriesData);

      if (quizId) {
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select("title, grid_data, grid_size, user_id, category_id")
          .eq("id", quizId)
          .single();

        if (quizError || !quizData) {
          router.push("/");
          return;
        }

        setIsOwner(user?.id === quizData.user_id);

        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("color, question_text, answer")
          .eq("quiz_id", quizId);

        if (questionsError) {
          setIsLoading(false);
          return;
        }

        processAndSetData(
          quizData.title,
          quizData.grid_size,
          quizData.grid_data,
          questionsData as FetchedQuestion[],
          quizData.category_id
        );
        setIsQuizLoaded(true);
      } else if (templateId) {
        const { data: templateData, error: templateError } = await supabase
          .from("templates")
          .select("title, grid_size, grid_data, category_id")
          .eq("id", templateId)
          .single();

        if (templateError || !templateData) {
          router.push("/");
          return;
        }

        const { data: questionsData, error: questionsError } = await supabase
          .from("template_questions")
          .select("color, question_text, answer")
          .eq("template_id", templateId);

        if (questionsError) {
          setIsLoading(false);
          return;
        }

        processAndSetData(
          templateData.title,
          templateData.grid_size,
          templateData.grid_data,
          questionsData as FetchedQuestion[],
          templateData.category_id
        );
        setIsOwner(true);
        setIsQuizLoaded(false);
      } else {
        setIsOwner(true);
        if (colorGroups.length === 0) {
          setColorGroups([
            {
              id: Date.now(),
              color: { name: "Amarelo", value: "#FFFF00" },
              questions: [{ id: 1, text: "", answer: "" }],
            },
          ]);
        }
      }
      setIsLoading(false);
    };

    fetchInitialData();
  }, [supabase, searchParams, setHistoryState, router, user]);

  useEffect(() => {
    if (!currentQuizId || !isOwner) {
      return;
    }

    const handler = setTimeout(async () => {
      setAutoSaveStatus("Salvando...");

      const { error: quizError } = await supabase
        .from("quizzes")
        .update({ title, grid_data: gridState, category_id: categoryId })
        .eq("id", currentQuizId);

      if (quizError) {
        setAutoSaveStatus("Erro ao salvar");
        return;
      }

      await supabase.from("questions").delete().eq("quiz_id", currentQuizId);

      const questionsToInsert = colorGroups.flatMap((group) =>
        group.questions
          .filter((q) => q.text && q.answer)
          .map((q) => ({
            quiz_id: currentQuizId,
            color: JSON.stringify(group.color),
            question_text: q.text,
            answer: q.answer,
          }))
      );

      if (questionsToInsert.length > 0) {
        const { error: questionsError } = await supabase
          .from("questions")
          .insert(questionsToInsert);
        if (questionsError) {
          setAutoSaveStatus("Erro ao salvar");
          return;
        }
      }

      setAutoSaveStatus("Salvo ✓");
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [
    title,
    gridState,
    colorGroups,
    categoryId,
    currentQuizId,
    isOwner,
    supabase,
  ]);

  useEffect(() => {
    setGridState(historyState);
  }, [historyState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        undoGrid();
      }
      if (event.ctrlKey && event.key === "y") {
        event.preventDefault();
        redoGrid();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undoGrid, redoGrid]);

  useEffect(() => {
    if (!isQuizLoaded) {
      const newGrid = Array(gridSize * gridSize).fill("");
      setGridState(newGrid);
      setHistoryState(newGrid, true);
    }
  }, [gridSize, isQuizLoaded, setHistoryState]);

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
    if (!isOwner) return;
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

  const handleGridSizeChange = (newSize: number) => {
    if (!isQuizLoaded && isOwner) setGridSize(newSize);
  };
  const handleClearGrid = () => {
    if (window.confirm("Tem certeza?")) {
      const clearedGrid = Array(gridSize * gridSize).fill("");
      setGridState(clearedGrid);
      setHistoryState(clearedGrid);
    }
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
    )
      setHistoryState(gridState);
  };

  const onNewQuizSaved = (quizId: string) => {
    router.push(`/?quiz_id=${quizId}`);
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Gerador de Atividades &quot;Pinte por Número&quot;
        </h1>
        {currentQuizId && isOwner && (
          <p className="text-sm text-gray-500 mt-2 h-5">{autoSaveStatus}</p>
        )}
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr] xl:grid-cols-[380px_1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg shadow-md h-fit border border-gray-200">
            <GridSizeSelector
              selectedSize={gridSize}
              onChange={handleGridSizeChange}
              disabled={isQuizLoaded || !isOwner}
            />
            {isQuizLoaded && (
              <p className="text-xs text-gray-500 mt-2">
                O tamanho da grade não pode ser alterado num questionário salvo.
              </p>
            )}
          </div>
          <ControlPanel
            title={title}
            setTitle={setTitle}
            colorGroups={colorGroups}
            setColorGroups={setColorGroups}
            duplicateAnswers={duplicateAnswers}
            setActiveTool={handleSetTool}
            activeTool={activeTool}
            clearAnswersFromGrid={clearAnswersFromGrid}
            isOwner={isOwner}
            categories={categories}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
          />
        </div>
        <div
          className="self-start"
          onMouseDown={() => {
            if (!isOwner) return;
            setIsPainting(true);
            gridStateBeforePaint.current = gridState;
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <InteractiveGrid
            gridState={gridState}
            gridSize={gridSize}
            colorGroups={colorGroups}
            paintCells={paintCells}
            isPainting={isPainting}
          />
        </div>
        <ToolPanel
          onClearGrid={handleClearGrid}
          activityTitle={title}
          colorGroups={colorGroups}
          gridState={gridState}
          gridSize={gridSize}
          activeTool={activeTool}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          isEraserActive={isEraserActive}
          onSelectEraser={handleSetEraser}
          quizId={currentQuizId}
          isOwner={isOwner}
          onNewQuizSaved={onNewQuizSaved}
          categoryId={categoryId}
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <HomePageContent />
    </Suspense>
  );
}
