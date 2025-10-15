// src/app/community/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/components/Spinner";
import { generatePdf } from "@/lib/pdfGenerator";
import type { Question } from "@/lib/types";
import type { SchoolColor } from "@/lib/colors";

// Tipo auxiliar para lidar com a ambiguidade do Supabase
type RelatedName = { name: string } | { full_name: string };

type FetchedOption = {
  id: number;
  text: string;
  answer: string;
  color: string;
};

type FetchedQuestion = {
  id: number;
  text: string;
  type: "single" | "multiple";
  correct_option_id: number;
  answer_options: FetchedOption[];
};

// Interface flexível que aceita objeto, array ou nulo
interface PublicQuiz {
  id: string;
  title: string;
  created_at: string;
  profiles: RelatedName | RelatedName[] | null;
  template_categories: RelatedName | RelatedName[] | null;
}
interface Category {
  id: string;
  name: string;
}

export default function CommunityPage() {
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGridSize, setSelectedGridSize] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const supabase = createClient();

  useEffect(() => {
    const fetchFiltersAndQuizzes = async () => {
      setLoading(true);

      if (categories.length === 0) {
        const { data: categoriesData } = await supabase
          .from("template_categories")
          .select("id, name")
          .order("order_index");
        if (categoriesData) setCategories(categoriesData);
      }

      let query = supabase
        .from("quizzes")
        .select(
          `
          id,
          title,
          created_at,
          profiles ( full_name ),
          template_categories ( name )
        `
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }
      if (selectedGridSize !== "all") {
        query = query.eq("grid_size", parseInt(selectedGridSize));
      }
      if (selectedCategoryId !== "all") {
        query = query.eq("category_id", selectedCategoryId);
      }

      const { data, error } = await query;
      if (data) {
        setQuizzes(data as PublicQuiz[]);
      } else if (error) {
        console.error("Erro ao buscar quizzes públicos:", error);
      }
      setLoading(false);
    };

    const searchDebounce = setTimeout(() => {
      fetchFiltersAndQuizzes();
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [
    supabase,
    searchTerm,
    selectedGridSize,
    selectedCategoryId,
    categories.length,
  ]);

  const handleGeneratePdf = async (quizId: string, title: string) => {
    setGeneratingPdfId(quizId);
    try {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("grid_data, grid_size, questions(*, answer_options(*))")
        .eq("id", quizId)
        .single();

      if (quizError || !quizData) {
        throw new Error("Quiz não encontrado ou erro ao buscar dados.");
      }

      const fetchedQuestions: FetchedQuestion[] = quizData.questions || [];
      const questionsForPdf: Question[] = fetchedQuestions.map(
        (q: FetchedQuestion) => {
          const optionsData = q.answer_options || [];
          const options = optionsData.map((opt: FetchedOption) => ({
            id: opt.id,
            text: opt.text,
            answer: opt.answer,
          }));

          let color: SchoolColor | undefined;
          let optionColors: Record<number, SchoolColor> | undefined;

          if (q.type === "single") {
            try {
              color = optionsData[0]
                ? JSON.parse(optionsData[0].color)
                : undefined;
            } catch {
              color = undefined; // Garante que não quebre se o JSON for inválido
            }
          } else {
            optionColors = {};
            optionsData.forEach((opt: FetchedOption) => {
              try {
                optionColors![opt.id] = JSON.parse(opt.color);
              } catch {
                // Ignora cores com formato inválido em vez de quebrar a aplicação
              }
            });
          }

          return {
            id: q.id,
            text: q.text,
            type: q.type,
            options,
            correctOptionId: q.correct_option_id,
            color,
            optionColors,
          };
        }
      );

      generatePdf(
        title,
        questionsForPdf,
        quizData.grid_data || [],
        quizData.grid_size
      );
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Não foi possível gerar o PDF. Tente novamente mais tarde.");
    } finally {
      setGeneratingPdfId(null);
    }
  };

  // Funções auxiliares para extrair o nome de forma segura
  const getCategoryName = (
    cat: RelatedName | RelatedName[] | null
  ): string | undefined => {
    if (!cat) return undefined;
    const item = Array.isArray(cat) ? cat[0] : cat;
    return (item as { name: string }).name;
  };

  const getAuthorName = (
    prof: RelatedName | RelatedName[] | null
  ): string | undefined => {
    if (!prof) return undefined;
    const item = Array.isArray(prof) ? prof[0] : prof;
    return (item as { full_name: string }).full_name;
  };

  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Galeria da Comunidade
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Explore atividades criadas por outros professores!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm border">
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700"
          >
            Pesquisar por Título
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o título..."
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="gridSize"
            className="block text-sm font-medium text-gray-700"
          >
            Tamanho da Grade
          </label>
          <select
            id="gridSize"
            value={selectedGridSize}
            onChange={(e) => setSelectedGridSize(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">Todos</option>
            <option value="10">10x10</option>
            <option value="15">15x15</option>
            <option value="20">20x20</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Categoria
          </label>
          <select
            id="category"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white border border-gray-200 rounded-lg shadow-md p-6 flex flex-col transition-transform hover:scale-105"
            >
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full self-start mb-2">
                {getCategoryName(quiz.template_categories) || "Sem Categoria"}
              </span>
              <h2 className="font-bold text-xl text-gray-900 mb-2">
                {quiz.title}
              </h2>
              <p className="text-sm text-gray-500 flex-grow mb-4">
                Criado por: {getAuthorName(quiz.profiles) || "Anônimo"}
              </p>
              <div className="mt-auto space-y-2">
                <Link
                  href={`/?quiz_id=${quiz.id}`}
                  className="block text-center w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                >
                  Ver e Usar
                </Link>
                <button
                  onClick={() => handleGeneratePdf(quiz.id, quiz.title)}
                  disabled={generatingPdfId === quiz.id}
                  className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-400"
                >
                  {generatingPdfId === quiz.id ? "A gerar..." : "Gerar PDF"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          Nenhum questionário encontrado com os filtros selecionados.
        </p>
      )}
    </div>
  );
}
