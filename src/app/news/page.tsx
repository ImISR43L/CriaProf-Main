"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSupabase } from "@/components/AuthProvider";
import Spinner from "@/components/Spinner";

interface Post {
  id: string;
  title: string;
  published_at: string;
  content: string;
}

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { profile } = useSupabase();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .order("published_at", { ascending: false });

      if (data) setPosts(data);
      if (error) console.error("Erro ao buscar notícias:", error);
      setLoading(false);
    };
    fetchPosts();
  }, [supabase]);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-4">
          <h1 className="text-4xl font-bold">Notícias e Atualizações</h1>
          {profile?.role === "admin" && (
            <Link
              href="/admin/news"
              className="text-sm text-yellow-600 hover:underline"
            >
              (Gerir)
            </Link>
          )}
        </div>
        <p className="text-lg text-gray-600 mt-2">
          Fique por dentro de tudo o que acontece no projeto!
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="border-b last:border-b-0 pb-6">
                <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                <p className="text-sm text-gray-500 mb-3">
                  Publicado em:{" "}
                  {new Date(post.published_at).toLocaleDateString("pt-BR")}
                </p>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              Nenhuma notícia publicada ainda.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
