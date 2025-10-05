"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/components/Spinner";

interface Template {
  id: string;
  title: string;
  description: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("templates")
        .select("id, title, description")
        .order("created_at", { ascending: false });
      if (data) setTemplates(data);
      setLoading(false);
    };
    fetchTemplates();
  }, [supabase]);

  if (loading) return <Spinner />;

  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Galeria de Templates
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Escolha um modelo abaixo para começar rapidamente!
        </p>
      </div>

      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 flex flex-col"
            >
              <h2 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">
                {template.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 flex-grow mb-4">
                {template.description}
              </p>
              <Link
                href={`/?template_id=${template.id}`}
                className="mt-auto text-center w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
              >
                Usar este Template
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
          Nenhum template encontrado.
        </p>
      )}
    </div>
  );
}
