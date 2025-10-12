// src/app/admin/templates/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/AuthProvider";
import Spinner from "@/components/Spinner";

interface Template {
  id: string;
  title: string;
  created_at: string;
}

export default function AdminTemplatesPage() {
  const { supabase, profile } = useSupabase();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && profile.role !== "admin") {
      router.push("/");
    }
  }, [profile, router]);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("templates")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });

    if (data) setTemplates(data);
    if (error) console.error("Erro ao buscar templates:", error);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (profile?.role === "admin") {
      fetchTemplates();
    }
  }, [profile, fetchTemplates]);

  const handleDeleteTemplate = async (templateId: string) => {
    if (
      window.confirm(
        "Tem certeza que deseja apagar este template? As atividades de usuários baseadas nele não serão afetadas, mas o template será removido permanentemente."
      )
    ) {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", templateId);
      if (!error) {
        setTemplates(templates.filter((t) => t.id !== templateId));
      } else {
        alert(`Erro ao apagar o template: ${error.message}`);
      }
    }
  };

  if (loading || !profile || profile.role !== "admin") {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerir Templates</h1>
        <Link
          href="/admin/templates/editor/new"
          className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          + Criar Novo Template
        </Link>
      </div>

      {templates.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <ul>
            {templates.map((template) => (
              <li
                key={template.id}
                className="border-b last:border-b-0 py-4 flex justify-between items-center flex-wrap gap-4"
              >
                <div>
                  <h2 className="font-bold text-lg text-gray-900">
                    {template.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Criado em:{" "}
                    {new Date(template.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/admin/templates/editor/${template.id}`}
                    className="text-blue-600 font-semibold hover:underline px-2"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Apagar Template"
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
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          Nenhum template encontrado. Clique em &quot;Criar Novo Template&quot;
          para começar.
        </p>
      )}
    </div>
  );
}
