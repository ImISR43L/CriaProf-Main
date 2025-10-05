// src/app/news/page.tsx
import React from "react";
import Link from "next/link";

export default function NewsPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">Notícias e Atualizações</h1>
        <p className="text-lg text-gray-600 mt-2">
          Fique por dentro de tudo o que acontece no projeto!
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
        {/* Exemplo de Post de Notícia */}
        <div className="border-b pb-6">
          <h2 className="text-2xl font-bold mb-2">
            Lançamento da Galeria da Comunidade!
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Publicado em: 05 de Outubro de 2025
          </p>
          <p className="text-gray-700">
            É com grande entusiasmo que anunciamos o lançamento da Galeria da
            Comunidade! Agora, os professores podem partilhar as suas atividades
            com outros educadores, criando um grande repositório colaborativo de
            conhecimento. Explore a página da{" "}
            <Link href="/community" className="text-blue-600 hover:underline">
              Comunidade
            </Link>{" "}
            hoje mesmo!
          </p>
        </div>

        {/* Outro Exemplo de Post */}
        <div className="border-b pb-6">
          <h2 className="text-2xl font-bold mb-2">
            Novos Tamanhos de Grade Disponíveis
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Publicado em: 04 de Outubro de 2025
          </p>
          <p className="text-gray-700">
            A pedido da comunidade, adicionámos a opção de criar atividades com
            diferentes tamanhos de grade. Agora pode escolher entre 10x10, 15x15
            e 20x20 para adaptar as atividades a diferentes faixas etárias e
            complexidades.
          </p>
        </div>

        {/* Adicione mais posts aqui no futuro */}
      </div>
    </div>
  );
}
