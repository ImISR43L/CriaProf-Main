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
import type { Question, ActiveTool, TemplateCategory } from "@/lib/types";
import { useHistory } from "@/hooks/useHistory";
import { schoolColorPalette } from "@/lib/colors";

// Tipo de dados simulado vindo do Supabase
type FetchedDBQuestion = {
  id: number;
  text: string;
  type: "single" | "multiple";
  correct_option_id: number;
  options: {
    id: number;
    text: string;
    answer: string;
  }[];
  color?: string;
  option_colors?: string;
};

function HomePageContent() {
  const { supabase, user } = useSupabase();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gridSize, setGridSize] = useState(15);
  const {
    state: historyState,
    setState: setHistoryState,
    undo: undoGrid,
    redo: redoGrid,
  } = useHistory<string[]>([]);
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
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const resetActiveToolIfNeeded = useCallback(
    (removedAnswers: string[]) => {
      if (activeTool && removedAnswers.includes(activeTool.answer)) {
        setActiveTool(null);
      }
    },
    [activeTool]
  );

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

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      const quizId = searchParams.get("quiz_id");
      const templateId = searchParams.get("template_id");

      const { data: categoriesData } = await supabase
        .from("template_categories")
        .select("id, name")
        .order("order_index");
      if (categoriesData) setCategories(categoriesData);

      if (quizId) {
        // A busca no Supabase precisará de JOINs para a nova estrutura de tabelas
        // Esta é uma simulação da lógica de carregamento
        setCurrentQuizId(quizId);
        // Exemplo: const { data: quizData } = await supabase.from("quizzes")...
        // Por agora, vamos simular que não encontrou nada para evitar erros
        setIsOwner(false); // Assumindo que o quiz carregado pode não ser do usuário
        setIsQuizLoaded(true);
      } else if (templateId) {
        // Lógica para carregar de um template
        setIsOwner(true); // O usuário se torna "dono" de uma cópia do template
      } else {
        // Nova atividade, o usuário é o dono
        setIsOwner(true);
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
      setIsLoading(false);
    };

    fetchInitialData();
  }, [supabase, searchParams, user, router, setHistoryState]);

  // Auto-save logic
  useEffect(() => {
    if (!currentQuizId || !isOwner) return;

    setAutoSaveStatus("Aguardando alterações...");
    const handler = setTimeout(async () => {
      setAutoSaveStatus("Salvando...");
      // Lógica de update no Supabase iria aqui
      // await supabase.from("quizzes").update({ title, grid_data: gridState, ... }).eq("id", currentQuizId);
      // await supabase.from("questions").upsert(questions.map(...));

      // Simula a chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setAutoSaveStatus("Salvo ✓");
    }, 2000);

    return () => clearTimeout(handler);
  }, [
    title,
    gridState,
    questions,
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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoGrid, redoGrid]);

  useEffect(() => {
    if (!isQuizLoaded) {
      const newGrid = Array(gridSize * gridSize).fill("");
      setGridState(newGrid);
      setHistoryState(newGrid, true);
    }
  }, [gridSize, isQuizLoaded, setHistoryState]);

  const clearAnswersFromGrid = useCallback(
    (answersToClear: string[]) => {
      if (answersToClear.length === 0) return;
      resetActiveToolIfNeeded(answersToClear);
      const answersSet = new Set(answersToClear);
      const newGridState = gridState.map((cell) =>
        answersSet.has(cell) ? "" : cell
      );
      setGridState(newGridState);
      setHistoryState(newGridState);
    },
    [gridState, resetActiveToolIfNeeded, setHistoryState]
  );

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
            if (isEraserActive) {
              newGridState[targetIndex] = "";
            } else if (activeTool?.answer.trim()) {
              newGridState[targetIndex] = activeTool.answer;
            }
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
    if (window.confirm("Tem certeza que deseja limpar a grade?")) {
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
    if (isPainting) {
      setIsPainting(false);
      if (
        JSON.stringify(gridState) !==
        JSON.stringify(gridStateBeforePaint.current)
      ) {
        setHistoryState(gridState);
      }
    }
  };

  const onNewQuizSaved = (quizId: string) => {
    router.push(`/?quiz_id=${quizId}`);
  };

  if (isLoading) return <Spinner />;

  // Cria o mapa de cores para a grade (lógica inalterada)
  const answerToColorMap = new Map<string, string>();
  questions.forEach((question) => {
    if (
      question.type === "single" &&
      question.color &&
      question.options[0]?.answer
    ) {
      answerToColorMap.set(question.options[0].answer, question.color.value);
    } else if (question.type === "multiple" && question.optionColors) {
      question.options.forEach((option) => {
        const color = question.optionColors?.[option.id];
        if (color && option.answer) {
          answerToColorMap.set(option.answer, color.value);
        }
      });
    }
  });

  // NOVO: Cria um mapa de resposta -> referência da questão
  const answerToQuestionRefMap = new Map<string, string>();
  questions.forEach((question, index) => {
    const questionRef = `Q${index + 1}`;
    question.options.forEach((option) => {
      // Para perguntas de múltipla escolha, o texto exibido será a referência.
      // Para resposta única, mantemos o valor da própria resposta.
      const displayText =
        question.type === "multiple" ? questionRef : option.answer;
      answerToQuestionRefMap.set(option.answer, displayText);
    });
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Gerador de Atividades &quot;Pinte por Resposta&quot;
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
            questions={questions}
            setQuestions={setQuestions}
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
            answerToColorMap={answerToColorMap}
            answerToQuestionRefMap={answerToQuestionRefMap} // Passando o novo mapa
            paintCells={paintCells}
            isPainting={isPainting}
          />
        </div>
        <ToolPanel
          onClearGrid={handleClearGrid}
          activityTitle={title}
          questions={questions}
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
