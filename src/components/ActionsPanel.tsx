// src/components/ActionsPanel.tsx
"use client";

import React, { useState } from "react";
import type { Question } from "@/lib/types";
import { generatePdf } from "@/lib/pdfGenerator";
import { useSupabase } from "@/components/AuthProvider";

interface ActionsPanelProps {
  onClearGrid: () => void;
  activityTitle: string;
  questions: Question[];
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
  questions,
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
      alert("Por favor, selecione uma categoria antes de salvar.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    let currentQuizId = quizId;

    // 1. Salva ou atualiza o quiz principal
    if (currentQuizId && isOwner) {
      const { error: quizError } = await supabase
        .from("quizzes")
        .update({
          title: activityTitle,
          grid_data: gridState,
          category_id: categoryId,
        })
        .eq("id", currentQuizId);
      if (quizError) {
        setMessage(`Erro ao atualizar quiz: ${quizError.message}`);
        setIsSaving(false);
        return;
      }
    } else {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          title: activityTitle,
          grid_data: gridState,
          grid_size: gridSize,
          user_id: user.id,
          category_id: categoryId,
        })
        .select()
        .single();
      if (quizError || !quizData) {
        setMessage(`Erro ao criar quiz: ${quizError?.message}`);
        setIsSaving(false);
        return;
      }
      currentQuizId = quizData.id;
    }

    // 2. Apaga as perguntas e opções antigas para sincronizar
    await supabase.from("questions").delete().eq("quiz_id", currentQuizId);

    // 3. Insere as novas perguntas e opções
    for (const question of questions) {
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert({
          quiz_id: currentQuizId,
          text: question.text,
          type: question.type,
          correct_option_id: question.correctOptionId,
        })
        .select()
        .single();

      if (questionError || !questionData) {
        setMessage(`Erro ao salvar pergunta: ${questionError?.message}`);
        continue; // Pula para a próxima pergunta
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
        await supabase.from("answer_options").insert(optionsToInsert);
      }
    }

    setMessage("Questionário salvo com sucesso!");
    setIsSaving(false);
    if (!quizId && currentQuizId) {
      onNewQuizSaved(currentQuizId);
    }
    setTimeout(() => setMessage(""), 3000);
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
