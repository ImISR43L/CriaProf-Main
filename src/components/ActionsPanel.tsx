// src/components/ActionsPanel.tsx
"use client";

import React, { useState } from "react";
import type { ColorGroup } from "@/lib/types";
import { generatePdf } from "@/lib/pdfGenerator";
import { useSupabase } from "@/components/AuthProvider";

interface ActionsPanelProps {
  onClearGrid: () => void;
  activityTitle: string;
  colorGroups: ColorGroup[];
  gridState: string[];
  gridSize: number;
  quizId: string | null;
  onNewQuizSaved: (quizId: string) => void;
  isOwner: boolean;
}

const ActionsPanel = ({
  onClearGrid,
  activityTitle,
  colorGroups,
  gridState,
  gridSize,
  quizId,
  onNewQuizSaved,
  isOwner,
}: ActionsPanelProps) => {
  const { supabase, user } = useSupabase();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleGeneratePdf = () => {
    generatePdf(activityTitle, colorGroups, gridState, gridSize);
  };

  const handleSaveQuiz = async () => {
    if (!user) {
      alert("Você precisa estar logado para salvar um questionário.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    const questionsToInsert = colorGroups.flatMap((group) =>
      group.questions
        .filter((q) => q.text && q.answer)
        .map((q) => ({
          quiz_id: quizId,
          color: JSON.stringify(group.color),
          question_text: q.text,
          answer: q.answer,
        }))
    );

    if (quizId) {
      // ATUALIZAR QUESTIONÁRIO EXISTENTE
      const { error: quizError } = await supabase
        .from("quizzes")
        .update({
          title: activityTitle,
          grid_data: gridState,
        })
        .eq("id", quizId);

      if (quizError) {
        setMessage(`Erro ao atualizar: ${quizError.message}`);
        setIsSaving(false);
        return;
      }

      await supabase.from("questions").delete().eq("quiz_id", quizId);

      if (questionsToInsert.length > 0) {
        const { error: questionsError } = await supabase
          .from("questions")
          .insert(questionsToInsert.map((q) => ({ ...q, quiz_id: quizId })));
        if (questionsError) {
          setMessage(`Erro ao salvar perguntas: ${questionsError.message}`);
          setIsSaving(false);
          return;
        }
      }
      setMessage("Questionário atualizado com sucesso!");
    } else {
      // CRIAR NOVO QUESTIONÁRIO
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          title: activityTitle,
          grid_data: gridState,
          grid_size: gridSize,
          user_id: user.id,
        })
        .select()
        .single();

      if (quizError) {
        setMessage(`Erro ao salvar: ${quizError.message}`);
        setIsSaving(false);
        return;
      }

      if (questionsToInsert.length > 0) {
        const { error: questionsError } = await supabase
          .from("questions")
          .insert(
            questionsToInsert.map((q) => ({ ...q, quiz_id: quizData.id }))
          );
        if (questionsError) {
          setMessage(`Erro ao salvar perguntas: ${questionsError.message}`);
          setIsSaving(false);
          return;
        }
      }
      setMessage("Questionário salvo com sucesso!");
      onNewQuizSaved(quizData.id);
    }

    setIsSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <aside className="bg-white p-5 rounded-lg shadow-md h-fit border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Ações</h2>
      <div className="space-y-3">
        {user && isOwner && (
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
        )}
        <button
          onClick={handleGeneratePdf}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition-colors"
        >
          Gerar PDF
        </button>
        {isOwner && (
          <button
            onClick={onClearGrid}
            className="w-full bg-gray-500 text-white font-bold py-3 rounded-md hover:bg-gray-600 transition-colors"
          >
            Limpar Grade
          </button>
        )}
        {message && (
          <p className="text-sm text-center text-green-600 mt-2">{message}</p>
        )}
      </div>
    </aside>
  );
};

export default ActionsPanel;
