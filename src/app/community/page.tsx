"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/components/Spinner";

// --- INTERFACE ATUALIZADA ---
// A estrutura agora é "plana", correspondendo ao retorno da nossa função SQL.
interface PublicQuiz {
  id: string;
  title: string;
  created_at: string;
  author_name: string | null;
}

export default function CommunityPage() {
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPublicQuizzes = async () => {
      setLoading(true);

      // --- CHAMADA À API MODIFICADA ---
      // Em vez de .from('quizzes').select(...), chamamos nossa função RPC.
      const { data, error } = await supabase.rpc("get_public_quizzes");

      if (data) {
        setQuizzes(data as PublicQuiz[]);
      } else {
        if (error) {
          console.error("Erro ao buscar quizzes públicos via RPC:", error);
        }
      }
      setLoading(false);
    };

    fetchPublicQuizzes();
  }, [supabase]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">Galeria da Comunidade</h1>
        <p className="text-lg text-gray-600 mt-2">
          Explore atividades criadas por outros professores!
        </p>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white border rounded-lg shadow-md p-6 flex flex-col"
            >
              <h2 className="font-bold text-xl mb-2">{quiz.title}</h2>
              <p className="text-sm text-gray-500 mb-4">
                {/* --- JSX ATUALIZADO --- */}
                {/* Usamos a nova propriedade 'author_name' */}
                Criado por: {quiz.author_name || "Anônimo"}
              </p>
              <Link
                href={`/?quiz_id=${quiz.id}`}
                className="mt-auto text-center w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
              >
                Ver e Usar Questionário
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          Ainda não há questionários públicos. Seja o primeiro a compartilhar o
          seu!
        </p>
      )}
    </div>
  );
}
