"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // CORREÇÃO: Pega o código da URL e transforma em uma sessão válida
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error("Erro ao validar sessão:", error.message);
        }
      });
    }
  }, [searchParams, supabase.auth]);

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setMessage("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      setMessage(`Erro: ${error.message}`);
    } else {
      setMessage("Senha atualizada com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Redefinir Senha
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block">
              Nova Senha
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Repita a nova senha"
            />
          </div>
          <button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="w-full py-2 px-4 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors disabled:bg-yellow-300"
          >
            {loading ? "Atualizando..." : "Salvar Nova Senha"}
          </button>
          {message && (
            <p className="text-center text-sm font-medium mt-2 text-blue-600">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// O Next.js exige que componentes que usam useSearchParams sejam envolvidos em um Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}