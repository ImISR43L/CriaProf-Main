// src/app/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ControlPanel from "@/components/ControlPanel";
import InteractiveGrid from "@/components/InteractiveGrid";
import ActionsPanel from "@/components/ActionsPanel";
import AuthButton from "@/components/AuthButton"; // Importe o novo botão
import { useSupabase } from "@/components/AuthProvider";

// --- Tipos ---
export interface Question {
  id: number;
  text: string;
  answer: string;
}

export interface ColorGroup {
  id: number;
  color: string;
  questions: Question[];
}

// --- Componente Principal ---
function HomePageContent() {
  const { supabase } = useSupabase();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("Revisão de Matemática");
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([
    {
      id: Date.now(),
      color: "#FFC107",
      questions: [
        { id: 1, text: "2 x 2", answer: "4" },
        { id: 2, text: "5 x 5", answer: "25" },
        { id: 3, text: "", answer: "" },
        { id: 4, text: "", answer: "" },
      ],
    },
    {
      id: Date.now() + 1,
      color: "#007BFF",
      questions: [
        { id: 1, text: "10 + 5", answer: "15" },
        { id: 2, text: "20 + 8", answer: "28" },
        { id: 3, text: "", answer: "" },
        { id: 4, text: "", answer: "" },
      ],
    },
  ]);
  const [gridState, setGridState] = useState<string[]>(Array(225).fill(""));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const quizId = searchParams.get("quiz_id");

    const fetchQuizData = async (id: string) => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("title, grid_data, questions ( color, question_text, answer )")
        .eq("id", id)
        .single();

      if (data) {
        setTitle(data.title);
        setGridState(data.grid_data || Array(225).fill(""));

        // Reorganiza as perguntas de volta para a estrutura de colorGroups
        const groups: { [key: string]: Question[] } = {};
        data.questions.forEach((q: any) => {
          if (!groups[q.color]) groups[q.color] = [];
          groups[q.color].push({
            id: groups[q.color].length + 1,
            text: q.question_text,
            answer: q.answer,
          });
        });

        const loadedColorGroups = Object.entries(groups).map(
          ([color, questions], index) => {
            while (questions.length < 4) {
              // Garante que sempre haja 4 campos
              questions.push({
                id: questions.length + 1,
                text: "",
                answer: "",
              });
            }
            return { id: Date.now() + index, color, questions };
          }
        );

        setColorGroups(loadedColorGroups);
      }
      setIsLoading(false);
    };

    if (quizId) {
      fetchQuizData(quizId);
    } else {
      // Estado inicial para um novo quiz
      setColorGroups([
        {
          id: Date.now(),
          color: "#FFC107",
          questions: Array(4)
            .fill(null)
            .map((_, i) => ({ id: i + 1, text: "", answer: "" })),
        },
      ]);
      setIsLoading(false);
    }
  }, [searchParams, supabase]);

  if (isLoading) {
    return <div className="text-center p-10">Carregando...</div>;
  }

  const handleGridChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 3);
    const newGridState = [...gridState];
    newGridState[index] = numericValue;
    setGridState(newGridState);
  };

  const handleClearGrid = () => {
    setGridState(Array(225).fill(""));
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Adicione o botão aqui */}
      <div className="flex justify-end mb-4">
        <AuthButton />
      </div>
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          Gerador de Atividades &quot;Pinte por Número&quot;
        </h1>
      </header>
      {/* --- LINHA CORRIGIDA ABAIXO --- */}
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr_300px] gap-6 items-start">
        <ControlPanel
          title={title}
          setTitle={setTitle}
          colorGroups={colorGroups}
          setColorGroups={setColorGroups}
        />
        <InteractiveGrid
          gridState={gridState}
          onCellChange={handleGridChange}
        />
        <ActionsPanel
          onClearGrid={handleClearGrid}
          activityTitle={title}
          colorGroups={colorGroups}
          gridState={gridState}
        />
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
