// src/app/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // 1. Importar o componente Image
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/components/Spinner";

interface TemplateCategory {
  id: string;
  name: string;
}

// CORREÇÃO FINAL: A interface agora espera que template_categories seja um array de objetos ou nulo.
interface Template {
  id: string;
  title: string;
  description: string;
  grid_size: number;
  template_categories: { name: string } | { name: string }[] | null;
}

export default function HomePage() {
  // Renomeado de TemplatesPage
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGridSize, setSelectedGridSize] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const supabase = createClient();
  const getCategoryName = (
    cat: { name: string } | { name: string }[] | null
  ): string | undefined => {
    if (!cat) return undefined;
    const item = Array.isArray(cat) ? cat[0] : cat;
    return item?.name;
  };

  useEffect(() => {
    const fetchFiltersAndTemplates = async () => {
      setLoading(true);

      const { data: categoriesData } = await supabase
        .from("template_categories")
        .select("id, name")
        .order("order_index");
      if (categoriesData) setCategories(categoriesData);

      let query = supabase
        .from("templates")
        .select("id, title, description, grid_size, template_categories(name)")
        .order("created_at", { ascending: false });

      if (selectedGridSize !== "all") {
        query = query.eq("grid_size", parseInt(selectedGridSize));
      }

      if (selectedCategoryId !== "all") {
        query = query.eq("category_id", selectedCategoryId);
      }

      const { data, error } = await query;
      if (data) setTemplates(data as Template[]);
      if (error) console.error("Erro ao buscar templates:", error);

      setLoading(false);
    };
    fetchFiltersAndTemplates();
  }, [supabase, selectedGridSize, selectedCategoryId]);

  if (loading) return <Spinner />;

  return (
    <>
      <div className="w-full relative h-100 overflow-hidden">
        {/* Altura ajustável (ex: h-56 = 224px) */}
        <Image
          src="/Criaprof Banner.jpeg"
          alt="CriaProf Banner"
          fill
          objectFit="cover" // Preenche o espaço sem distorcer
          objectPosition="center" // Centraliza a imagem
          priority
        />
      </div>
      <div className="container mx-auto p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Galeria de Templates
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            Escolha um modelo abaixo para começar rapidamente!
            <br className="sm:hidden" /> ou crie a sua própria atividade.
          </p>
          <Link
            href="/create"
            className="mt-4 inline-block py-2 px-6 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700 transition-colors"
          >
            Criar Atividade em Branco
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm border">
          <div className="w-full sm:w-auto">
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
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
            >
              <option value="all">Todos</option>
              <option value="10">10x10</option>
              <option value="15">15x15</option>
              <option value="20">20x20</option>
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Disciplina
            </label>
            <select
              id="category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
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

        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white border border-gray-200 rounded-lg shadow-md p-6 flex flex-col transition-transform hover:scale-105"
              >
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full self-start mb-2">
                  {getCategoryName(template.template_categories) ||
                    "Sem Categoria"}
                </span>
                <h2 className="font-bold text-xl text-gray-900 mb-2">
                  {template.title}
                </h2>
                <p className="text-gray-600 flex-grow mb-4 text-sm">
                  {template.description}
                </p>
                <Link
                  href={`/create?template_id=${template.id}`} // Link atualizado
                  className="mt-auto text-center w-full py-2 px-4 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Usar este Template
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Nenhum template encontrado com os filtros selecionados.
          </p>
        )}
      </div>
    </>
  );
}
