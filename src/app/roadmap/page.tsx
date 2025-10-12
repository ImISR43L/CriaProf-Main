// src/app/roadmap/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSupabase } from "@/components/AuthProvider";
import Spinner from "@/components/Spinner";

interface RoadmapItem {
  id: string;
  title: string;
  status: "Concluído" | "Em Progresso" | "Planejado";
}

const Feature = ({
  title,
  status,
}: {
  title: string;
  status: RoadmapItem["status"];
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
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { profile } = useSupabase();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("roadmap_items")
        .select("*")
        .order("order_index", { ascending: true });

      if (data) setItems(data as RoadmapItem[]);
      if (error) console.error("Erro ao buscar roadmap:", error);
      setLoading(false);
    };
    fetchItems();
  }, [supabase]);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-4">
          <h1 className="text-4xl font-bold">Programação do Projeto</h1>
          {profile?.role === "admin" && (
            <Link
              href="/admin/roadmap"
              className="text-sm text-blue-600 hover:underline"
            >
              (Gerir)
            </Link>
          )}
        </div>
        <p className="text-lg text-gray-600 mt-2">
          Veja o que já foi feito e o que está Planejado para o futuro da
          plataforma.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 border-b pb-3">
            Funcionalidades
          </h2>
          {items.length > 0 ? (
            <ul className="space-y-4">
              {items.map((item) => (
                <Feature
                  key={item.id}
                  title={item.title}
                  status={item.status}
                />
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">
              Nenhum item no roadmap foi definido.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
