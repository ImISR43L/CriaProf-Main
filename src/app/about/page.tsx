// src/app/about/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSupabase } from "@/components/AuthProvider";
import Spinner from "@/components/Spinner";

export default function AboutPage() {
  const [motivation, setMotivation] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { profile } = useSupabase();

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("site_content")
        .select("content_value")
        .eq("page_key", "about_motivation")
        .single();
      if (data) {
        setMotivation(data.content_value);
      }
      setLoading(false);
    };
    fetchContent();
  }, [supabase]);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold text-gray-900">Sobre o Projeto</h1>
        {profile?.role === "admin" && (
          <Link
            href="/admin/content"
            className="text-sm text-blue-600 hover:underline"
          >
            Editar Página
          </Link>
        )}
      </div>
      <p className="text-lg text-gray-700 mb-6">
        Bem-vindo ao Gerador de Atividades &quot;Pinte por Número&quot;! Esta
        ferramenta foi criada com o objetivo de fornecer aos educadores um
        recurso simples, gratuito e poderoso para criar atividades
        personalizadas e envolventes para seus alunos.
      </p>

      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-3 text-gray-900">
          Minha Motivação
        </h2>
        {loading ? (
          <Spinner />
        ) : (
          <p className="text-gray-600 mb-6">{motivation}</p>
        )}

        <h2 className="text-2xl font-bold mb-3 text-gray-900">
          Tecnologias Utilizadas
        </h2>
        <ul className="list-disc list-inside text-gray-600 mb-6">
          <li>
            <strong>Frontend:</strong> Next.js e React
          </li>
          <li>
            <strong>Estilização:</strong> Tailwind CSS
          </li>
          <li>
            <strong>Backend e Banco de Dados:</strong> Supabase
          </li>
          <li>
            <strong>Linguagem:</strong> TypeScript
          </li>
        </ul>
      </div>

      <div className="text-center mt-10">
        <Link
          href="/"
          className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          Voltar para o Gerador
        </Link>
      </div>
    </div>
  );
}
