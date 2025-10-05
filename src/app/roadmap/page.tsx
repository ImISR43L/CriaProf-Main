// src/app/roadmap/page.tsx
import React from "react";

const Feature = ({
  title,
  status,
}: {
  title: string;
  status: "Concluído" | "Em Progresso" | "Planejado";
}) => {
  const statusStyles = {
    Concluído: "bg-green-100 text-green-800",
    "Em Progresso": "bg-blue-100 text-blue-800",
    Planejado: "bg-yellow-100 text-yellow-800",
  };

  return (
    <li className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
      <span className="text-gray-800">{title}</span>
      <span
        className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[status]}`}
      >
        {status}
      </span>
    </li>
  );
};

export default function RoadmapPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">Programação do Projeto</h1>
        <p className="text-lg text-gray-600 mt-2">
          Veja o que já foi feito e o que está Planejado para o futuro da
          plataforma.
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 border-b pb-3">
          Funcionalidades
        </h2>
        <ul className="space-y-4">
          <Feature
            title="Gerador de Atividades com Exportação para PDF"
            status="Concluído"
          />
          <Feature
            title="Sistema de Contas de Utilizador (Login e Cadastro)"
            status="Concluído"
          />
          <Feature
            title="Salvar e Carregar Questionários na Nuvem"
            status="Concluído"
          />
          <Feature
            title="Suporte para Respostas de Texto (Pinte por Referência)"
            status="Concluído"
          />
          <Feature
            title="Tamanhos de Grade Variáveis (10x10, 15x15, 20x20)"
            status="Concluído"
          />
          <Feature title="Cores Ilimitadas por Atividade" status="Concluído" />
          <Feature
            title="Galeria de Templates Pré-Prontos"
            status="Concluído"
          />
          <Feature
            title="Galeria da Comunidade com Partilha de Quizzes"
            status="Concluído"
          />
          <Feature
            title="Página de Perfil para Atualização de Nome"
            status="Concluído"
          />
          <Feature
            title="Implementação de Melhorias Visuais (UX)"
            status="Em Progresso"
          />
          <Feature title="Suporte para Múltiplos Idiomas" status="Planejado" />
        </ul>
      </div>
    </div>
  );
}
