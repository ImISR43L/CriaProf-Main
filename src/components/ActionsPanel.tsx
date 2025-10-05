"use client";

import React, { useState } from "react";
import { ColorGroup } from "@/app/page";
import { generatePdf } from "@/lib/pdfGenerator";
import { useSupabase } from "@/components/AuthProvider";

interface ActionsPanelProps {
  onClearGrid: () => void;
  activityTitle: string;
  colorGroups: ColorGroup[];
  gridState: string[];
}

const ActionsPanel = ({
  onClearGrid,
  activityTitle,
  colorGroups,
  gridState,
}: ActionsPanelProps) => {
  const { supabase, user } = useSupabase();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleGeneratePdf = () => {
    generatePdf(activityTitle, colorGroups, gridState);
  };

  const handleSaveQuiz = async () => {
    if (!user) {
      alert("Você precisa estar logado para salvar um questionário.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    // 1. Inserir na tabela 'quizzes'
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        title: activityTitle,
        grid_data: gridState,
        user_id: user.id,
      })
      .select()
      .single();

    if (quizError) {
      setMessage(`Erro ao salvar: ${quizError.message}`);
      setIsSaving(false);
      return;
    }

    // 2. Preparar e inserir as perguntas na tabela 'questions'
    const questionsToInsert = colorGroups.flatMap((group) =>
      group.questions
        .filter((q) => q.text && q.answer) // Salva apenas perguntas preenchidas
        .map((q) => ({
          quiz_id: quizData.id,
          color: group.color,
          question_text: q.text,
          answer: q.answer,
        }))
    );

    if (questionsToInsert.length > 0) {
      const { error: questionsError } = await supabase
        .from("questions")
        .insert(questionsToInsert);

      if (questionsError) {
        setMessage(`Erro ao salvar perguntas: ${questionsError.message}`);
        setIsSaving(false);
        return; // Idealmente, aqui você deletaria o quiz criado para evitar inconsistência
      }
    }

    setMessage("Questionário salvo com sucesso!");
    setIsSaving(false);
    setTimeout(() => setMessage(""), 3000); // Limpa a mensagem após 3s
  };

  return (
    <aside className="bg-white p-5 rounded-lg shadow-md h-fit">
      <h2 className="text-xl font-bold mb-4">Ações</h2>
      <div className="space-y-3">
        {user && (
          <button
            onClick={handleSaveQuiz}
            disabled={isSaving}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {isSaving ? "Salvando..." : "Salvar Questionário"}
          </button>
        )}
        <button
          onClick={handleGeneratePdf}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition-colors"
        >
          Gerar PDF
        </button>
        <button
          onClick={onClearGrid}
          className="w-full bg-gray-500 text-white font-bold py-3 rounded-md hover:bg-gray-600 transition-colors"
        >
          Limpar Grade
        </button>
        {message && (
          <p className="text-sm text-center text-green-600">{message}</p>
        )}
      </div>
    </aside>
  );
};

export default ActionsPanel;
