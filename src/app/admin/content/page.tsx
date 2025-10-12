// src/app/admin/content/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/AuthProvider";
import Spinner from "@/components/Spinner";

type Content = {
  page_key: string;
  content_value: string;
};

export default function AdminContentPage() {
  const { supabase, profile } = useSupabase();
  const router = useRouter();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Proteção da página: Apenas administradores podem aceder
  useEffect(() => {
    if (profile === null) {
      router.push("/");
    } else if (profile?.role !== "admin") {
      router.push("/");
    }
  }, [profile, router]);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_content").select("*");
    if (data) {
      setContent(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleContentChange = (key: string, value: string) => {
    setContent((prevContent) =>
      prevContent.map((item) =>
        item.page_key === key ? { ...item, content_value: value } : item
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("site_content").upsert(content);

    if (error) {
      setMessage(`Erro ao salvar: ${error.message}`);
    } else {
      setMessage("Conteúdo salvo com sucesso!");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const getLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      about_motivation: "Motivação (Página Sobre)",
      contact_email: "Email (Página de Contato)",
      contact_linkedin: "LinkedIn (Página de Contato)",
    };
    return labels[key] || key;
  };

  if (loading || !profile || profile.role !== "admin") {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Gerir Conteúdo do Site</h1>
      <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
        {content.map(({ page_key, content_value }) => (
          <div key={page_key}>
            <label
              htmlFor={page_key}
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              {getLabel(page_key)}
            </label>
            <textarea
              id={page_key}
              value={content_value}
              onChange={(e) => handleContentChange(page_key, e.target.value)}
              rows={page_key === "about_motivation" ? 8 : 1}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {saving ? "A salvar..." : "Salvar Alterações"}
          </button>
          {message && <p className="text-sm text-green-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}
