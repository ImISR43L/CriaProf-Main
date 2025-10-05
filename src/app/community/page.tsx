"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/components/Spinner";

// --- ALTERAÇÃO NA INTERFACE ---
// A propriedade 'profiles' agora é um array de objetos, para corresponder ao retorno do Supabase.
interface PublicQuiz {
  id: string;
  title: string;
  created_at: string;
  profiles:
    | {
        full_name: string | null;
      }[]
    | null; // <-- A alteração está aqui: []
}

export default function CommunityPage() {
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPublicQuizzes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title, created_at, profiles(full_name)")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (data) {
        setQuizzes(data as PublicQuiz[]);
      } else {
        // Se houver um erro, podemos logá-lo para depuração
        if (error) {
          console.error("Erro ao buscar quizzes públicos:", error);
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
                {/* --- ALTERAÇÃO NO JSX --- */}
                {/* Acessamos o primeiro item ([0]) do array de perfis */}
                Criado por: {quiz.profiles?.[0]?.full_name || "Anônimo"}
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
