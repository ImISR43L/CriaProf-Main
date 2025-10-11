// src/app/page.tsx
"use client";
import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ControlPanel from "@/components/ControlPanel";
import InteractiveGrid from "@/components/InteractiveGrid";
import ToolPanel from "@/components/ToolPanel";
import GridSizeSelector from "@/components/GridSizeSelector";
import { useSupabase } from "@/components/AuthProvider";
import Spinner from "@/components/Spinner";
import type { ColorGroup, ActiveTool, Question } from "@/lib/types";
import { useHistory } from "@/hooks/useHistory";
import { schoolColorPalette } from "@/lib/colors";

function HomePageContent() {
  const { supabase } = useSupabase();
  const searchParams = useSearchParams();
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
  const [duplicateAnswers, setDuplicateAnswers] = useState<Set<string>>(new Set());
  const [activeTool, setActiveTool] = useState<ActiveTool | null>(null);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [brushSize, setBrushSize] = useState(1);
  const [isPainting, setIsPainting] = useState(false);

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

  useEffect(() => { checkForDuplicates(colorGroups); }, [colorGroups, checkForDuplicates]);

  useEffect(() => {
    setIsLoading(false); 
  }, []);

  useEffect(() => {
    if (!isLoading && colorGroups.length === 0 && !searchParams.get('quiz_id')) {
        setColorGroups([{
            id: Date.now(),
            color: schoolColorPalette[6], 
            questions: [{ id: 1, text: "", answer: "" }],
        }]);
    }
  }, [isLoading, colorGroups.length, searchParams]);

  useEffect(() => { setGridState(historyState); }, [historyState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'z') { event.preventDefault(); undoGrid(); }
      if (event.ctrlKey && event.key === 'y') { event.preventDefault(); redoGrid(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [undoGrid, redoGrid]);

  useEffect(() => {
    const newGrid = Array(gridSize * gridSize).fill("");
    setGridState(newGrid);
    setHistoryState(newGrid, true);
  }, [gridSize, setHistoryState]);
  
  const clearAnswersFromGrid = (answersToClear: string[]) => {
    if (answersToClear.length === 0) return;
    const answersSet = new Set(answersToClear);
    const newGridState = gridState.map(cell => answersSet.has(cell) ? "" : cell);
    setGridState(newGridState);
    setHistoryState(newGridState);
  };

  const paintCells = (index: number) => {
    setGridState(currentGrid => {
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
                    else if (activeTool?.answer.trim()) newGridState[targetIndex] = activeTool.answer;
                }
            }
        }
        return newGridState;
    });
  };

  const handleGridSizeChange = (newSize: number) => { if (!isQuizLoaded) setGridSize(newSize); };
  const handleClearGrid = () => { if (window.confirm("Tem certeza?")) { const clearedGrid = Array(gridSize*gridSize).fill(""); setGridState(clearedGrid); setHistoryState(clearedGrid); }};
  const handleSetTool = (tool: ActiveTool | null) => { setActiveTool(tool); setIsEraserActive(false); };
  const handleSetEraser = () => { setIsEraserActive(true); setActiveTool(null); };
  const handleMouseUp = () => { setIsPainting(false); if (JSON.stringify(gridState) !== JSON.stringify(gridStateBeforePaint.current)) setHistoryState(gridState); };

  if (isLoading) return <Spinner />;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8"><h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Gerador de Atividades "Pinte por Número"</h1></header>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr] xl:grid-cols-[380px_1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg shadow-md h-fit border border-gray-200">
            <GridSizeSelector selectedSize={gridSize} onChange={handleGridSizeChange} disabled={isQuizLoaded} />
            {isQuizLoaded && <p className="text-xs text-gray-500 mt-2">O tamanho da grade não pode ser alterado num questionário salvo.</p>}
          </div>
          <ControlPanel title={title} setTitle={setTitle} colorGroups={colorGroups} setColorGroups={setColorGroups} duplicateAnswers={duplicateAnswers} setActiveTool={handleSetTool} activeTool={activeTool} clearAnswersFromGrid={clearAnswersFromGrid} />
        </div>
        <div className="self-start" onMouseDown={() => { setIsPainting(true); gridStateBeforePaint.current = gridState; }} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <InteractiveGrid gridState={gridState} gridSize={gridSize} colorGroups={colorGroups} paintCells={paintCells} isPainting={isPainting} />
        </div>
        <ToolPanel onClearGrid={handleClearGrid} activityTitle={title} colorGroups={colorGroups} gridState={gridState} gridSize={gridSize} activeTool={activeTool} brushSize={brushSize} setBrushSize={setBrushSize} isEraserActive={isEraserActive} onSelectEraser={handleSetEraser} />
      </div>
    </div>
  );
}

export default function HomePage() { return <Suspense fallback={<Spinner />}><HomePageContent /></Suspense>; }