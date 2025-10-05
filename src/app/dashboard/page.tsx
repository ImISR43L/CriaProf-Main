// src/app/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSupabase } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

interface Quiz {
  id: string;
  title: string;
  created_at: string;
  is_public: boolean;
}

export default function DashboardPage() {
  const { supabase, user } = useSupabase();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
      return;
    }

    const fetchQuizzes = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title, created_at, is_public")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setQuizzes(data);
      setLoading(false);
    };

    fetchQuizzes();
  }, [user, supabase, router]);

  const toggleShareQuiz = async (quizId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const { data } = await supabase
      .from("quizzes")
      .update({ is_public: newStatus })
      .eq("id", quizId)
      .select()
      .single();

    if (data) {
      setQuizzes(
        quizzes.map((q) =>
          q.id === quizId ? { ...q, is_public: newStatus } : q
        )
      );
    }
  };

  const getShareLink = (quizId: string) =>
    `${window.location.origin}/?quiz_id=${quizId}`;

  const handleDeleteQuiz = async (quizId: string) => {
    if (
      window.confirm(
        "Tem certeza que deseja apagar este questionário? Esta ação é irreversível."
      )
    ) {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);
      if (!error) setQuizzes(quizzes.filter((q) => q.id !== quizId));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Meus Questionários</h1>
        <Link
          href="/"
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Criar Novo
        </Link>
      </div>

      {quizzes.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <ul>
            {quizzes.map((quiz) => (
              <li key={quiz.id} className="border-b last:border-b-0 py-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">
                      {quiz.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Criado em:{" "}
                      {new Date(quiz.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Link
                      href={`/?quiz_id=${quiz.id}`}
                      className="text-blue-600 font-semibold hover:underline px-2"
                    >
                      Abrir
                    </Link>
                    <button
                      onClick={() => toggleShareQuiz(quiz.id, quiz.is_public)}
                      className={`py-2 px-4 text-sm rounded-md transition-colors ${
                        quiz.is_public
                          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {quiz.is_public ? "Tornar Privado" : "Publicar"}
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Apagar Questionário"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                {quiz.is_public && (
                  <div className="mt-3 bg-blue-50 p-3 rounded-md">
                    <label className="text-sm font-semibold text-blue-800">
                      Link Público:
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={getShareLink(quiz.id)}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).select();
                        navigator.clipboard.writeText(getShareLink(quiz.id));
                        alert("Link copiado para a área de transferência!");
                      }}
                      className="w-full p-1 mt-1 bg-white border border-blue-200 rounded text-sm cursor-pointer text-gray-700"
                    />
                  </div>
                )}
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
