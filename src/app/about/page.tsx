// src/app/about/page.tsx
import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">Sobre o Projeto</h1>
      <p className="text-lg text-gray-700 mb-6">
        Bem-vindo ao Gerador de Atividades "Pinte por Número"! Esta ferramenta
        foi criada com o objetivo de fornecer aos educadores um recurso simples,
        gratuito e poderoso para criar atividades personalizadas e envolventes
        para seus alunos.
      </p>

      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-3 text-gray-900">
          Minha Motivação
        </h2>
        <p className="text-gray-600 mb-6">
          [**Aqui você pode escrever sobre você e por que decidiu criar este
          projeto.** Fale sobre sua paixão por educação, programação, ou a
          necessidade que você identificou que o levou a desenvolver esta
          ferramenta.]
        </p>

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
