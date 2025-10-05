// src/app/account/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSupabase } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function AccountPage() {
  const { supabase, user } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // Se o usuário não estiver logado, redireciona para a página de login
      router.push("/login");
      return;
    }

    // Busca o nome atual do perfil do usuário
    const getProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (data) {
        setFullName(data.full_name || "");
      }
      setLoading(false);
    };

    getProfile();
  }, [user, supabase, router]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      setMessage(`Erro ao atualizar o perfil: ${error.message}`);
    } else {
      setMessage("Perfil atualizado com sucesso!");
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-6">Minha Conta</h1>
      <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="text"
            value={user.email}
            disabled
            className="w-full p-2 mt-1 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
          />
        </div>
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Nome Completo
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            placeholder="Seu nome aparecerá nos quizzes públicos"
          />
        </div>
        <button
          onClick={handleUpdateProfile}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          Salvar Alterações
        </button>
        {message && (
          <p className="text-sm text-center text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
}
