// src/app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleAuthAction = async () => {
    setMessage("");
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(`Erro ao cadastrar: ${error.message}`);
      } else {
        setMessage(
          "Cadastro realizado! Verifique seu e-mail para confirmar a conta."
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(`Erro ao fazer login: ${error.message}`);
      } else {
        router.push("/");
        router.refresh();
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen -mt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
          {isSignUp ? "Criar Nova Conta" : "Acessar Conta"}
        </h1>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="••••••••"
            />
          </div>
        </div>
        <button
          onClick={handleAuthAction}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          {isSignUp ? "Cadastrar" : "Entrar"}
        </button>
        {message && (
          <p className="text-center text-sm text-red-500">{message}</p>
        )}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isSignUp ? "Faça login" : "Cadastre-se"}
          </button>
        </p>
      </div>
    </div>
  );
}
