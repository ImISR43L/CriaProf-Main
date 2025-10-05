// src/app/page.tsx
"use client";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ControlPanel from "@/components/ControlPanel";
import InteractiveGrid from "@/components/InteractiveGrid";
import ActionsPanel from "@/components/ActionsPanel";
import { useSupabase } from "@/components/AuthProvider";
import Spinner from "@/components/Spinner";

export interface Question {
  id: number;
  text: string;
  answer: string;
}
export interface ColorGroup {
  id: number;
  color: string;
  name: string;
  questions: Question[];
}
interface GridSizeSelectorProps {
  selectedSize: number;
  onChange: (size: number) => void;
  disabled: boolean;
}

const GridSizeSelector = ({
  selectedSize,
  onChange,
  disabled,
}: GridSizeSelectorProps) => {
  const sizes = [10, 15, 20];
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tamanho da Grade
      </label>
      <div className="flex gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onChange(size)}
            disabled={disabled}
            className={`px-4 py-2 rounded-md text-sm font-semibold border transition-colors ${
              selectedSize === size
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            } disabled:bg-gray-200 disabled:cursor-not-allowed`}
          >
            {size}x{size}
          </button>
        ))}
      </div>
    </div>
  );
};

function HomePageContent() {
  const { supabase } = useSupabase();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([]);
  const [gridSize, setGridSize] = useState(15);
  const [gridState, setGridState] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuizLoaded, setIsQuizLoaded] = useState(false);
  const [duplicateAnswers, setDuplicateAnswers] = useState<Set<string>>(
    new Set()
  );

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

    const fetchQuizData = async (id: string) => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select(
          "title, grid_data, grid_size, questions ( color, question_text, answer )"
        )
        .eq("id", id)
        .single();

      if (data) {
        const loadedSize = data.grid_size || 15;
        setTitle(data.title);
        setGridSize(loadedSize);
        setGridState(data.grid_data || Array(loadedSize * loadedSize).fill(""));
        setIsQuizLoaded(true);

        const groups: { [key: string]: Question[] } = {};
        data.questions.forEach((q: any, i: number) => {
          if (!groups[q.color]) groups[q.color] = [];
          groups[q.color].push({
            id: Date.now() + i, // Use timestamp for unique ID
            text: q.question_text,
            answer: q.answer,
          });
        });
        const loadedColorGroups = Object.entries(groups).map(
          ([color, questions], index) => {
            return {
              id: Date.now() + index,
              name: `Cor ${index + 1}`,
              color,
              questions,
            };
          }
        );
        setColorGroups(loadedColorGroups);
      }
      setIsLoading(false);
    };

    const fetchTemplateData = async (id: string) => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("templates")
        .select(
          "title, grid_size, template_questions ( color, question_text, answer )"
        )
        .eq("id", id)
        .single();

      if (data) {
        const loadedSize = data.grid_size || 15;
        setTitle(data.title);
        setGridSize(loadedSize);
        setGridState(Array(loadedSize * loadedSize).fill(""));
        setIsQuizLoaded(false);

        const groups: { [key: string]: Question[] } = {};
        data.template_questions.forEach((q: any, i: number) => {
          if (!groups[q.color]) groups[q.color] = [];
          groups[q.color].push({
            id: Date.now() + i, // Use timestamp for unique ID
            text: q.question_text,
            answer: q.answer,
          });
        });
        const loadedColorGroups = Object.entries(groups).map(
          ([color, questions], index) => {
            return {
              id: Date.now() + index,
              name: `Cor ${index + 1}`,
              color,
              questions,
            };
          }
        );
        setColorGroups(loadedColorGroups);
      }
      setIsLoading(false);
    };

    if (quizId) {
      fetchQuizData(quizId);
    } else if (templateId) {
      fetchTemplateData(templateId);
    } else {
      setIsLoading(false);
      setIsQuizLoaded(false);
      setTitle("");
      setColorGroups([
        {
          id: Date.now(),
          name: "Cor 1",
          color: "#FFC107",
          // Começa com apenas uma pergunta
          questions: [{ id: 1, text: "", answer: "" }],
        },
      ]);
    }
  }, [searchParams, supabase, checkForDuplicates]);

  useEffect(() => {
    setGridState(Array(gridSize * gridSize).fill(""));
  }, [gridSize]);

  const handleGridSizeChange = (newSize: number) => {
    if (!isQuizLoaded) {
      setGridSize(newSize);
    }
  };
  const handleGridChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    const newGridState = [...gridState];
    newGridState[index] = numericValue;
    setGridState(newGridState);
  };
  const handleClearGrid = () => {
    if (window.confirm("Tem certeza?")) {
      setGridState(Array(gridSize * gridSize).fill(""));
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Gerador de Atividades "Pinte por Número"
        </h1>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr] xl:grid-cols-[380px_1fr_320px] gap-6 items-start">
        <div>
          <ControlPanel
            title={title}
            setTitle={setTitle}
            colorGroups={colorGroups}
            setColorGroups={setColorGroups}
            duplicateAnswers={duplicateAnswers}
          />
          <div className="bg-white p-5 rounded-lg shadow-md h-fit mt-6 border border-gray-200">
            <GridSizeSelector
              selectedSize={gridSize}
              onChange={handleGridSizeChange}
              disabled={isQuizLoaded}
            />
            {isQuizLoaded && (
              <p className="text-xs text-gray-500">
                O tamanho da grade não pode ser alterado num questionário salvo.
              </p>
            )}
          </div>
        </div>
        <div className="self-start">
          <InteractiveGrid
            gridState={gridState}
            gridSize={gridSize}
            onCellChange={handleGridChange}
          />
        </div>
        <ActionsPanel
          onClearGrid={handleClearGrid}
          activityTitle={title}
          colorGroups={colorGroups}
          gridState={gridState}
          gridSize={gridSize}
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
