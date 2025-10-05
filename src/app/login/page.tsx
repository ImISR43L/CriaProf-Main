// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Alterna entre Login e Cadastro
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleAuthAction = async () => {
    setMessage("");
    if (isSignUp) {
      // --- CADASTRO ---
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setMessage(`Erro ao cadastrar: ${error.message}`);
      } else {
        setMessage(
          "Cadastro realizado! Verifique seu e-mail para confirmar a conta."
        );
      }
    } else {
      // --- LOGIN ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(`Erro ao fazer login: ${error.message}`);
      } else {
        // Redireciona para a página principal após o login
        router.push("/");
        router.refresh(); // Garante que o estado do servidor seja atualizado
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">
          {isSignUp ? "Criar Nova Conta" : "Acessar Conta"}
        </h1>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          onClick={handleAuthAction}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          {isSignUp ? "Cadastrar" : "Entrar"}
        </button>

        {message && (
          <p className="text-center text-sm text-red-500">{message}</p>
        )}

        <p className="text-sm text-center">
          {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 font-semibold text-blue-600 hover:underline"
          >
            {isSignUp ? "Faça login" : "Cadastre-se"}
          </button>
        </p>
      </div>
    </div>
  );
}
