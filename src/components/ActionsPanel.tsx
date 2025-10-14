// src/components/ActionsPanel.tsx
"use client";

import React, { useState } from "react";
import type { Question } from "@/lib/types";
import { generatePdf } from "@/lib/pdfGenerator";
import { useSupabase } from "@/components/AuthProvider";

interface ActionsPanelProps {
  onClearGrid: () => void;
  activityTitle: string;
  questions: Question[]; // Alterado de colorGroups para questions
  gridState: string[];
  gridSize: number;
  quizId: string | null;
  onNewQuizSaved: (quizId: string) => void;
  isOwner: boolean;
  categoryId: string | undefined;
}

const ActionsPanel = ({
  onClearGrid,
  activityTitle,
  questions, // Usa a nova prop
  gridState,
  gridSize,
  quizId,
  onNewQuizSaved,
  isOwner,
  categoryId,
}: ActionsPanelProps) => {
  const { supabase, user } = useSupabase();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleGeneratePdf = () => {
    if (!activityTitle || activityTitle.trim() === "") {
      alert("Por favor, adicione um título à atividade antes de gerar o PDF.");
      return;
    }
    // A função generatePdf também precisará ser refatorada,
    // mas por agora, a chamada é atualizada.
    generatePdf(activityTitle, questions, gridState, gridSize);
  };

  const handleSaveQuiz = async () => {
    if (!user) {
      alert("Você precisa estar logado para salvar um questionário.");
      return;
    }
    if (!activityTitle || activityTitle.trim() === "") {
      alert("Por favor, adicione um título à atividade antes de salvar.");
      return;
    }
    if (!categoryId) {
      alert(
        "Por favor, selecione uma categoria antes de salvar o questionário."
      );
      return;
    }

    setIsSaving(true);
    setMessage("");

    // A lógica para salvar as perguntas precisará ser migrada no backend
    // para a nova estrutura de tabelas (questions e answer_options).
    // O código abaixo é uma representação conceitual de como os dados seriam preparados.

    console.log("Dados a serem salvos:", {
      title: activityTitle,
      grid_data: gridState,
      grid_size: gridSize,
      category_id: categoryId,
      questions: questions,
    });

    // Lógica de salvar (precisará de adaptação no futuro quando o DB for migrado)
    setMessage(
      "Funcionalidade de salvar em desenvolvimento para a nova estrutura."
    );
    setTimeout(() => {
      setIsSaving(false);
      setMessage("");
    }, 3000);
  };

  return (
    <aside className="bg-white p-5 rounded-lg shadow-md h-fit border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Ações</h2>
      <div className="space-y-3">
        <button
          onClick={handleGeneratePdf}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition-colors"
        >
          Gerar PDF
        </button>

        {user && isOwner && (
          <>
            <button
              onClick={handleSaveQuiz}
              disabled={isSaving}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSaving
                ? "A Salvar..."
                : quizId
                ? "Salvar Alterações"
                : "Salvar Questionário"}
            </button>
            <button
              onClick={onClearGrid}
              className="w-full bg-gray-500 text-white font-bold py-3 rounded-md hover:bg-gray-600 transition-colors"
            >
              Limpar Grade
            </button>
          </>
        )}

        {message && (
          <p className="text-sm text-center text-green-600 mt-2">{message}</p>
        )}
      </div>
    </aside>
  );
};

export default ActionsPanel;
