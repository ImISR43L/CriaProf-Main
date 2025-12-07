// src/app/create/page.tsx
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
  answer_options?: FetchedOption[];
  template_answer_options?: FetchedOption[];
};
type SupabasePayload<T> = {
  title: string;
  grid_size: number;
  grid_data: string[] | null;
  category_id?: string;
  user_id?: string;
  questions: T[];
  template_questions: T[];
};

function CreatePageContent() {
  // Renomeado de HomePageContent
  const { supabase, user } = useSupabase();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState("Atividade Sem Título");
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

  const loadedIdRef = useRef<string | boolean | null>(null);

  const processAndSetData = useCallback(
    (
      dataTitle: string,
      dataGridSize: number,
      dataGridData: string[] | null,
      dataQuestions: FetchedQuestion[],
      dataCategoryId?: string
    ) => {
      setTitle(dataTitle);
      setGridSize(dataGridSize);
      setCategoryId(dataCategoryId);
      const loadedGridState =
        dataGridData || Array(dataGridSize * dataGridSize).fill("");
      setHistoryState(loadedGridState, true);

      const newQuestions: Question[] = dataQuestions.map((q) => {
        const optionsData = q.answer_options || q.template_answer_options || [];
        const options = optionsData.map((opt) => ({
          id: opt.id,
          text: opt.text,
          answer: opt.answer,
        }));
        let color: SchoolColor | undefined;
        let optionColors: Record<number, SchoolColor> | undefined;

        if (q.type === "single") {
          try {
            color = optionsData[0]
              ? JSON.parse(optionsData[0].color)
              : undefined;
          } catch {
            color = undefined;
          }
        } else {
          optionColors = {};
          optionsData.forEach((opt) => {
            try {
              optionColors![opt.id] = JSON.parse(opt.color);
            } catch {
              // Ignora a cor se for inválida
            }
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
      });
      setQuestions(newQuestions);
    },
    [setHistoryState]
  );

  // Função para substituir valores na grade (ex: trocou a resposta certa de A para B)
  const replaceGridValues = useCallback(
    (oldVal: string, newVal: string) => {
      // CORREÇÃO: Impede que o sistema substitua células vazias ("")
      // Isso evita que a grade inteira seja pintada ao criar/mudar perguntas
      if (!oldVal || oldVal.trim() === "") return;

      setHistoryState((prevState) => {
        return prevState.map((cell) => (cell === oldVal ? newVal : cell));
      });
    },
    [setHistoryState]
  );

  // Função inteligente para atualizar a pergunta e sincronizar a grade
  const handleQuestionUpdate = (updatedQuestion: Question) => {
    setQuestions((prevQuestions) => {
      const oldQuestion = prevQuestions.find(
        (q) => q.id === updatedQuestion.id
      );

      if (!oldQuestion) return prevQuestions;

      // --- LÓGICA 1: MÚLTIPLA ESCOLHA (Troca de Opção Correta) ---
      if (
        updatedQuestion.type === "multiple" &&
        oldQuestion.correctOptionId !== updatedQuestion.correctOptionId
      ) {
        const oldCorrectOpt = oldQuestion.options.find(
          (o) => o.id === oldQuestion.correctOptionId
        );
        const newCorrectOpt = updatedQuestion.options.find(
          (o) => o.id === updatedQuestion.correctOptionId
        );

        if (oldCorrectOpt && newCorrectOpt && oldCorrectOpt.answer) {
          replaceGridValues(oldCorrectOpt.answer, newCorrectOpt.answer);

          if (activeTool?.answer === oldCorrectOpt.answer) {
            const newColor =
              updatedQuestion.optionColors?.[newCorrectOpt.id] ||
              schoolColorPalette[0];
            setActiveTool({ answer: newCorrectOpt.answer, color: newColor });
          }
        }
      }

      // --- LÓGICA 2: RESPOSTA ÚNICA (Mudança de Texto da Resposta) ---
      if (updatedQuestion.type === "single") {
        const oldOption = oldQuestion.options[0];
        const newOption = updatedQuestion.options[0];

        // Verifica se a resposta mudou e se a antiga não era vazia
        if (
          oldOption &&
          newOption &&
          oldOption.answer !== newOption.answer &&
          oldOption.answer.trim() !== ""
        ) {
          // 1. Substitui na grade (ex: troca todos os "32" por "34")
          replaceGridValues(oldOption.answer, newOption.answer);

          // 2. Atualiza a ferramenta ativa se o usuário estiver com ela selecionada
          if (activeTool?.answer === oldOption.answer) {
            setActiveTool({
              answer: newOption.answer,
              color: updatedQuestion.color || schoolColorPalette[0],
            });
          }
        }
      }

      return prevQuestions.map((q) =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      );
    });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const quizId = searchParams.get("quiz_id");
      const templateId = searchParams.get("template_id");
      const currentId = quizId || templateId;

      if (loadedIdRef.current === currentId && currentId !== null) {
        return;
      }

      setIsLoading(true);
      loadedIdRef.current = currentId;

      const { data: categoriesData } = await supabase
        .from("template_categories")
        .select("id, name")
        .order("order_index");
      if (categoriesData) setCategories(categoriesData);

      if (quizId) {
        setCurrentQuizId(quizId);
        const { data: quizData } = await supabase
          .from("quizzes")
          .select(`*, questions(*, answer_options(*))`)
          .eq("id", quizId)
          .single<SupabasePayload<FetchedQuestion>>();
        if (quizData) {
          setIsOwner(user?.id === quizData.user_id);
          processAndSetData(
            quizData.title,
            quizData.grid_size,
            quizData.grid_data,
            quizData.questions,
            quizData.category_id
          );
          setIsQuizLoaded(true);
        } else {
          router.push("/create"); // Atualizado para /create
        }
      } else if (templateId) {
        const { data: templateData, error } = await supabase
          .from("templates")
          .select("*, template_questions(*, template_answer_options(*))")
          .eq("id", templateId)
          .single<SupabasePayload<FetchedQuestion>>();
        if (error || !templateData) {
          router.push("/create"); // Atualizado para /create
          return;
        }

        processAndSetData(
          templateData.title,
          templateData.grid_size,
          templateData.grid_data,
          templateData.template_questions,
          templateData.category_id
        );
        setIsOwner(true);
        setIsQuizLoaded(false);
        setCurrentQuizId(null);
      } else {
        if (questions.length === 0) {
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
          setHistoryState(Array(gridSize * gridSize).fill(""), true);
        }
      }
      setIsLoading(false);
    };

    fetchInitialData();
  }, [
    user,
    searchParams,
    supabase,
    router,
    processAndSetData,
    setHistoryState,
  ]);

  const handleGridSizeChange = (newSize: number) => {
    // Verifica se é o dono e se não é um quiz carregado (que bloqueia mudança de tamanho)
    if (isQuizLoaded || !isOwner) return;

    // Verifica se existe algum conteúdo na grade atual
    const hasDrawing = gridState.some((cell) => cell !== "");

    if (hasDrawing) {
      const confirmed = window.confirm(
        "Atenção: Mudar o tamanho da grade apagará todo o desenho atual. Deseja continuar?"
      );
      if (!confirmed) return;
    }

    setGridSize(newSize);
    setHistoryState(Array(newSize * newSize).fill(""), true);
  };

  useEffect(() => {
    if (!currentQuizId || !isOwner) return;
    const handler = setTimeout(async () => {
      setAutoSaveStatus("Salvando...");
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

  const resetActiveToolIfNeeded = useCallback(
    (removedAnswers: string[]) => {
      if (activeTool && removedAnswers.includes(activeTool.answer))
        setActiveTool(null);
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
            if (isEraserActive) newGridState[targetIndex] = "";
            else if (activeTool?.answer.trim())
              newGridState[targetIndex] = activeTool.answer;
          }
        }
      }
      return newGridState;
    });
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
    if (isPainting) {
      setIsPainting(false);
      if (
        JSON.stringify(gridState) !==
        JSON.stringify(gridStateBeforePaint.current)
      )
        setHistoryState(gridState);
    }
  };
  const onNewQuizSaved = (quizId: string) => {
    router.push(`/create?quiz_id=${quizId}`); // Atualizado para /create
  };

  if (isLoading) return <Spinner />;

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
            onQuestionUpdate={handleQuestionUpdate}
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
            answerToQuestionRefMap={answerToQuestionRefMap}
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

export default function CreatePage() {
  // Renomeado de HomePage
  return (
    <Suspense fallback={<Spinner />}>
      <CreatePageContent />
    </Suspense>
  );
}
