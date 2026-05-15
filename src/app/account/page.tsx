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
  const [resetMessage, setResetMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return;
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

  // NOVA FUNÇÃO: Enviar link de redefinição de senha para quem já está logado
  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setResetMessage("");
    
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setResetMessage(`Erro: ${error.message}`);
    } else {
      setResetMessage("E-mail para redefinir senha enviado! Verifique sua caixa de entrada.");
    }
  };

  if (loading || user === undefined) return <Spinner />;

  return (
    <div className="container mx-auto p-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
        Minha Conta
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="text"
            value={user?.email || ""}
            disabled
            className="w-full p-2 mt-1 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed text-gray-500"
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
            className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="Seu nome aparecerá nos quizzes públicos"
          />
        </div>
        <button
          onClick={handleUpdateProfile}
          className="w-full py-2 px-4 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700 transition-colors"
        >
          Salvar Alterações
        </button>
        {message && (
          <p className="text-sm text-center text-green-600">{message}</p>
        )}

        {/* NOVA SEÇÃO: Redefinir Senha */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Segurança</h2>
          <button
            onClick={handleSendResetEmail}
            className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors"
          >
            Receber link para mudar senha
          </button>
          {resetMessage && (
            <p className="text-sm text-center mt-2 text-blue-600">
              {resetMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}