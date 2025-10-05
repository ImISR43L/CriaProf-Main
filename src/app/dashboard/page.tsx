"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSupabase } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

interface Quiz {
  id: string;
  title: string;
  created_at: string;
}

export default function DashboardPage() {
  const { supabase, user } = useSupabase();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // Se não houver usuário após um breve momento, redirecione para o login
      const timer = setTimeout(() => {
        if (!user) router.push("/login");
      }, 100);
      return () => clearTimeout(timer);
    }

    const fetchQuizzes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setQuizzes(data);
      }
      setLoading(false);
    };

    fetchQuizzes();
  }, [user, supabase, router]);

  if (loading) {
    return <div className="text-center p-10">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meus Questionários</h1>
        <Link
          href="/"
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Criar Novo
        </Link>
      </div>

      {quizzes.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ul>
            {quizzes.map((quiz) => (
              <li
                key={quiz.id}
                className="flex justify-between items-center border-b last:border-b-0 py-3"
              >
                <div>
                  <h2 className="font-bold text-lg">{quiz.title}</h2>
                  <p className="text-sm text-gray-500">
                    Criado em:{" "}
                    {new Date(quiz.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Link
                  href={`/?quiz_id=${quiz.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Abrir
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          Você ainda não salvou nenhum questionário.
        </p>
      )}
    </div>
  );
}
