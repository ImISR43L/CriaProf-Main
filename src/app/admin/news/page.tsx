"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/AuthProvider";
import Spinner from "@/components/Spinner";

interface Post {
  id: string;
  title: string;
  content: string;
  published_at: string;
}

export default function AdminNewsPage() {
  const { supabase, profile } = useSupabase();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);

  useEffect(() => {
    if (profile && profile.role !== "admin") {
      router.push("/");
    }
  }, [profile, router]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("news_posts")
      .select("*")
      .order("published_at", { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (profile?.role === "admin") {
      fetchPosts();
    }
  }, [profile, fetchPosts]);

  const handleSave = async () => {
    if (!editingPost) return;

    const postData = {
      title: editingPost.title,
      content: editingPost.content,
      published_at: editingPost.published_at || new Date().toISOString(),
    };

    const { error } = await supabase
      .from("news_posts")
      .upsert({ id: editingPost.id, ...postData });

    if (error) {
      alert(`Erro ao salvar: ${error.message}`);
    } else {
      setEditingPost(null);
      fetchPosts();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja apagar esta notícia?")) {
      await supabase.from("news_posts").delete().eq("id", id);
      fetchPosts();
    }
  };

  const handleAddNew = () => {
    setEditingPost({
      id: undefined,
      title: "",
      content: "",
      published_at: new Date().toISOString().slice(0, 10),
    });
  };

  if (loading || !profile || profile.role !== "admin") {
    return <Spinner />;
  }

  // FORMULÁRIO DE EDIÇÃO / CRIAÇÃO
  if (editingPost) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">
          {editingPost.id ? "Editar Notícia" : "Nova Notícia"}
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">
              Título
            </label>
            <input
              type="text"
              value={editingPost.title || ""}
              onChange={(e) =>
                setEditingPost({ ...editingPost, title: e.target.value })
              }
              className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">
              Conteúdo
            </label>
            <textarea
              value={editingPost.content || ""}
              onChange={(e) =>
                setEditingPost({ ...editingPost, content: e.target.value })
              }
              rows={10}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Salvar
            </button>
            <button
              onClick={() => setEditingPost(null)}
              className="py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LISTA DE NOTÍCIAS
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerir Notícias</h1>
        <button
          onClick={handleAddNew}
          className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          + Adicionar Notícia
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <ul>
          {posts.map((post) => (
            <li
              key={post.id}
              className="border-b last:border-b-0 py-4 flex justify-between items-center"
            >
              <div>
                <h2 className="font-bold text-lg">{post.title}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(post.published_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setEditingPost(post)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Apagar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
