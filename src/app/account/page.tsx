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
    if (user === undefined) return; // Aguarda a definição do usuário
    if (user === null) {
      router.push("/login");
      return;
    }

    const getProfile = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data) setFullName(data.full_name || "");
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

  if (loading || user === undefined) return <Spinner />;

  return (
    <div className="container mx-auto p-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Minha Conta
      </h1>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="text"
            value={user?.email || ""}
            disabled
            className="w-full p-2 mt-1 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md cursor-not-allowed text-gray-500 dark:text-gray-400"
          />
        </div>
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nome Completo
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Seu nome aparecerá nos quizzes públicos"
          />
        </div>
        <button
          onClick={handleUpdateProfile}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          Salvar Alterações
        </button>
        {message && (
          <p className="text-sm text-center text-green-600 dark:text-green-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
